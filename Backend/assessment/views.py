from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from assessment.models import Assignment, Quiz, QuizSubmission, AssignmentSubmission
from assessment.serialzers import (
    AssignmentSerializer, QuizSerializer, 
    AssignmentSubmissionSerializer, QuizSubmissionSerializer
)
from users.permissions import IsCourseOwner
from .tasks import generate_assessment_task

# === REFACTORED: IMPORTING NEW GRADING SERVICES ===
from assessment.grading_service import (
    process_quiz_submission, 
    process_assignment_submission
)

# ===========================================================
# GENERAL / TRIGGER VIEWS
# ===========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCourseOwner])
def generate_assessment_trigger(request):
    lecture_id = request.data.get('lecture_id')
    assessment_type = request.data.get('type')

    if not lecture_id or not assessment_type:
        return Response({"error": "lecture_id and type are required"}, status=400)

    generate_assessment_task.delay(lecture_id, assessment_type)
    return Response({"message": f"{assessment_type.capitalize()} generation started."}, status=202)


# ===========================================================
# QUIZ RELATED VIEWS (STUDENT & TEACHER)
# ===========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quiz_list(request):
    user = request.user
    quizzes = Quiz.objects.student_dashboard(user)
    
    # Get all submissions for this user at once to avoid heavy DB hits in the loop
    submissions = QuizSubmission.objects.filter(user=user).select_related('quiz')
    submission_map = {sub.quiz_id: sub for sub in submissions}

    quiz_list = []
    for quiz in quizzes:
        submission = submission_map.get(quiz.id)
        is_completed = submission is not None
        
        # Get count from the JSON list
        total_questions = len(quiz.quiz_data) if isinstance(quiz.quiz_data, list) else 0
        
        score_display = None
        if is_completed:
            # sub.score is a float/int percentage (e.g., 80.0)
            correct_count = round((submission.score / 100) * total_questions)
            score_display = f"{correct_count} / {total_questions}"

        quiz_list.append({
            "id": quiz.id,
            "title": quiz.lecture.topic,
            "course_name": quiz.lecture.content_source.course.title,
            "duration": "15 min",
            "status": "Completed" if is_completed else "Pending",
            "score": score_display,
            "questions_count": total_questions, # Helpful to keep for UI
            "due_date": "Active"
        })

    stats = Quiz.objects.get_student_stats(user)
    return Response({"quizzes": quiz_list, "stats": stats})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_score(request, quiz_id):
    """
    === REFACTORED: USING process_quiz_submission SERVICE ===
    Logic for grading and updating/creating records moved to Service.
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    student_answers = request.data.get('student_answers')

    if student_answers is None:
        return Response({"error": "No answers provided"}, status=400)

    result = process_quiz_submission(request.user, quiz, student_answers)
    
    return Response({
        "message": "Score calculated successfully",
        "score": result['score'],
        "correct_count": result['correct_count'],
        "total_questions": result['total']
    }, status=201)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def quiz_detail_update(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    user = request.user
    course = quiz.lecture.content_source.course

    is_teacher = course.teacher == user
    is_enrolled = course.enrollments.filter(student=user).exists()

    if request.method == 'GET':
        if not (is_teacher or is_enrolled):
            return Response({"error": "Access Denied"}, status=403)
        return Response(QuizSerializer(quiz, context={'request': request}).data)

    elif request.method in ['PUT', 'PATCH']:
        if not is_teacher: return Response({"error": "Teacher only"}, status=403)
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_quiz_list(request):
    """=== REFACTORED: USING Quiz.objects.teacher_dashboard() ==="""
    quizzes = Quiz.objects.teacher_dashboard(request.user)
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_detail_by_lecture(request, lecture_id):
    quiz = get_object_or_404(Quiz, lecture_id=lecture_id)
    return Response({"id": quiz.id, "lecture_topic": quiz.lecture.topic, "quiz_data": quiz.quiz_data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_submissions(request, quiz_id):
    submissions = QuizSubmission.objects.filter(quiz_id=quiz_id).select_related('user')
    return Response(QuizSubmissionSerializer(submissions, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def teacher_quiz_update_score(request, id=None):
    submission = get_object_or_404(QuizSubmission, id=id)
    new_score = request.data.get('score')
    if new_score is None: return Response({"error": "Required"}, status=400)

    submission.score = float(new_score)
    submission.is_graded = True
    submission.is_overridden = True
    submission.save()
    return Response(QuizSubmissionSerializer(submission).data)


# ===========================================================
# ASSIGNMENT RELATED VIEWS (STUDENT & TEACHER)
# ===========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_list(request):
    """=== REFACTORED: USING Assignment.objects.student_dashboard() ==="""
    user = request.user
    assignments = Assignment.objects.student_dashboard(user)
    submissions = AssignmentSubmission.objects.filter(user=user)

    assignment_list = []
    completed = 0
    graded = 0

    for asm in assignments:
        
        sub = submissions.filter(assignment=asm).first()
        status_val, score_val = "Pending", None

        if sub:
            completed += 1
            status_val = "Graded" if sub.score is not None else "Submitted"
            score_val = sub.score
            if sub.score is not None: graded += 1

        assignment_list.append({
            "id": asm.id,
            "title": asm.assignment_data.get('title', 'Assignment') if isinstance(asm.assignment_data, dict) else "Assignment",
            "course": asm.lecture.content_source.course.title,
            "deadline": asm.deadline or asm.created_at,
            "status": status_val,
            "score": score_val,
            "assignment_data": asm.assignment_data
        })

    stats = {"total": assignments.count(), "completed": completed, "pending": assignments.count() - completed, "graded": graded}
    return Response({"assignments": assignment_list, "stats": stats})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request, assignment_id):
    """
    === REFACTORED: USING process_assignment_submission SERVICE ===
    File handling, text extraction, and AI grading logic extracted to Service.
    """
    assignment = get_object_or_404(Assignment, id=assignment_id)
    if assignment.deadline and timezone.now() > assignment.deadline:
        return Response({"error": "Deadline passed"}, status=400)

    file_obj = request.FILES.get('file_upload')
    if not file_obj: return Response({"error": "No file"}, status=400)

    try:
        submission = process_assignment_submission(request.user, assignment, file_obj)
        return Response({
            "message": "Assignment graded by AI",
            "submission": {"score": submission.score, "feedback": submission.feedback}
        }, status=201)
    except Exception as e:
        return Response({"message": "Auto-grading failed. Manual review required.", "error": str(e)}, status=201)


# (REFACTORED)
# ===========================================================

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def assignment_detail_update(request, assignment_id):
    """
    === REFACTORED: USING Assignment.objects.can_access() ===
    Permissions and data fetching are now handled by the Manager 
    to keep the view clean and avoid repetitive 'if' checks.
    """
    user = request.user
    
    # 1. FETCH & CHECK PERMISSIONS VIA MANAGER
    assignment, has_access = Assignment.objects.can_access(user, assignment_id)
    
    if not assignment:
        return Response({"error": "Assignment not found"}, status=404)
    if not has_access:
        return Response({"error": "Permission denied"}, status=403)

    is_teacher = assignment.lecture.content_source.course.teacher == user

    # --- GET: Fetch Detail & User Submission ---
    if request.method == 'GET':
        # We pass the user to the serializer context to handle 
        # 'user_submission' logic internally if needed.
        serializer = AssignmentSerializer(assignment, context={'request': request})
        data = serializer.data
        
        sub = AssignmentSubmission.objects.filter(user=user, assignment=assignment).first()
        data['user_submission'] = {
            "score": sub.score if sub and sub.score is not None else 0,
            "feedback": sub.feedback if sub else "No feedback available yet.",
            "submitted_at": sub.submitted_at if sub else None
        } if sub else None
        
        return Response(data)

    # --- PUT/PATCH: Teacher Updates ---
    elif request.method in ['PUT', 'PATCH']:
        if not is_teacher:
            return Response({"error": "Only the course teacher can edit this."}, status=403)
            
        serializer = AssignmentSerializer(assignment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_assignment_list(request):
    """=== REFACTORED: USING Assignment.objects.teacher_dashboard() ==="""
    assignments = Assignment.objects.teacher_dashboard(request.user)
    
    data = [{
        "id": a.id, "lecture_id": a.lecture.id, "title": a.assignment_data.get('title', 'Untitled'),
        "course_name": a.lecture.content_source.course.title, "submission_count": a.sub_count,
        "type": "assignment", "status": a.status, "deadline": a.deadline
    } for a in assignments]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture_submissions(request, lecture_id):
    assignment = get_object_or_404(Assignment, lecture_id=lecture_id)
    submissions = AssignmentSubmission.objects.filter(assignment=assignment).select_related('user')
    return Response({
        "assignment": assignment.assignment_data, 
        "submissions": AssignmentSubmissionSerializer(submissions, many=True, context={'request': request}).data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def teacher_assignment_update_score(request, id=None):
    submission = get_object_or_404(AssignmentSubmission, id=id)
    new_score = request.data.get('score')
    if new_score is not None:
        submission.score = int(new_score)
        submission.is_graded, submission.is_overridden = True, True
        submission.save()
        return Response(AssignmentSubmissionSerializer(submission).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_assignment_submission(request, submission_id):
    """Manual teacher grading view"""
    submission = get_object_or_404(AssignmentSubmission, id=submission_id)
    submission.score = request.data.get('score')
    submission.feedback = request.data.get('feedback', '')
    submission.save()
    return Response({"message": "Graded successfully", "score": submission.score})