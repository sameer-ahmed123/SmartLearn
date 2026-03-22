from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Course, ContentSource, Lecture, Enrollment, LectureProgress
from .services import ProgressService, AnalyticsService

User = get_user_model()

class LectureArchitectureTest(TestCase):
    def setUp(self):
        """Set up the environment for every test."""
        # Create Users
        self.teacher = User.objects.create_user(
            email="teacher@test.com", password="pass", full_name="Dr. Smith", role="teacher"
        )
        self.student = User.objects.create_user(
            email="student@test.com", password="pass", full_name="John Doe", role="student"
        )

        # Create Course & Content
        self.course = Course.objects.create(
            title="Django Advanced", teacher=self.teacher, status="published"
        )
        self.source_1 = ContentSource.objects.create(course=self.course, uploaded_by=self.teacher)
        self.source_2 = ContentSource.objects.create(course=self.course, uploaded_by=self.teacher)

        # Create Lectures (1 Validated, 1 Pending)
        self.lecture_v = Lecture.objects.create(
            topic="Models", content_source=self.source_1, 
            generated_by=self.teacher, validation_status="validated"
        )
        self.lecture_p = Lecture.objects.create(
            topic="Views", content_source=self.source_2, 
            generated_by=self.teacher, validation_status="pending"
        )

        # Enroll Student
        Enrollment.objects.create(student=self.student, course=self.course)

    # --- 1. TEST THE SHIELD (ProgressService) ---
    def test_shield_prevents_backwards_progress(self):
        """Verify that progress can only increase."""
        # Start at 45%
        ProgressService.update_lecture_progress(self.student, self.lecture_v, 45)
        
        # Try to set it to 10% (Should be ignored)
        ProgressService.update_lecture_progress(self.student, self.lecture_v, 10)
        
        progress = LectureProgress.objects.get(user=self.student, lecture=self.lecture_v)
        self.assertEqual(progress.progress_percentage, 45, "The Shield failed: Progress decreased!")

    # --- 2. TEST THE MATH (AnalyticsService) ---
    def test_analytics_calculation_is_accurate(self):
        """Verify the 50% completion math (1 validated out of 2 sources)."""
        # We pass None for request_context since we're just checking the 'stats' math here
        data = AnalyticsService.get_student_dashboard_data(self.student, {'request': None})
        
        # 1 validated / 2 total sources = 50%
        expected_completion = 50 
        self.assertEqual(data['stats']['completion'], expected_completion)

    # --- 3. TEST THE MANAGER (CourseQuerySet) ---
    def test_manager_filters_correctly(self):
        """Ensure students don't see unpublished courses."""
        # Create a draft course
        Course.objects.create(title="Secret Course", teacher=self.teacher, status="draft")
        
        published_courses = Course.objects.published()
        self.assertEqual(published_courses.count(), 1)
        self.assertEqual(published_courses.first().title, "Django Advanced")