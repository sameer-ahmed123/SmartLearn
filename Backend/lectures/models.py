from django.db import models
from django.conf import settings

# 1: COURSE MODEL ---Subject Container


class Course(models.Model):
    """This represents the Highest Level Container for content
        Example: COMPUTER_SCIENCE
    """
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "teacher"},
        related_name="taught_courses"
    )
    title = models.CharField(max_length=225)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived")
    ]
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="draft")

    def __str__(self):
        return self.title

    class Meta:
        db_table = "course"

# 2: CONTENT SOURCE MODEL ---(Teacher k Inptut Contain kare ga)


class ContentSource(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="content_sources",
                               help_text="the cource this content is intended for")
    raw_file = models.FileField(upload_to='raw_content_uploads/%Y/%m/%d')
    ai_prompt = models.TextField(
        help_text="the teachers help instructions for the AI Lecture generation")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_sources"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Source for {self.course.title} ({self.created_at.date()})"

    class Meta:
        db_table = "content_source"

# 3: LECTURE MODEL ---(AI's Structured Output)


class Lecture(models.Model):
    content_source = models.ForeignKey(
        ContentSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_lectures",
        help_text="the raw content source that generated this lecture"
    )
    VALIDATION_CHOICES = (
        ('pending', 'Pending'),
        ('validated', 'Validated'),
        ('rejected', 'Rejected')
    )
    validation_status = models.CharField(
        max_length=20, choices=VALIDATION_CHOICES, default='pending')
    topic = models.CharField(max_length=255, db_index=True)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_lectures')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='validated_lectures')

    video_url = models.URLField()
    summary_text = models.TextField()

    rejection_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic

    class Meta:
        db_table = "lecture"


# Enrollment Model (student enrolls in a course)
class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "student"},
        related_name="course_enrollments"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    enrolled_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} enrolled in {self.course.title}"

    class Meta:
        db_table = "enrollment"
        unique_together = (("student", "course"),)
        ordering = ['-enrolled_at']
