from django.urls import path
# Purana naam 'teacher_dashboard_metric' wapis use kar rahe hain
from dashboard.views import teacher_dashboard_metric, student_dashboard_metric 

app_name = "dashboard"

urlpatterns = [
    # Teacher dashboard ke liye original path
    path('metrics/teacher/', teacher_dashboard_metric, name="teacher_dashboard_metrics"),
    
    # Student dashboard ke liye naya path
    path('metrics/student/', student_dashboard_metric, name="student_dashboard_metrics"),
]