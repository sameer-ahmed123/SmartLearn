from django.db import models
from django.conf import settings
from lectures.managers import LectureQuerySet, CourseQuerySet
from django.conf import settings

# 1: COURSE MODEL ---Subject Container

class Course(models.Model):
    """This represents the Highest Level Container for content
        Example: COMPUTER_SCIENCE
    """
    objects = CourseQuerySet.as_manager()
    
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "teacher"},
        related_name="taught_courses"
    )
    title = models.CharField(max_length=225)
    description = models.TextField(blank=True)
    # ADDED THUMBNAIL FIELD HERE
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
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

# 2: CONTENT SOURCE MODEL ---(Teacher k Inptut Contain kare ga files)

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
    objects = LectureQuerySet.as_manager()
    
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

    script = models.TextField(blank=True, null=True,
                              help_text="Full Ai Generated Lecture Script")
    context = models.TextField(
        blank=True, null=True, help_text="Ai-Generated context for chatbot/Quiz/Assignment")
    
    VIDEO_STATUS_CHOICES = (
        ('none', 'None'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    video_status = models.CharField(
        max_length=20, choices=VIDEO_STATUS_CHOICES, default='none')
    
    video_url = models.URLField(blank=True, null=True)
    video_public_id = models.CharField(
        max_length=255, blank=True, null=True, help_text="Cloudinary Public ID for management")

    summary_text = models.TextField()

    rejection_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic

    class Meta:
        db_table = "lecture"


# 4: LECTURE PROGRESS MODEL (Naya Model for Individual Progress)
class LectureProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="lecture_progress"
    )
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name="user_progress"
    )
    progress_percentage = models.IntegerField(
        default=0, 
        help_text="Individual user's watch percentage (0-100)"
    )
    last_watched = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lecture_progress"
        unique_together = (('user', 'lecture'),)

    def __str__(self):
        return f"{self.user.email} - {self.lecture.topic}: {self.progress_percentage}%"


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


# 5: STUDY CONNECTION MODEL (For Virtual Room Access)

class StudyConnection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_study_requests'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_study_requests'
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "study_connection"
        unique_together = (('sender', 'receiver'),)

    def __str__(self):
        return f"{self.sender.full_name} -> {self.receiver.full_name} ({self.status})"


# 6: GROUP MESSAGE MODEL (For Real-time Virtual Room Chat)

class GroupMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="study_group_messages"
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    # room_id can be the course_id or a unique string for the group
    room_id = models.CharField(max_length=255, db_index=True)

    class Meta:
        db_table = "group_message"
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:30]}"

