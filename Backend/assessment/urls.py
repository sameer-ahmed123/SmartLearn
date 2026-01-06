from django.urls import path
from assessment.views import generate_assessment_trigger, quiz_detail_update

app_name = "assessment"

urlpatterns = [
    path('generate/', generate_assessment_trigger, name='generate-assessment'),
    path('quiz/<int:quiz_id>/', quiz_detail_update, name='quiz-detail-update')
]