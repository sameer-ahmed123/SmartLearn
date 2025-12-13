from django.contrib import admin
from .models import Quiz, QuizSubmission, Assignment, AssignmentSubmission

# Registering multiple models quickly
admin.site.register(Quiz)
admin.site.register(QuizSubmission)
admin.site.register(Assignment)
admin.site.register(AssignmentSubmission)