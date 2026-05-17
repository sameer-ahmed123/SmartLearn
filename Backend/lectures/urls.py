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
    global_search, # <--- NAYA GLOBAL SEARCH VIEW IMPORT KIYA
    
    # --- VIRTUAL ROOM / SOCIAL VIEWS ---
    get_same_course_students,
    send_study_request,
    accept_study_request,
    get_my_connections,      # Naya import add kiya
    handle_request_action,   # Naya import add kiya
    get_room_messages,       # <--- CHAT HISTORY VIEW IMPORT KIYA
    
    # 🔥 NEW IMPORT: Teacher Calendar Lectures view import kiya gaya hai
    teacher_calendar_lectures
)

app_name = "lectures"

urlpatterns = [
    # --- DASHBOARD METRICS ---
    path('dashboard/metrics/', teacher_dashboard_metrics, name='teacher-dashboard-metrics'),

    # --- GLOBAL SEARCH ---
    path('search/', global_search, name='global-search'),

    # --- STUDY CONNECTIONS / VIRTUAL ROOM ---
    # Same course ke students dhoondne ke liye
    path('same-course-students/', get_same_course_students, name='same-course-students'),
    
    # Request bhejne ke liye
    path('request/<int:receiver_id>/', send_study_request, name='send-study-request'),
    
    # Accepted connections ki list (Members list)
    path('connections/', get_my_connections, name='get-my-connections'),
    
    # Request accept ya reject karne ke liye (Action logic)
    path('request-action/<int:connection_id>/', handle_request_action, name='handle-request-action'),
    
    # Purana direct accept path (back-up ke liye)
    path('accept/<int:connection_id>/', accept_study_request, name='accept-study-request'),

    # --- CHAT MESSAGES HISTORY ---
    path('messages/<str:room_id>/', get_room_messages, name='room-messages'),

    # 🔥 NEW: Teacher Calendar Endpoint for displaying lecture creation dates
    path('teacher-calendar-lectures/', teacher_calendar_lectures, name='teacher-calendar-lectures'),

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