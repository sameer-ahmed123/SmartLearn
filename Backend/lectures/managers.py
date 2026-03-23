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
        return self.filter(enrollments__student=user)

    def student_summary(self, student):
        """
        BEING USED IN dashboard/views.py AT student_dashboard_metric
        Calculates all student dashboard metrics.
        """
        # Courses the student is enrolled in
        enrolled_qs = self.filter(enrollments__student=student)

        # Aggregate counts for the top tiles
        # for overall data Aggregate ==> one Combined result
        stats = enrolled_qs.aggregate(
            course_count=models.Count('id', distinct=True),
            # Count validated lectures across all enrolled courses
            lec_count=models.Count(
                'content_sources__generated_lectures',
                filter=models.Q(
                    content_sources__generated_lectures__validation_status='validated'),
                distinct=True
            ),
            # Count published quizzes
            quiz_count=models.Count(
                'content_sources__generated_lectures__quiz',
                filter=models.Q(
                    content_sources__generated_lectures__quiz__status='published'),
                distinct=True
            ),
            # Count published assignments
            asg_count=models.Count(
                'content_sources__generated_lectures__assignment',
                filter=models.Q(
                    content_sources__generated_lectures__assignment__status='published'),
                distinct=True
            )
        )

        # Get the progress list (using your existing logic but inside the manager)
        # for each lecture  Annote ==> indivually
        progress_list = enrolled_qs.annotate(
            avg_prog=models.Avg(
                'content_sources__generated_lectures__user_progress__progress_percentage',
                filter=models.Q(
                    content_sources__generated_lectures__user_progress__user=student)
            )
        ).values('title', 'avg_prog')

        return {
            "stats": stats,
            "progress_data": [
                {"name": p['title'], "progress": int(p['avg_prog'] or 0)}
                for p in progress_list
            ]
        }


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

    def for_teacher(self, teacher):
        return self.filter(content_source__course__teacher=teacher)

    def teacher_summary(self, teacher):
        """
        BEING USED IN dashboard/views.py AT teacher_dashboard_metric
        aggregation for the Teacher Dashboard.  
        (aggregation ==> returns one single compiled dictionary)
        """
        stats = self.for_teacher(teacher).aggregate(
            total=models.Count('id'),
            pending=models.Count('id', filter=models.Q(
                validation_status='pending')),
            validated=models.Count('id', filter=models.Q(
                validation_status='validated'))
        )

        total = stats['total'] or 0
        validated = stats['validated'] or 0
        coverage = int((validated / total) * 100) if total > 0 else 0

        return {
            "total_lectures": total,
            "pending": stats['pending'] or 0,
            "validated": validated,
            "coverage": coverage
        }
