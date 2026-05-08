from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list_view, name='notification-list'),
    # path('<int:pk>/read/', views.mark_single_as_read, name='mark-single-read'),
    path('mark-by-target/', views.mark_read_by_target, name='mark-read-by-target'),
]