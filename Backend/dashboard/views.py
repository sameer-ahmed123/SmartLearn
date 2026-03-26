from django.shortcuts import get_object_or_404
from dashboard.video_progress_service import get_student_course_video_report
from dashboard.services import (
    format_teacher_stats,
    calculate_gpa,
    get_course_student_list_with_progress,
    get_student_leaderboard,
    get_student_performance_detail,
    get_submission_metrics,
    format_student_course_data,
    get_active_assignments,
    get_recent_quiz_performance,
    format_student_gradebook,
    get_teacher_gradebook,

)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from smartlearn_project.utils import get_letter_grade
from django.db.models import Avg, Count, Q, F
from django.contrib.auth import get_user_model
from django.apps import apps
from django.utils import timezone
from lectures.models import Lecture, Course, Enrollment, LectureProgress
from assessment.models import Assignment, Quiz, QuizSubmission, AssignmentSubmission

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_dashboard_metric(request):
    """
    Moved Heavy lifiting to Course and Lecture model managers
    in lectures/managers.py
    """
    user = request.user

    total_courses = Course.objects.filter(teacher=user).count()
    lec_stats = Lecture.objects.teacher_summary(user)

    return Response({
        "total_courses": total_courses,
        "total_lectures_generated": lec_stats['total_lectures'],
        "pending_validation_count": lec_stats['pending'],
        "total_validated_lectures": lec_stats['validated'],
        "lecture_validation_coverage": lec_stats['coverage'],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard_metric(request):
    """
    Moved the Aggrgation to CourseQuerySet in  Lectures/managers.py.
    """
    user = request.user

    summary = Course.objects.student_summary(user)
    stats = summary['stats']

    return Response({
        "enrolled_courses": stats['course_count'],
        "completed_lectures": stats['lec_count'],
        "completed_quizzes": stats['quiz_count'],
        "pending_assignments": stats['asg_count'],
        "full_name": getattr(user, 'full_name', user.username),
        "course_progress": summary['progress_data'],
        "message": "Student metrics fetched successfully"
    })


# ANALYTICS RELATED VIEWS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_analytics(request):
    """
    MOVED ALL DATABASE HITS TO CourseQuerySet manager in lectures/managers.py
    """

    teacher = request.user
    # fecth data
    data = Course.objects.teacher_analytics_summary(teacher)
    lec_summary = Lecture.objects.teacher_summary(teacher)

    # logic and calculations
    q_stats = data['quiz_stats']
    pass_rate = round(
        (q_stats['passed']/q_stats['total_done']*100)if q_stats['total_done'] > 0 else 0)

    # service for UI formating

    stats_cards = format_teacher_stats(
        data['total_students'],
        q_stats['avg_grade'] or 0,
        pass_rate,
        data['courses_qs'].count()
    )
    submissions = get_submission_metrics(data['asg_stats'], q_stats)

    student_progress = get_student_leaderboard(
        data['top_students_qs'], data['student_score_map'])

    # course list formatting
    course_list = sorted([
        {
            "name": c.title,
            "students": c.student_count,
            "score": round(data['course_score_map'].get(c.id, 0), 1)
        } for c in data['courses_qs']
    ], key=lambda x: x['score'], reverse=True)

    return Response({
        "stats": stats_cards,
        "lectureProgress": [
            {'name': 'Total',
                'value': lec_summary['total_lectures'], 'color': '#f59e0b'},
            {'name': 'Pending',
                'value': lec_summary['pending'], 'color': '#f43f5e'},
            {'name': 'Validated',
                'value': lec_summary['validated'], 'color': '#10b981'},
        ],
        "submissions": submissions,
        "courses": course_list,
        "studentProgress": student_progress,
        "passPercentage": pass_rate
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_analytics(request):
    user = request.user

    data = Course.objects.student_analytics_summary(user)

    courses_data = format_student_course_data(user, data['enrollments'])
    active_assignments = get_active_assignments(
        user, data['recent_assignments'])
    quiz_perf_data = get_recent_quiz_performance(data['recent_quiz_subs'])

    completion_rate = round(
        (data['completed_asg']/data['total_asg']*100), 1) if data['total_asg'] > 0 else 0

    return Response({
        "stats": {
            "completion": completion_rate,
            "completion_trend": "+2%",
            "avg_quiz": round(data['avg_quiz'], 1),
            "quiz_trend": "+5%",
            "study_hours": 12,
            "hours_trend": "+2h",
            # calculating Grade from Quiz average now .. later need to change to something else
            "grade": get_letter_grade(data['avg_quiz'])
        },
        "courses": courses_data,
        "quizzes_performance": quiz_perf_data,
        "assignments": active_assignments,
        "recommendations": [
            f"Review topics in {courses_data[0]['name']}" if courses_data else "Review your weak areas",
            "Complete pending quizzes to improve GPA",
            "Keep an eye on upcoming assignment deadlines"
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_gradebook_summary(request, course_id):
    teacher = request.user

    gradebook_data = get_teacher_gradebook(teacher, course_id)

    return Response(gradebook_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_gradebook_summary(request):
    user = request.user

    raw_data = Course.objects.student_gradebook_data(user)

    response_data = format_student_gradebook(raw_data, user)

    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_detail_report(request, student_id):
    teacher = request.user
    student = get_object_or_404(User, id=student_id)
    course_id = request.query_params.get('course_id')

    report_data = get_student_performance_detail(teacher, student, course_id)

    return Response(report_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_video_detail(request, student_id, course_id):
    teacher = request.user

    if not course_id:
        return Response({"error": "course_id is required"}, status=400)

    # Ensure the course belongs to this teacher
    course = get_object_or_404(Course, id=course_id, teacher=teacher)
    student = get_object_or_404(User, id=student_id)
    
    report = get_student_course_video_report(student,course)


    return Response(report)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_students(request, course_id):
    student_data = get_course_student_list_with_progress(course_id)
    return Response(student_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_courses(request):
    # Fetch courses owned by the logged-in teacher
    courses = Course.objects.filter(teacher=request.user)
    data = [{"id": c.id, "title": c.title} for c in courses]
    return Response(data)
