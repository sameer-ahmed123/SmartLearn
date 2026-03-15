from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from assessment.models import Assignment, Quiz, QuizSubmission, AssignmentSubmission
from assessment.serialzers import AssignmentSerializer, QuizSerializer, AssignmentSubmissionSerializer, QuizSubmissionSerializer
from users.permissions import IsCourseOwner
from rest_framework.response import Response
from rest_framework import status
from .tasks import generate_assessment_task
from django.utils import timezone
from django.db.models import  Count
from django.contrib.auth import get_user_model
import json
from django.conf import settings
from assessment.services import calculate_quiz_score,extract_text_from_file,grade_assignment_with_ai

try:
    from courses.models import Enrollment
except ImportError:
    Enrollment = None
from django.apps import apps # Add this import at the top of the file
User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCourseOwner])
def generate_assessment_trigger(request):
    """
    Payload example: { "lecture_id": 123, "type": "quiz" }
    """
    lecture_id = request.data.get('lecture_id')
    assessment_type = request.data.get('type')  # 'quiz' or 'assignment'

    if not lecture_id or not assessment_type:
        return Response({"error": "lecture_id and type are required"}, status=status.HTTP_400_BAD_REQUEST)

    # start the celery worker
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
    is_enrolled = quiz.lecture.content_source.course.enrollments.filter(
        student=user).exists()

    if request.method == 'GET':
        if not (is_teacher or is_enrolled):
            return Response({"error": "You do not have permission to view this quiz."}, status=403)

        # --- UPDATED: Added context to fetch user_score correctly ---
        serializer = QuizSerializer(quiz, context={'request': request})
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
    is_enrolled = assignment.lecture.content_source.course.enrollments.filter(
        student=user).exists()

    if request.method == 'GET':
        if not (is_teacher or is_enrolled):
            return Response({"error": "Permission denied."}, status=403)

        submission = AssignmentSubmission.objects.filter(
            user=user, assignment=assignment).first()
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

        serializer = AssignmentSerializer(
            assignment, data=request.data, partial=True)
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

    submitted_quiz_ids = QuizSubmission.objects.filter(
        user=user).values_list('quiz_id', flat=True)

    quiz_list = []
    completed_count = 0

    for quiz in quizzes:
        is_completed = quiz.id in submitted_quiz_ids
        score_val = None
        if is_completed:
            submission = QuizSubmission.objects.filter(
                user=user, quiz=quiz).first()
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

    stats = {"assigned": quizzes.count(), "completed": completed_count,
             "avgScore": 15.6, "pending": quizzes.count() - completed_count}
    return Response({"quizzes": quiz_list, "stats": stats})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_score(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    student_answers = request.data.get('student_answers')

    if student_answers is None:
        return Response({"error": "No answers provided"}, status=400)

    #Calculation logic services file me 
    correct_count, total_questions, final_score = calculate_quiz_score(quiz.quiz_data, student_answers)

    submission, created = QuizSubmission.objects.update_or_create(
        user=request.user,
        quiz=quiz,
        defaults={'score': final_score}
    )

    return Response({
        "message": "Score calculated successfully",
        "score": final_score,
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

    stats = {"total": assignments.count(), "completed": completed_count,
             "pending": assignments.count() - completed_count, "graded": graded_count}
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

    # 1. Save the file to database 
    submission, created = AssignmentSubmission.objects.update_or_create(
        user=request.user,
        assignment=assignment,
        defaults={'file_upload': file_obj}
    )

    try:
        # 2. Extract Text moved to services.py
        extracted_text = extract_text_from_file(file_obj)

        # 3. Grade with AI moved to services.py
        rubric = assignment.assignment_data.get('rubric', [])
        tasks = assignment.assignment_data.get('tasks', [])
        
        ai_result = grade_assignment_with_ai(rubric, tasks, extracted_text)

        # 4. Save results
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
            "message": "Submitted successfully, but AI auto-grading failed. A teacher will review it manually.",
            "error_detail": str(e)
        }, status=201)
        
        
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def teacher_assignment_update_score(request, id=None):
    submission = get_object_or_404(AssignmentSubmission, id=id)
    new_score = request.data.get('score')
    
    if new_score is not None:
        submission.score = int(new_score)
        submission.is_graded = True
        submission.is_overridden = True  # <--- Logic: Human has touched this
        submission.save()
        
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_assignment_list(request):
    user = request.user
    
    # 1. OPTIMIZATION: Fetch assignments AND count their submissions in ONE single query
    # Using 'assignmentsubmission' which is Django's default reverse relation name
    assignments = Assignment.objects.filter(
        lecture__content_source__course__teacher=user
    ).select_related(
        'lecture__content_source__course', 'lecture'
    ).annotate(
        # The database does the counting for us and attaches it to 'sub_count'
        sub_count=Count('assignmentsubmission', distinct=True) 
    )
    
    assignment_list = []

    for asm in assignments:
        # 2. No more database hits inside this loop! We just read the annotated 'sub_count'
        title = asm.assignment_data.get('title', 'Assignment') if isinstance(
            asm.assignment_data, dict) else "Untitled"
            
        assignment_list.append({
            "id": asm.id,
            "lecture_id": asm.lecture.id,
            "title": title,
            "course_name": asm.lecture.content_source.course.title,
            "submission_count": asm.sub_count, # Fast memory read
            "type": "assignment",
            "status": asm.status,
            "deadline": asm.deadline,
            "created_at": asm.created_at
        })
        
    return Response(assignment_list)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_quiz_list(request):
    user = request.user
    
    # 1. OPTIMIZATION: Fetch quizzes and count their submissions in ONE query
    # We use 'quizsubmission' (Django's default reverse relation name)
    quizzes = Quiz.objects.filter(
        lecture__content_source__course__teacher=user
    ).select_related(
        'lecture__content_source__course', 'lecture'
    ).annotate(
        # The database does the heavy lifting and attaches 'sub_count' to each quiz
        sub_count=Count('quizsubmission', distinct=True)
    )
    
    quiz_list = []

    for quiz in quizzes:
        # In-memory JSON parsing (This is fine, no database hit here)
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
            "submission_count": quiz.sub_count,  # Fast memory read! No DB hit.
            "questions_count": q_count,
            "type": "quiz",
            "status": quiz.status,
            "created_at": quiz.created_at
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
    submissions = QuizSubmission.objects.filter(
        quiz_id=quiz_id).select_related('user')
    serializer = QuizSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture_submissions(request, lecture_id):
    assignment = get_object_or_404(Assignment, lecture_id=lecture_id)
    submissions = AssignmentSubmission.objects.filter(
        assignment=assignment).select_related('user')
    serializer = AssignmentSubmissionSerializer(
        submissions, many=True, context={'request': request})
    return Response({"assignment": assignment.assignment_data, "submissions": serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_assignment_submission(request, submission_id):
    submission = get_object_or_404(AssignmentSubmission, id=submission_id)
    submission.score = request.data.get('score')
    submission.feedback = request.data.get('feedback', '')
    submission.save()
    return Response({"message": "Graded successfully", "score": submission.score})


