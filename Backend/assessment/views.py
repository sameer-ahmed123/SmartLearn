from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from assessment.models import Assignment, Quiz, QuizSubmission, AssignmentSubmission
from assessment.serialzers import AssignmentSerializer, QuizSerializer, AssignmentSubmissionSerializer
from users.permissions import IsCourseOwner
from rest_framework.response import Response
from rest_framework import status
from .tasks import generate_assessment_task
from django.utils import timezone
import json
import PyPDF2  # PDF text extraction ke liye
import docx     # Word file text extraction ke liye
import google.generativeai as genai  # AI Grading ke liye
from django.conf import settings

@api_view(['POST'])
@permission_classes([IsAuthenticated,IsCourseOwner])
def generate_assessment_trigger(request):
    """
    Payload example: { "lecture_id": 123, "type": "quiz" }
    """
    lecture_id = request.data.get('lecture_id')
    assessment_type = request.data.get('type') # 'quiz' or 'assignment'

    if not lecture_id or not assessment_type:
        return Response({"error": "lecture_id and type are required"}, status=status.HTTP_400_BAD_REQUEST)

    #start the celery worker
    generate_assessment_task.delay(lecture_id, assessment_type)

    return Response(
        {"message": f"{assessment_type.capitalize()} generation started."}, 
        status=status.HTTP_202_ACCEPTED
    )

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def quiz_detail_update(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    user = request.user
    
    is_teacher = quiz.lecture.content_source.course.teacher == user
    is_enrolled = quiz.lecture.content_source.course.enrollments.filter(student=user).exists()

    if request.method == 'GET':
        if not (is_teacher or is_enrolled):
            return Response({"error": "You do not have permission to view this quiz."}, status=403)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        if not is_teacher:
            return Response({"error": "Only teachers can edit this quiz."}, status=403)
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def assignment_detail_update(request, assignment_id):
    assignment = get_object_or_404(Assignment, id=assignment_id)
    user = request.user
    
    is_teacher = assignment.lecture.content_source.course.teacher == user
    is_enrolled = assignment.lecture.content_source.course.enrollments.filter(student=user).exists()

    if request.method == 'GET':
        if not (is_teacher or is_enrolled):
            return Response({"error": "Permission denied."}, status=403)
        
        submission = AssignmentSubmission.objects.filter(user=user, assignment=assignment).first()
        serializer = AssignmentSerializer(assignment)
        
        data = serializer.data
        if submission:
            data['user_submission'] = {
                "score": submission.score if submission.score is not None else 0,
                "feedback": submission.feedback or "No feedback available yet.",
                "submitted_at": submission.submitted_at
            }
        else:
            data['user_submission'] = None
            
        return Response(data)

    elif request.method in ['PUT', 'PATCH']:
        if not is_teacher:
            return Response({"error": "Permission denied."}, status=403)
        serializer = AssignmentSerializer(assignment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quiz_list(request):
    user = request.user
    quizzes = Quiz.objects.filter(
        status='published',
        lecture__content_source__course__enrollments__student=user
    ).select_related('lecture__content_source__course')

    submitted_quiz_ids = QuizSubmission.objects.filter(user=user).values_list('quiz_id', flat=True)

    quiz_list = []
    completed_count = 0

    for quiz in quizzes:
        is_completed = quiz.id in submitted_quiz_ids
        score_val = None
        if is_completed:
            submission = QuizSubmission.objects.filter(user=user, quiz=quiz).first()
            score_val = f"{submission.score}%" if submission else "N/A"
            completed_count += 1

        quiz_list.append({
            "id": quiz.id,
            "title": quiz.lecture.topic,
            "course_name": quiz.lecture.content_source.course.title,
            "questions_count": len(quiz.quiz_data) if quiz.quiz_data else 0,
            "duration": "15 min",
            "status": "Completed" if is_completed else "Pending",
            "score": score_val,
            "due_date": "Active"
        })

    stats = {"assigned": quizzes.count(), "completed": completed_count, "avgScore": 0, "pending": quizzes.count() - completed_count}
    return Response({"quizzes": quiz_list, "stats": stats})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_score(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    student_answers = request.data.get('student_answers')

    if student_answers is None:
        return Response({"error": "No answers provided"}, status=400)

    quiz_data = quiz.quiz_data
    if isinstance(quiz_data, str):
        quiz_data = json.loads(quiz_data)
    
    if isinstance(quiz_data, dict) and 'questions' in quiz_data:
        quiz_data = quiz_data['questions']

    total_questions = len(quiz_data)
    correct_count = 0

    def clean_text(text):
        if text is None: return ""
        return str(text).strip().lower().rstrip('.')

    for index, question in enumerate(quiz_data):
        raw_selection = student_answers.get(str(index))
        selected_option = clean_text(raw_selection)
        
        correct_option_text = ""
        options = question.get('options', [])
        
        correct_idx = question.get('correct_index')
        if correct_idx is not None:
            try:
                target_opt = options[int(correct_idx)]
                correct_option_text = clean_text(target_opt.get('text') if isinstance(target_opt, dict) else target_opt)
            except (IndexError, ValueError):
                pass

        if not correct_option_text:
            for opt in options:
                if isinstance(opt, dict):
                    is_corr = opt.get('isCorrect')
                    if is_corr is True or str(is_corr).lower() == "true":
                        correct_option_text = clean_text(opt.get('text'))
                        break
        
        if not correct_option_text:
            ca = question.get('correct_answer') or question.get('answer')
            if ca:
                correct_option_text = clean_text(ca)

        if selected_option and selected_option == correct_option_text:
            correct_count += 1
        
    final_score = (correct_count / total_questions) * 100 if total_questions > 0 else 0

    submission, created = QuizSubmission.objects.update_or_create(
        user=request.user,
        quiz=quiz,
        defaults={'score': round(float(final_score), 2)}
    )

    return Response({
        "message": "Score calculated successfully",
        "score": round(final_score, 2),
        "correct_count": correct_count,
        "total_questions": total_questions
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_list(request):
    user = request.user
    assignments = Assignment.objects.filter(
        status='published',
        lecture__content_source__course__enrollments__student=user
    ).select_related('lecture__content_source__course')

    submissions = AssignmentSubmission.objects.filter(user=user)
    assignment_list = []
    graded_count = 0
    completed_count = 0

    for asm in assignments:
        sub = submissions.filter(assignment=asm).first()
        status_val = "Pending"
        score_val = None
        
        if sub:
            completed_count += 1
            status_val = "Submitted"
            if sub.score is not None:
                status_val = "Graded"
                score_val = sub.score
                graded_count += 1

        assignment_list.append({
            "id": asm.id,
            "title": asm.assignment_data.get('title', 'Assignment') if isinstance(asm.assignment_data, dict) else "Assignment",
            "course": asm.lecture.content_source.course.title,
            "deadline": asm.deadline if asm.deadline else asm.created_at,
            "status": status_val,
            "score": score_val,
            "assignment_data": asm.assignment_data
        })

    stats = {"total": assignments.count(), "completed": completed_count, "pending": assignments.count() - completed_count, "graded": graded_count}
    return Response({"assignments": assignment_list, "stats": stats})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request, assignment_id):
    assignment = get_object_or_404(Assignment, id=assignment_id)
    
    if assignment.deadline and timezone.now() > assignment.deadline:
        return Response({"error": "The deadline has passed."}, status=400)

    file_obj = request.FILES.get('file_upload')
    if not file_obj:
        return Response({"error": "No file uploaded"}, status=400)

    submission, created = AssignmentSubmission.objects.update_or_create(
        user=request.user,
        assignment=assignment,
        defaults={'file_upload': file_obj}
    )

    try:
        extracted_text = ""
        # Handle PDF
        if file_obj.name.endswith('.pdf'):
            reader = PyPDF2.PdfReader(file_obj)
            for page in reader.pages:
                extracted_text += page.extract_text()
        # Handle Word (.docx)
        elif file_obj.name.endswith('.docx'):
            doc = docx.Document(file_obj)
            extracted_text = "\n".join([p.text for p in doc.paragraphs])
        # Handle Text
        else:
            file_obj.seek(0)
            extracted_text = file_obj.read().decode('utf-8', errors='ignore')

        # --- AI CONFIGURATION ---
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Dyanmic model discovery to avoid 404
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        # Priority: flash -> pro -> first available
        target_model = 'models/gemini-1.5-flash'
        if target_model not in available_models:
            if 'models/gemini-pro' in available_models:
                target_model = 'models/gemini-pro'
            elif available_models:
                target_model = available_models[0]

        model = genai.GenerativeModel(target_model)
        
        rubric = assignment.assignment_data.get('rubric', [])
        tasks = assignment.assignment_data.get('tasks', [])
        
        prompt = f"""
        Grade this student assignment based on the provided tasks and rubric.
        Tasks: {tasks}
        Rubric: {rubric}
        Student Work Content: {extracted_text}
        Return ONLY a JSON object in this format: {{"score": <number>, "feedback": "<string>"}}
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        ai_result = json.loads(response_text.strip())
        
        submission.score = ai_result.get('score', 0)
        submission.feedback = ai_result.get('feedback', 'No feedback provided.')
        submission.save()

        return Response({
            "message": "Assignment graded by AI",
            "submission": {"score": submission.score, "feedback": submission.feedback}
        }, status=201)

    except Exception as e:
        print(f"AI Grading Error: {e}")
        return Response({
            "message": "Submitted, but AI grading failed.",
            "error_detail": str(e)
        }, status=201)

# --- TEACHER VIEWS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_assignment_list(request):
    user = request.user
    assignments = Assignment.objects.filter(lecture__content_source__course__teacher=user).select_related('lecture__content_source__course', 'lecture')
    assignment_list = []

    for asm in assignments:
        sub_count = AssignmentSubmission.objects.filter(assignment=asm).count()
        title = asm.assignment_data.get('title', 'Assignment') if isinstance(asm.assignment_data, dict) else "Untitled"
        assignment_list.append({
            "id": asm.id, 
            "lecture_id": asm.lecture.id, 
            "title": title,
            "course_name": asm.lecture.content_source.course.title, 
            "submission_count": sub_count, 
            "type": "assignment",
            "status": asm.status,
            "deadline": asm.deadline, # Added for date display
            "created_at": asm.created_at # Fallback date
        })
    return Response(assignment_list)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_quiz_list(request):
    user = request.user
    quizzes = Quiz.objects.filter(lecture__content_source__course__teacher=user).select_related('lecture__content_source__course', 'lecture')
    quiz_list = []

    for quiz in quizzes:
        sub_count = QuizSubmission.objects.filter(quiz=quiz).count()
        
        q_count = 0
        if quiz.quiz_data:
            if isinstance(quiz.quiz_data, dict) and 'questions' in quiz.quiz_data:
                q_count = len(quiz.quiz_data['questions'])
            elif isinstance(quiz.quiz_data, list):
                q_count = len(quiz.quiz_data)

        quiz_list.append({
            "id": quiz.id, 
            "lecture_id": quiz.lecture.id, 
            "title": quiz.lecture.topic,
            "course_name": quiz.lecture.content_source.course.title, 
            "submission_count": sub_count, 
            "questions_count": q_count,     
            "type": "quiz",
            "status": quiz.status,
            "created_at": quiz.created_at # Yeh line date fix karegi
        })
    return Response(quiz_list)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_detail_by_lecture(request, lecture_id):
    quiz = get_object_or_404(Quiz, lecture_id=lecture_id)
    return Response({"id": quiz.id, "lecture_topic": quiz.lecture.topic, "quiz_data": quiz.quiz_data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_submissions(request, quiz_id):
    submissions = QuizSubmission.objects.filter(quiz_id=quiz_id).select_related('user')
    data = [{"id": sub.id, "user_name": sub.user.username, "score": sub.score, "submitted_at": sub.submitted_at} for sub in submissions]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture_submissions(request, lecture_id):
    assignment = get_object_or_404(Assignment, lecture_id=lecture_id)
    submissions = AssignmentSubmission.objects.filter(assignment=assignment).select_related('user')
    serializer = AssignmentSubmissionSerializer(submissions, many=True, context={'request': request})
    return Response({"assignment": assignment.assignment_data, "submissions": serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_assignment_submission(request, submission_id):
    submission = get_object_or_404(AssignmentSubmission, id=submission_id)
    submission.score = request.data.get('score')
    submission.feedback = request.data.get('feedback', '')
    submission.save()
    return Response({"message": "Graded successfully", "score": submission.score})