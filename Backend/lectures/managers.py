from django.db import models
from assessment.models import Assignment, QuizSubmission, Quiz, AssignmentSubmission
from django.contrib.auth import get_user_model


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

    def _base_teacher_metrics(self, teacher):
        """
        INTERNAL HELPER: Centralizes teacher-specific aggregations 
        (Student counts, Quiz averages, and Assignment statuses).
        """
        from assessment.models import QuizSubmission, AssignmentSubmission

        # 1. Course & Student Counts
        courses = self.filter(teacher=teacher).annotate(
            student_count=models.Count('enrollments', distinct=True)
        )
        total_students = courses.aggregate(
            total=models.Sum('student_count'))['total'] or 0

        # 2. Quiz Performance
        quiz_stats = QuizSubmission.objects.filter(
            quiz__lecture__content_source__course__teacher=teacher
        ).aggregate(
            avg_grade=models.Avg('score'),
            total_done=models.Count('id'),
            passed=models.Count('id', filter=models.Q(score__gte=50))
        )

        # 3. Assignment Status
        asg_stats = AssignmentSubmission.objects.filter(
            assignment__lecture__content_source__course__teacher=teacher
        ).aggregate(
            total=models.Count('id'),
            pending=models.Count('id', filter=models.Q(score__isnull=True)),
            late=models.Count('id', filter=models.Q(
                submitted_at__gt=models.F('assignment__deadline')))
        )

        return {
            "courses_qs": courses,
            "total_students": total_students,
            "quiz_stats": quiz_stats,
            "asg_stats": asg_stats
        }

    def _base_student_metrics(self, student):
        """
        Centralizes the shared counting logic.
        """
        return self.aggregate(
            course_count=models.Count('id', distinct=True),
            lec_count=models.Count(
                'content_sources__generated_lectures',
                filter=models.Q(
                    content_sources__generated_lectures__validation_status='validated'),
                distinct=True
            ),
            quiz_count=models.Count(
                'content_sources__generated_lectures__quiz',
                filter=models.Q(
                    content_sources__generated_lectures__quiz__status='published'),
                distinct=True
            ),
            asg_count=models.Count(
                'content_sources__generated_lectures__assignment',
                filter=models.Q(
                    content_sources__generated_lectures__assignment__status='published'),
                distinct=True
            )
        )

    def student_summary(self, student):
        """
        Calculates all student dashboard metrics.
        """
        # Courses the student is enrolled in
        enrolled_qs = self.filter(enrollments__student=student)

        # Aggregate counts for the top tiles
        # for overall data Aggregate ==> one Combined result
        stats = enrolled_qs._base_student_metrics(student)

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

    def teacher_analytics_summary(self, teacher):
        """
        === TEACHER ANALYTICS ===
        Aggregates all teacher-related counts in a single pass.
        """
        User = get_user_model()
        base = self._base_teacher_metrics(teacher)

        course_scores = QuizSubmission.objects.filter(
            quiz__lecture__content_source__course__teacher=teacher
        ).values(
            'quiz__lecture__content_source__course_id'
        ).annotate(avg_score=models.Avg('score'))

        score_dict = {item['quiz__lecture__content_source__course_id']: item['avg_score'] or 0 for item in course_scores}

        # get id of top students
        top_student_ids = list(User.objects.filter(
            course_enrollments__course__teacher=teacher).distinct().values_list('id', flat=True)[:5])
        # the actual User object for the top students
        top_students = User.objects.filter(id__in=top_student_ids)

        stu_scores = QuizSubmission.objects.filter(
            user_id__in=top_student_ids,
            quiz__lecture__content_source__course__teacher=teacher
        ).values('user_id').annotate(avg_score=models.Avg('score'))
        stu_score_dict = {item['user_id']: item['avg_score'] or 0 for item in stu_scores}
        
        return {
            **base,
            "course_score_map": score_dict,
            "top_students_qs": top_students,
            "student_score_map": stu_score_dict
        }

    def student_analytics_summary(self, student):
        """
        high-level stats for the student analytics page.
        """
        enrolled_qs = self.filter(enrollments__student=student)
        base_stats = enrolled_qs._base_student_metrics(student)

        # 1. Avg Quiz Score
        avg_quiz = QuizSubmission.objects.filter(user=student).aggregate(
            avg=models.Avg('score'))['avg'] or 0

        completed_asg = AssignmentSubmission.objects.filter(
            user=student, score__isnull=False
        ).count()

        enrollments = student.course_enrollments.select_related('course')

        recent_assignments = Assignment.objects.filter(
            lecture__content_source__course__enrollments__student=student,
            status='published'
        ).order_by('-deadline')[:3]

        recent_quiz_subs = QuizSubmission.objects.filter(
            user=student).select_related('quiz__lecture').order_by('-id')[:5]

        return {
            "avg_quiz": avg_quiz,
            "total_asg": base_stats['asg_count'],  # from _base func
            "completed_asg": completed_asg,
            "enrollments": enrollments,
            "recent_assignments": recent_assignments,
            "recent_quiz_subs": recent_quiz_subs,
            "base_stats": base_stats  # Optional: if you need lec_count or course_count
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
