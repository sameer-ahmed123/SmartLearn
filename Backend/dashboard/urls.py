from django.urls import path
from dashboard.views import (
    teacher_dashboard_metric
)
app_name ="dashboard"

urlpatterns = [
    path('metrics/teacher/',teacher_dashboard_metric,name="teacher_metrics")
]
