from django.db import models
from django.conf import settings

# --- QUIZZES ---
class Quiz(models.Model):
    lecture = models.OneToOneField('lectures.Lecture', on_delete=models.CASCADE)
    quiz_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "quiz"

class QuizSubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'quiz')
        db_table = "quiz_submission"

# --- ASSIGNMENTS ---
class Assignment(models.Model):
    lecture = models.ForeignKey('lectures.Lecture', on_delete=models.CASCADE)
    description = models.TextField()
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "assignment"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file_upload = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'assignment')
        db_table = "assignment_submission"