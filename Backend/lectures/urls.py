from django.urls import path
from .views import (
    # Course FBVs
    course_list_create, 
    course_detail_actions, 
    # ContentSource FBVs (already existed)
    content_source_list_create, 
    content_source_detail_actions
)

app_name = "lectures"

urlpatterns = [
    # COURSE ENDPOINTS
    path('courses/', course_list_create, name='course-list-create'),
    path('courses/<int:pk>/', course_detail_actions, name='course-detail'),
    #CONTENT_SOURCE_ENDPOINTS
    path('content-sources/', content_source_list_create, name='content-source-list-create'),
    path('content-sources/<int:pk>/', content_source_detail_actions, name='content-source-detail'),
]