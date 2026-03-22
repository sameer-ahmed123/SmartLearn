from django.urls import path
from .views import (
    # Course FBVs
    course_list_create, 
    course_detail_actions,
    course_lecture_list, 
    teacher_courses_list,  # Naya view import kiya
    # ContentSource FBVs
    content_source_list_create, 
    content_source_detail_actions,
    # LECTURE 
    lecture_detail,
    lecture_validation_queue,
    lecture_validate_action,
    # DASHBOARD METRICS
    teacher_dashboard_metrics, # Naya view import kiya
    # student_analytics_data,    # <--- NAYA ANALYTICS VIEW IMPORT KIYA
)

app_name = "lectures"

urlpatterns = [
    # --- DASHBOARD METRICS ---
    path('dashboard/metrics/', teacher_dashboard_metrics, name='teacher-dashboard-metrics'),

    # --- SHOULD BE REMOVED  ------NOT BEING ACCESSD  (MOVED TO DASHBOARD APP [NEW VIEW] )  NOT NEEDED 
    # path('student/analytics/', student_analytics_data, name='student-analytics-data'), # <--- NAYA ENDPOINT

    # --- COURSE ENDPOINTS ---
    # Inka final URL banega: /api/v1/lectures/courses/
    path('courses/', course_list_create, name='course-list-create'),
    
    # Inka final URL banega: /api/v1/lectures/courses/teacher-courses/
    path('courses/teacher-courses/', teacher_courses_list, name='teacher-courses-list'),
    
    path('courses/<int:pk>/', course_detail_actions, name='course-detail'),
    path('courses/<int:course_id>/content/', course_lecture_list, name='course-lecture-list'),
    
    # --- CONTENT_SOURCE_ENDPOINTS ---
    path('content-sources/', content_source_list_create, name='content-source-list-create'),
    path('content-sources/<int:pk>/', content_source_detail_actions, name='content-source-detail'),
    
    # --- LECTURE ENDPOINTS ---
    path('<int:id>/', lecture_detail, name='lecture-detail'),
    path('pending/', lecture_validation_queue, name='lecture-validation-queue'),
    path('<int:id>/validate/', lecture_validate_action, name='lecture-validate-action'),

]