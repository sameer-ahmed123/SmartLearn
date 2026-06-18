import json
import PyPDF2
import docx
import google.generativeai as genai
from django.conf import settings


def calculate_quiz_score(quiz_data, student_answers):
    """
    Parses the JSON quiz data and compares it against student answers.
    Returns: (correct_count, total_questions, final_score_percentage)
    """
    if isinstance(quiz_data, str):
        quiz_data = json.loads(quiz_data)
    if isinstance(quiz_data, dict) and 'questions' in quiz_data:
        quiz_data = quiz_data['questions']

    total_questions = len(quiz_data)
    correct_count = 0

    def clean_text(text):
        return str(text).strip().lower().rstrip('.') if text is not None else ""

    for index, question in enumerate(quiz_data):
        raw_selection = student_answers.get(str(index))
        selected_option = clean_text(raw_selection)

        correct_option_text = ""
        options = question.get('options', [])
        correct_idx = question.get('correct_index')

        # Find the correct answer text based on the index
        if correct_idx is not None:
            try:
                target_opt = options[int(correct_idx)]
                correct_option_text = clean_text(target_opt.get(
                    'text') if isinstance(target_opt, dict) else target_opt)
            except (IndexError, ValueError):
                pass

        # Fallback 1: Look for 'isCorrect' flag
        if not correct_option_text:
            for opt in options:
                if isinstance(opt, dict) and str(opt.get('isCorrect')).lower() == "true":
                    correct_option_text = clean_text(opt.get('text'))
                    break

        # Fallback 2: Look for 'correct_answer' direct string
        if not correct_option_text:
            ca = question.get('correct_answer') or question.get('answer')
            if ca:
                correct_option_text = clean_text(ca)

        # Compare
        if selected_option and selected_option == correct_option_text:
            correct_count += 1

    final_score = (correct_count / total_questions) * \
        100 if total_questions > 0 else 0
    return correct_count, total_questions, round(final_score, 2)


def extract_text_from_file(file_obj):
    extracted_text = ""
    file_name = file_obj.name.lower()

    # CRITICAL: Reset file pointer to start before reading
    file_obj.seek(0)

    if file_name.endswith('.pdf'):
        try:
            reader = PyPDF2.PdfReader(file_obj)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text
        except Exception as e:
            print(f"PDF Extraction error: {e}")

    elif file_name.endswith('.docx'):
        # python-docx works with file-like objects
        try:
            doc = docx.Document(file_obj)
            extracted_text = "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            print(f"DOCX Extraction error: {e}")

    elif file_name.endswith('.doc'):
        # NOTE: python-docx DOES NOT support .doc (legacy binary format)
        # You would need a library like 'antiword' or 'textract' for this.
        # For now, let's throw a clear error or skip.
        raise ValueError(
            "Legacy .doc format not supported. Please upload a .docx file.")

    else:
        # Fallback for .txt or other raw text files
        try:
            extracted_text = file_obj.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Text Extraction error: {e}")
    
    return extracted_text


def grade_assignment_with_ai(rubric, tasks, student_text):
    # 1. Re-initialize and specify the stable API version if possible
    genai.configure(api_key=settings.GEMINI_API_KEY)

    # 2. Use 'gemini-1.5-flash-latest' which often maps more reliably in v1beta
    # than just 'gemini-1.5-flash'
    model_id = 'models/gemini-2.5-flash'

    try:
        model = genai.GenerativeModel(
            model_name=model_id,
            # Forcing JSON output mode helps avoid parsing errors later
            generation_config={"response_mime_type": "application/json"}
        )

        # 🔥 Prompt updated with aggressive AI-text patterns analysis instructions
        prompt = f"""
        You are an elite academic evaluator and an advanced AI-text and plagiarism detection system.
        Grade this student assignment based on the provided tasks and rubric.
        Tasks: {tasks}
        Rubric: {rubric}
        Student Work Content: {student_text}

        CRITICAL PLAGIARISM & AI-DETECTION INSTRUCTIONS:
        1. Perform a microscopic analysis on 'Student Work Content' for any patterns of AI generation. This includes looking for overly smooth/predictable phrasing, lack of natural human structural variance, standard chat-style list transitions, common LLM vocabulary headers, or text directly synthesized by an AI assistant like ChatGPT, Claude, or Gemini itself.
        2. Assign an exact 'plagiarism_percentage' from 0 to 100 based on your strict analysis. If the text exhibits clear signs of being entirely or mostly AI-generated, this value MUST be high (e.g., 75% to 100%).
        3. Set 'is_plagiarized' to true if the 'plagiarism_percentage' is greater than 30%.
        
        STRICT GRADING & OVERRIDE RULE:
        - If 'is_plagiarized' is true OR if individual questions/tasks are flagged as AI-generated, you MUST dynamically set the marks for those specific plagiarized questions/tasks to 0.
        - Calculate the final total 'score' reflecting these dynamic deductions. If the entire document is AI-generated, the final total 'score' MUST be 0.
        - In the 'feedback', keep your thorough task evaluation context intact, but prepended or appended with a clear message indicating the exact percentage of AI text/plagiarism detected and the penalty applied.

        Return ONLY a valid JSON object matching this structure: 
        {{
            "score": 0, 
            "feedback": "Your detailed grading feedback here. Clearly state AI/plagiarism findings if detected.",
            "plagiarism_percentage": 95,
            "is_plagiarized": true
        }}
        """

        response = model.generate_content(prompt)

        # With response_mime_type, response.text should be clean JSON
        return json.loads(response.text)

    except Exception as e:
        # This will catch the 404 and print the details
        print(f"AI Grading Error Details: {e}")
        return {
            "score": 0, 
            "feedback": "Grading service temporarily unavailable.",
            "plagiarism_percentage": 0,
            "is_plagiarized": False
        }