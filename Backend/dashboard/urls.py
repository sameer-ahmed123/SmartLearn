from django.urls import path
from dashboard.views import (
    get_course_students,
    get_teacher_courses,
    teacher_dashboard_metric,
    student_dashboard_metric,
    teacher_analytics,
    teacher_gradebook_summary,
    student_detail_report,
    student_gradebook_summary,
    student_analytics,
    get_student_video_detail,
)

app_name = "dashboard"

urlpatterns = [
    # Teacher dashboard ke liye original path
    path('metrics/teacher/', teacher_dashboard_metric,
         name="teacher_dashboard_metrics"),

    # Student dashboard ke liye naya path
    path('metrics/student/', student_dashboard_metric,
         name="student_dashboard_metrics"),



    # --- Teacher Dashboard Endpoints ---
    path('teacher-analytics/', teacher_analytics, name='teacher-analytics'),
    path('teacher/gradebook-summary/<int:course_id>/', teacher_gradebook_summary,
         name='teacher-gradebook-summary'),
    path('teacher/student-report/<int:student_id>/',
         student_detail_report, name='student-detail-report'),
    path('teacher/student-video-detail/<int:student_id>/<int:course_id>/',
         get_student_video_detail, name='student-video-detail'),

    # --- Student Dashboard Endpoints ---
    path('student-analytics/', student_analytics, name='student-analytics'),
    path('student/gradebook-summary/', student_gradebook_summary,
         name='student-gradebook-summary'),

    # --get students enrolled in a course
    path('teacher/course-students/<int:course_id>/',
         get_course_students, name='course-students'),
    
    path('teacher/courses/' ,get_teacher_courses),
]
