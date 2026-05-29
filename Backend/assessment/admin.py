from django.contrib import admin
from .models import Quiz, QuizSubmission, Assignment, AssignmentSubmission,QuizViolation

# Registering multiple models quickly
admin.site.register(Quiz)
admin.site.register(Assignment)
admin.site.register(QuizViolation)
@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'is_graded', 'submitted_at')
    list_filter = ('is_graded', 'is_overridden', 'submitted_at', 'quiz')
    search_fields = ('user__email', 'quiz__lecture__topic')


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'assignment', 'score', 'is_graded', 'submitted_at')
    list_filter = ('is_graded', 'assignment', 'submitted_at')
    search_fields = ('user__email', 'assignment__lecture__topic')
    