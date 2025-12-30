from django.urls import path
from .views import (
    # Course FBVs
    course_list_create, 
    course_detail_actions,
    course_lecture_list, 
    # ContentSource FBVs (already existed)
    content_source_list_create, 
    content_source_detail_actions,
    #LECTURE 
    lecture_detail,
    lecture_validation_queue,
    lecture_validate_action
)

app_name = "lectures"

urlpatterns = [
    # COURSE ENDPOINTS
    path('courses/', course_list_create, name='course-list-create'),
    path('courses/<int:pk>/', course_detail_actions, name='course-detail'),
    path('courses/<int:course_id>/content/',course_lecture_list, name='course-lecture-list'),
    #CONTENT_SOURCE_ENDPOINTS
    path('content-sources/', content_source_list_create, name='content-source-list-create'),
    path('content-sources/<int:pk>/', content_source_detail_actions, name='content-source-detail'),
    # LECTURE ENDPOINTS
    path('<int:id>/',lecture_detail,name='lecture-detail'),
    path('pending/',lecture_validation_queue,name='lecture-validation-queue'),
    path('<int:id>/validate/',lecture_validate_action,name='lecture-validate-action'),
]