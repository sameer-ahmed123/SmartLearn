from lectures.models import Lecture, LectureProgress, Course
from assessment.models import QuizSubmission, AssignmentSubmission
from smartlearn_project.utils import get_letter_grade
from django.contrib.auth import get_user_model
from django.db.models import Avg, Q, F, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.db import models


def format_teacher_stats(total_students, avg_grade, pass_rate, course_count):
    """Formats the 'Stats' cards for the frontend UI."""
    return [
        {'label': 'AVG GRADE',
            'val': f"{round(avg_grade, 1)}%", 'color': '#6366f1'},
        {'label': 'PASS RATE', 'val': f"{pass_rate}%", 'color': '#10b981'},
        {'label': 'ACTIVE STUDENTS', 'val': str(
            total_students), 'color': '#f59e0b'},
        {'label': 'COURSES', 'val': str(course_count), 'color': '#f43f5e'},
    ]


def calculate_gpa(total_score, course_count):
    """Centralized GPA Logic."""
    if course_count == 0:
        return 0.00
    # Your original logic: total_avg_sum / (course_count * 25)
    return round((total_score / (course_count * 25)), 2)


# dashboard/services.py

def get_student_leaderboard(students, score_map):
    colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
    leaderboard = []
    for idx, student in enumerate(students):
        leaderboard.append({
            "name": getattr(student, 'full_name', '') or student.email,
            "progress": round(score_map.get(student.id, 0), 1),
            "color": colors[idx % len(colors)],
            "avatar": f"https://i.pravatar.cc/150?u={student.id}"
        })
    return leaderboard


def get_submission_metrics(asg_stats, quiz_stats):
    asg_total = asg_stats['total'] or 0
    asg_late = asg_stats['late'] or 0
    return {
        "assignment": {
            "onTime": asg_total - asg_late,
            "late": asg_late,
            "pending": asg_stats['pending'] or 0
        },
        "quiz": {
            "completed": quiz_stats['total_done'],
            "avgGrade": f"{round(quiz_stats['avg_grade'] or 0, 1)}%"
        }
    }


def format_student_course_data(user, enrollments):
    """
    Formats the 'courses' list including the graph points for video progress.
    """

    # Pre-fetch quiz averages for all courses to avoid looping queries
    quiz_avgs = QuizSubmission.objects.filter(user=user).values(
        'quiz__lecture__content_source__course_id'
    ).annotate(avg_score=models.Avg('score'))
    quiz_map = {item['quiz__lecture__content_source__course_id']                : item['avg_score'] for item in quiz_avgs}

    courses_data = []
    for enrollment in enrollments:
        course = enrollment.course

        # Get graph points for this specific course
        lp_records = LectureProgress.objects.filter(
            user=user, lecture__content_source__course=course
        ).select_related('lecture').order_by('last_watched')

        graph_points = [{
            "id": lp.lecture.id,
            "title": lp.lecture.topic,
            "progress": lp.progress_percentage,
            "date": lp.last_watched.strftime("%b %d")
        } for lp in lp_records]

        # Calculate avg watch progress
        watch_avg = sum(p['progress'] for p in graph_points) / \
            len(graph_points) if graph_points else 0

        courses_data.append({
            "id": course.id,
            "name": course.title,
            "watch": int(watch_avg),
            "quiz": round(quiz_map.get(course.id, 0), 1),
            "lectures": graph_points
        })
    return courses_data


def get_active_assignments(user, assignments):
    """Formats the top 3 recent assignments with status labels."""

    sub_dict = {sub.assignment_id: sub for sub in AssignmentSubmission.objects.filter(
        user=user, assignment_id__in=[asg.id for asg in assignments])}

    active_list = []
    for asg in assignments:
        sub = sub_dict.get(asg.id)
        # Determine Label
        if sub:
            label = "Submitted"
        elif asg.deadline and timezone.now() > asg.deadline:
            label = "Overdue"
        else:
            label = asg.deadline.strftime(
                "%d %b") if asg.deadline else "Active"

        active_list.append({
            "title": asg.assignment_data.get('title', 'Assignment') if isinstance(asg.assignment_data, dict) else "Assignment",
            "deadline": label,
            "progress": 100 if sub else 0
        })
    return active_list


def get_recent_quiz_performance(submissions):
    """Formats the last 5 quiz scores for the bar chart."""
    return [
        {
            "name": q.quiz.lecture.topic if q.quiz.lecture else "Quiz",
            "quiz": float(q.score)
        } for q in submissions
    ]


def format_student_gradebook(course_data, student):
    """
    Transforms raw DB data comming from CourseQuerySet into the Gradebook UI format.
    """
    final_list = []
    total_points = 0

    for c in course_data:
        q_marks = round(c['q_avg'] or 0, 2)
        a_marks = round(c['asg_avg'] or 0, 2)
        total_score = round(q_marks + a_marks, 2)
        total_points += total_score

        final_list.append({
            "course": c['title'],
            "instructor": c['instructor'],
            "quizzes_marks": q_marks,
            "assignments_marks": a_marks,
            "exam_marks": 0,
            "score": total_score,
            "grade": get_letter_grade(total_score),
            "status": "Completed"
        })

    count = len(final_list)
    return {
        "stats": {
            "gpa": round((total_points / (count * 25)), 2) if count > 0 else 0.00,
            "total_courses": count,
            "completed_courses": count,
            "quizzes_done": QuizSubmission.objects.filter(user=student).count(),
            "assignments_done": AssignmentSubmission.objects.filter(user=student).count()
        },
        "courses": final_list
    }


def get_teacher_gradebook(teacher, course_id=None):
    """
    DATABASE & LOGIC: Fetches students for a teacher/course 
    and annotates their average performance.
    """

    User = get_user_model()

    # 1. Students enrolled in teacher's courses
    student_qs = User.objects.filter(
        course_enrollments__course__teacher=teacher)

    # 2. Optional Course Filter for SPECIFIC Course
    if course_id:
        student_qs = student_qs.filter(course_enrollments__course_id=course_id)

    # 3. Annotate Quiz and Assignment averages
    # We filter the averages to only include submissions for THIS teacher/course
    gradebook_data = student_qs.distinct().annotate(
        asg_avg=Coalesce(Avg(
            'assignmentsubmission__score',
            filter=Q(assignmentsubmission__assignment__lecture__content_source__course__teacher=teacher) &
            (Q(assignmentsubmission__assignment__lecture__content_source__course_id=course_id)
             if course_id else Q())
        ), 0.0),
        quiz_avg=Coalesce(Avg(
            'quizsubmission__score',
            filter=Q(quizsubmission__quiz__lecture__content_source__course__teacher=teacher) &
            (Q(quizsubmission__quiz__lecture__content_source__course_id=course_id)
             if course_id else Q())
        ), 0.0),
        display_name=Coalesce(
            F('full_name'),
            F('email'),
            output_field=models.CharField()
        )

    ).values('id', 'display_name', 'asg_avg', 'quiz_avg')

    # 4. Final Formatting
    return [
        {
            "id": s['id'],
            "student_name": s['display_name'],
            "student_id_num": f"STU-{s['id']:03d}",
            "avatar_url": f"https://i.pravatar.cc/150?u={s['id']}",
            "assignments_marks": round(s['asg_avg'], 2),
            "quizzes_marks": round(s['quiz_avg'], 2),
            "exam_marks": 0,
            "score": round((s['asg_avg'] + s['quiz_avg'])/2, 2),
            "grade": get_letter_grade((s['asg_avg'] + s['quiz_avg'])/2),
            "total_possible": 100
        }
        for s in gradebook_data
    ]


def get_student_performance_detail(teacher, student, course_id=None):
    """
    LOGIC LAYER: Reuses Lecture manager to fetch and format 
    detailed history for a specific student.
    """

    # 1. Get the allowed scope of lectures from our Manager
    lecture_qs = Lecture.objects.for_teacher(teacher)
    if course_id:
        lecture_qs = lecture_qs.for_course(course_id)

    # 2. Fetch and Format Assignments
    assignments = AssignmentSubmission.objects.filter(
        user=student,
        assignment__lecture__in=lecture_qs
    ).select_related('assignment__lecture')

    asg_list = [
        {
            "title": sub.assignment.lecture.topic if (sub.assignment and sub.assignment.lecture) else "Assignment",
            "score": sub.score or 0,
            "feedback": sub.feedback or "No feedback yet",
            "status": "Graded" if sub.score is not None else "Submitted"
        } for sub in assignments
    ]

    # 3. Fetch and Format Quizzes (Using the scope from step 1)
    quizzes = QuizSubmission.objects.filter(
        user=student,
        quiz__lecture__in=lecture_qs
    ).select_related('quiz__lecture')

    quiz_list = [
        {
            "title": sub.quiz.lecture.topic if (sub.quiz and sub.quiz.lecture) else "Quiz",
            "score": sub.score or 0,
            "submitted_at": sub.submitted_at
        } for sub in quizzes
    ]

    # 4. Fetch Course Info (if applicable)
    course_info = None
    if course_id:
        c_obj = Course.objects.filter(id=course_id, teacher=teacher).first()
        if c_obj:
            course_info = {"id": c_obj.id, "title": c_obj.title}

    return {
        "student_info": {
            "name": getattr(student, 'full_name', student.email) or student.email,
            "email": student.email,
            "id_num": f"STU-{student.id:03d}",
            "id": student.id
        },
        "course_info": course_info,
        "assignments": asg_list,
        "quizzes": quiz_list
    }


def get_course_student_list_with_progress(course_id):
    """
    LOGIC LAYER: Fetches all students in a course with their 
    average video progress in a single database hit.
    """
    User = get_user_model()
    total_lectures = Lecture.objects.filter(
        content_source__course_id=course_id).count() or 1

    # 1. Fetch Users enrolled in this specific course
    # 2. Annotate the average progress ONLY for lectures in THIS course
    students_with_stats = User.objects.filter(
        course_enrollments__course_id=course_id
    ).annotate(
        total_progress_points=Coalesce(Sum(
            'lecture_progress__progress_percentage',
            filter=Q(lecture_progress__lecture__content_source__course_id=course_id)
        ), 0.0, output_field=models.FloatField()),
        display_name=Coalesce(
            F('full_name'),
            F('email'),
            output_field=models.CharField()
        )
    ).values('id', 'display_name', 'email', 'total_progress_points').order_by('-total_progress_points')

    # 3. Format for the Frontend
    return [
        {
            "id": s['id'],
            "full_name": s['display_name'],
            "email": s['email'],
            "video_progress": round(s['total_progress_points']/total_lectures, 1)
        }
        for s in students_with_stats
    ]
