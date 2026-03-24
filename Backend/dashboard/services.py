from lectures.models import LectureProgress
from assessment.models import QuizSubmission,AssignmentSubmission
from django.utils import timezone
from django.db import models


def format_teacher_stats(total_students, avg_grade, pass_rate, course_count):
    """Formats the 'Stats' cards for the frontend UI."""
    return [
        {'label': 'AVG GRADE', 'val': f"{round(avg_grade, 1)}%", 'color': '#6366f1'},
        {'label': 'PASS RATE', 'val': f"{pass_rate}%", 'color': '#10b981'},
        {'label': 'ACTIVE STUDENTS', 'val': str(total_students), 'color': '#f59e0b'},
        {'label': 'COURSES', 'val': str(course_count), 'color': '#f43f5e'},
    ]

def calculate_gpa(total_score, course_count):
    """Centralized GPA Logic."""
    if course_count == 0: return 0.00
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
    quiz_map = {item['quiz__lecture__content_source__course_id']: item['avg_score'] for item in quiz_avgs}

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
        watch_avg = sum(p['progress'] for p in graph_points) / len(graph_points) if graph_points else 0

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
            label = asg.deadline.strftime("%d %b") if asg.deadline else "Active"

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