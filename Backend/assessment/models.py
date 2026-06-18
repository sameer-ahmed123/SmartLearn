from django.db import models
from django.conf import settings
from assessment.managers import QuizManager,AssignmentManager

# --- QUIZZES ---

class Quiz(models.Model):
    objects = QuizManager()
    status_choices = (
        ('generating', 'Generating'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('draft', 'Draft'),
    )
    lecture = models.OneToOneField(
        'lectures.Lecture', on_delete=models.CASCADE)
    quiz_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=100, default='generating', choices=status_choices)

    class Meta:
        db_table = "quiz"

    def __str__(self):
        return f"{self.lecture}"

class QuizSubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    answers_data = models.JSONField(default=list)
    score = models.FloatField()
    is_overridden = models.BooleanField(default=False)
    is_graded = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    termination_reason = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'quiz')
        db_table = "quiz_submission"

class QuizViolation(models.Model):
    VIOLATION_TYPES = (
        ('TAB_SWITCH', 'Tab Switching'),
        ('LOOK_AWAY', 'Looking Away'),
        ('MULTI_FACE', 'Multiple People Detected'),
        ('NO_FACE', 'Face Not Detected'),
        ('LOOK_DOWN', 'Looking Down/Phone'),
    )
    submission = models.ForeignKey(
        QuizSubmission, 
        on_delete=models.CASCADE, 
        related_name='violation_sub',
        null=True,
        blank=True
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='violations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)

    class Meta:
        db_table = "quiz_violation"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.violation_type} at {self.timestamp}"

# --- ASSIGNMENTS ---

class Assignment(models.Model):
    objects = AssignmentManager()
    status_choices = (
        ('generating', 'Generating'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('draft', 'Draft'),
    )
    #  OneToOneField to match Quiz logic (1 AI assignment per lecture)
    lecture = models.OneToOneField('lectures.Lecture', on_delete=models.CASCADE)
    
    assignment_data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=100, default='generating', choices=status_choices)
    
    description = models.TextField(blank=True, null=True) 
    deadline = models.DateTimeField(null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    # --- FIXED: null=True, blank=True add kiya taake Celery task save karte waqt error na de ---
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True) 

    class Meta:
        db_table = "assignment"


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    file_upload = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # --- Naye fields (AI/Teacher feedback ke liye) ---
    # Score ko FloatField kar diya hai taake grading calculation asaan ho
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    is_graded = models.BooleanField(default=False)
    is_overridden = models.BooleanField(default=False)

    # 🔥 Plagiarism and AI-generation check fields
    plagiarism_percentage = models.IntegerField(default=0)
    is_plagiarized = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'assignment')
        db_table = "assignment_submission"