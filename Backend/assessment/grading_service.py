from .models import QuizSubmission, AssignmentSubmission
from .services import calculate_quiz_score, extract_text_from_file, grade_assignment_with_ai

def process_quiz_submission(user, quiz, student_answers,is_flagged=False):
    """
    Calculates the score and saves/updates the submission record.
    Reused by the 'submit_quiz_score' view.
    """
    # 1. Use the math logic from your existing services.py
    correct_count, total_questions, final_score = calculate_quiz_score(
        quiz.quiz_data, student_answers
    )

    # 2. Save the result
    submission, created = QuizSubmission.objects.update_or_create(
        user=user,
        quiz=quiz,
        defaults={
            'score': final_score,
            'answers_data': student_answers,
            'is_graded': True,
            'is_flagged': is_flagged
        }
    )
    
    return {
        "score": final_score,
        "correct_count": correct_count,
        "total": total_questions,
        "submission": submission
    }

def process_assignment_submission(user, assignment, file_obj):
    """
    Handles file saving, text extraction, and AI grading in one flow.
    Reused by the 'submit_assignment' view.
    """
    # 1. Save File
    submission, _ = AssignmentSubmission.objects.update_or_create(
        user=user,
        assignment=assignment,
        defaults={'file_upload': file_obj}
    )

    # 2. Extract & Grade
    extracted_text = extract_text_from_file(submission.file_upload)
    
    if not extracted_text.strip():
        raise ValueError("Document appears empty or unreadable.")

    rubric = assignment.assignment_data.get('rubric', [])
    tasks = assignment.assignment_data.get('tasks', [])
    
    # 3. Call AI
    ai_result = grade_assignment_with_ai(rubric, tasks, extracted_text)

    # 4. Final Save
    submission.score = ai_result.get('score', 0)
    submission.feedback = ai_result.get('feedback', 'No feedback provided.')
    submission.save()
    
    return submission