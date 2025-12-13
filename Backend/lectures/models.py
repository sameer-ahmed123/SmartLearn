from django.db import models
from django.conf import settings

class Lecture(models.Model):
    VALIDATION_CHOICES = (
        ('pending', 'Pending'),
        ('validated', 'Validated'),
        ('rejected', 'Rejected')
    )

    topic = models.CharField(max_length=255, db_index=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_lectures')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_lectures')
    
    video_url = models.URLField()
    summary_text = models.TextField()
    validation_status = models.CharField(max_length=20, choices=VALIDATION_CHOICES, default='pending')
    rejection_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic
    
    class Meta:
        db_table = "lecture"