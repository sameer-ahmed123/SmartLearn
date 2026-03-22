from django.db import models
from django.db.models import Count
import django.db.models as django_models
from django.apps import apps
class AssessmentQuerySet(models.QuerySet):
    """
    Common filters shared by both Quizzes and Assignments.
    """
    def published(self):
        return self.filter(status='published')

    def for_student(self, user):
        """Filters items where the student is actually enrolled."""
        return self.filter(lecture__content_source__course__enrollments__student=user)

    def for_teacher(self, user):
        """Filters items created by a specific teacher."""
        return self.filter(lecture__content_source__course__teacher=user)

class QuizManager(models.Manager):
    def get_queryset(self):
        return AssessmentQuerySet(self.model, using=self._db)

    def student_dashboard(self, user):
        """Optimized query for the student quiz list."""
        return self.get_queryset().published().for_student(user).select_related(
            'lecture__content_source__course'
        )

    def get_student_stats(self, user):
        """Calculates dynamic stats for the student quiz dashboard."""
        quizzes = self.get_queryset().published().for_student(user)
        submissions = apps.get_model('assessment', 'QuizSubmission').objects.filter(user=user)
        
        assigned = quizzes.count()
        completed = submissions.count()
        
        # Calculate Average Score dynamically
        
        avg_val = submissions.aggregate(avg=django_models.Avg('score'))['avg'] or 0
        
        return {
            "assigned": assigned,
            "completed": completed,
            "pending": assigned - completed,
            "avgScore": round(avg_val, 1)
        }

    def teacher_dashboard(self, user):
        """Optimized query with submission counts for teachers."""
        return self.get_queryset().for_teacher(user).select_related(
            'lecture__content_source__course', 'lecture'
        ).annotate(sub_count=Count('quizsubmission', distinct=True))

class AssignmentManager(models.Manager):
    def get_queryset(self):
        return AssessmentQuerySet(self.model, using=self._db)

    def student_dashboard(self, user):
        return self.get_queryset().published().for_student(user).select_related(
            'lecture__content_source__course'
        )

    def teacher_dashboard(self, user):
        return self.get_queryset().for_teacher(user).select_related(
            'lecture__content_source__course', 'lecture'
        ).annotate(sub_count=Count('assignmentsubmission', distinct=True))
        
    def can_access(self, user, instance_id):
        """
        Check if a user (Teacher or Student) has permission to 
        view/edit this specific assessment.
        """
        instance = self.filter(id=instance_id).select_related(
            'lecture__content_source__course'
        ).first()
        
        if not instance:
            return None, False

        course = instance.lecture.content_source.course
        is_teacher = (course.teacher == user)
        is_enrolled = course.enrollments.filter(student=user).exists()

        return instance, (is_teacher or is_enrolled)