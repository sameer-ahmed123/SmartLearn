from django.db import models

class CourseQuerySet(models.QuerySet):
    """
    Custom QuerySet for Course model to centralize visibility logic.
    """
    def published(self):
        """Returns only courses that are ready for students."""
        return self.filter(status='published')

    def for_user(self, user):
        """
        Determines which courses a user should see based on their role.
        - Teachers see courses they created.
        - Students see courses they have enrolled in.
        """
        if user.role == 'teacher':
            return self.filter(teacher=user)
        # Assuming related_name='enrollments' in the Enrollment model
        return self.filter(enrollments__student=user)

class LectureQuerySet(models.QuerySet):
    """
    Custom QuerySet for Lecture model to manage validation and content filtering.
    """
    def validated(self):
        """Only returns lectures approved by a teacher."""
        return self.filter(validation_status='validated')

    def pending(self):
        """Returns lectures waiting for teacher review."""
        return self.filter(validation_status='pending')

    def for_course(self, course_id):
        """Filters lectures by their parent course ID via ContentSource."""
        return self.filter(content_source__course_id=course_id)