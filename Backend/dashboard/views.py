from django.shortcuts import get_object_or_404
from dashboard.services import (
    format_teacher_stats,
    calculate_gpa,
    get_student_leaderboard,
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

    asg_filter = {'user': student,
                  'assignment__lecture__content_source__course__teacher': teacher}
    quiz_filter = {'user': student,
                   'quiz__lecture__content_source__course__teacher': teacher}

    if course_id:
        asg_filter['assignment__lecture__content_source__course_id'] = course_id
        quiz_filter['quiz__lecture__content_source__course_id'] = course_id

    assignments = AssignmentSubmission.objects.filter(
        **asg_filter).select_related('assignment__lecture')
    asg_list = [{"title": sub.assignment.lecture.topic if (sub.assignment and sub.assignment.lecture) else "Assignment", "score": sub.score or 0,
                 "feedback": sub.feedback or "No feedback yet", "status": "Graded" if sub.score is not None else "Submitted"} for sub in assignments]

    quizzes = QuizSubmission.objects.filter(
        **quiz_filter).select_related('quiz__lecture')
    quiz_list = [{"title": sub.quiz.lecture.topic if (
        sub.quiz and sub.quiz.lecture) else "Quiz", "score": sub.score or 0, "submitted_at": sub.submitted_at} for sub in quizzes]

    course_info = None
    if course_id:
        # CourseModel = apps.get_model('courses', 'Course')
        c_obj = Course.objects.filter(
            id=course_id, teacher=teacher).first()
        if c_obj:
            course_info = {"id": c_obj.id, "title": c_obj.title}

    return Response({
        "student_info": {"name": getattr(student, 'full_name', student.email) or student.email, "email": student.email, "id_num": f"STU-{student.id:03d}", "id": student.id},
        "course_info": course_info,
        "assignments": asg_list,
        "quizzes": quiz_list
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_video_detail(request, student_id, course_id):
    teacher = request.user

    if not course_id:
        return Response({"error": "course_id is required"}, status=400)

    # Ensure the course belongs to this teacher
    course = get_object_or_404(Course, id=course_id, teacher=teacher)

    # Ensure the student exists
    student = get_object_or_404(User, id=student_id)

    # Get all lectures for this course
    lectures = Lecture.objects.filter(
        content_source__course=course).order_by('id')

    # Get the student's progress for these lectures
    progress_map = {
        lp.lecture_id: lp
        for lp in LectureProgress.objects.filter(user=student, lecture__in=lectures)
    }

    video_details = []
    for lecture in lectures:
        progress_obj = progress_map.get(lecture.id)

        video_details.append({
            "lecture_id": lecture.id,
            "title": lecture.topic,
            "progress": progress_obj.progress_percentage if progress_obj else 0,
            "last_watched": progress_obj.last_watched.strftime("%B %d, %Y") if progress_obj and progress_obj.last_watched else "Not started",
            "status": "Completed" if progress_obj and progress_obj.progress_percentage >= 95 else "In Progress" if progress_obj and progress_obj.progress_percentage > 0 else "Not Started"
        })

    # Overall course watch percentage for this student
    total_watch = sum(item['progress'] for item in video_details) / \
        len(video_details) if video_details else 0

    return Response({
        "student_name": getattr(student, 'full_name', student.email),
        "course_name": course.title,
        "overall_watch": round(total_watch, 1),
        "lectures": video_details
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_students(request, course_id):
    # Fetch all students enrolled in the specific course
    enrollments = Enrollment.objects.filter(
        course_id=course_id).select_related('student')

    student_data = []
    for enrollment in enrollments:
        student = enrollment.student
        # Calculate average video progress for this student in this specific course
        avg_progress = LectureProgress.objects.filter(
            user=student,
            lecture__content_source__course_id=course_id
        ).aggregate(Avg('progress_percentage'))['progress_percentage__avg'] or 0

        student_data.append({
            "id": student.id,
            "full_name": student.get_full_name() or student.email,
            "email": student.email,
            "video_progress": round(avg_progress, 1)
        })

    return Response(student_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_courses(request):
    # Fetch courses owned by the logged-in teacher
    courses = Course.objects.filter(teacher=request.user)
    data = [{"id": c.id, "title": c.title} for c in courses]
    return Response(data)
