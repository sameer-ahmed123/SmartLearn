from django.db.models import Avg
from lectures.models import Lecture


def get_student_course_video_report(student, course):
    """
    LOGIC LAYER: Formats video progress details for a student in a course.
    """
    # 1. Fetch lectures with annotated progress using our Manager
    # REUSE: .for_course is already in your LectureQuerySet!
    lectures_qs = Lecture.objects.filter(
        content_source__course=course
    ).with_student_progress(student).order_by('-student_progress','id')
    
    total_lecture_count = lectures_qs.count() or 1
    
    video_details = []
    total_progress_sum = 0
    for lec in lectures_qs:
        prog = lec.student_progress or 0
        total_progress_sum += prog

        # Status Logic
        if prog >= 95:
            status_str = "Completed"
        elif prog > 0:
            status_str = "In Progress"
        else:
            status_str = "Not Started"

        video_details.append({
            "lecture_id": lec.id,
            "title": lec.topic,
            "progress": prog,
            "last_watched": lec.student_last_watched.strftime("%B %d, %Y") if lec.student_last_watched else "Not started",
            "status": status_str
        })

    # 2. Overall Calculation
    overall_completion = total_progress_sum / total_lecture_count
    
    print(total_lecture_count, "lec count")
    print(total_progress_sum, "progress")
    
    return {
        "student_name": getattr(student, 'full_name', student.email),
        "course_name": course.title,
        "overall_watch": round(overall_completion, 1),
        "lectures": video_details
    }
