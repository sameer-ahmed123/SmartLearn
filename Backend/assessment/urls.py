from django.urls import path
from assessment.views import generate_assessment_trigger

app_name = "assessment"

urlpatterns = [
    path('generate/', generate_assessment_trigger, name='generate-assessment'),
]