from django.urls import path
from lectures.views import (
    # Course FBVs
    course_list_create,
    course_detail_actions,
    # ContentSource FBVs (already existed)
    content_source_list_create,
    content_source_detail_actions,
    lecture_detail_and_validate,
    lecture_list_view
)
from lectures import student_views, teachers_views


app_name = "lectures"

urlpatterns = [
    #LECTURE ENDPOINTS
    path('', 
         lecture_list_view, 
         name='lecture-list'),
         
    # URL 2: Detail and Validation/Rejection actions for a specific lecture
    # /api/v1/lectures/{pk}/
    path('<int:pk>/', 
         lecture_detail_and_validate, 
         name='lecture-detail-validate'),
    
    # COURSE ENDPOINTS
    path('courses/', course_list_create, name='course-list-create'),
    path('courses/<int:pk>/', course_detail_actions, name='course-detail'),
    # CONTENT_SOURCE_ENDPOINTS
    path('content-sources/', content_source_list_create,
         name='content-source-list-create'),
    path('content-sources/<int:pk>/', content_source_detail_actions,
         name='content-source-detail'),

    # STUDENT
    path("student/courses/", student_views.student_course_list),
    path("student/enroll/", student_views.enroll_course),
    path("student/enrollments/", student_views.enrolled_courses),
    path("student/lecture-progress/", student_views.lecture_progress),

    # TEACHER
    path("teacher/dashboard/", teachers_views.teacher_dashboard),
    path(
        "teacher/lectures/<int:pk>/validate/",
        teachers_views.validate_lecture,
        name="validate-lecture"
    ),
]
