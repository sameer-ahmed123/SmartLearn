from django.db.models import Sum
from .models import Course, LectureProgress, Enrollment, Lecture
from .serializers import StudentAnalyticsCourseSerializer
from lectures.tasks import generate_video_task

class ProgressService:
    """
    Handles logic related to user interactions with lecture Progress.
    """
    @staticmethod
    def update_lecture_progress(user, lecture, new_progress):
        """
        'The Shield': Updates progress only if the new value is higher.
        This prevents progress bars from 'jumping back' if a user rewinds.
        """
        progress_obj, created = LectureProgress.objects.get_or_create(
            user=user,
            lecture=lecture,
            defaults={'progress_percentage': new_progress}
        )
        
        if not created and new_progress > progress_obj.progress_percentage:
            progress_obj.progress_percentage = new_progress
            progress_obj.save()
            
        return progress_obj

    @staticmethod
    def process_lecture_validation(teacher, serializer):
        """
        Handles the saving of validation status and triggering background tasks.
        """
        updated_lecture = serializer.save(validated_by=teacher)

        # Trigger video generation only if status changed to validated
        if updated_lecture.validation_status == 'validated':
            generate_video_task.delay(updated_lecture.id)
            
        return updated_lecture
    
class AnalyticsService:
    @staticmethod
    def get_student_dashboard_data(user, request_context):
        # Using Manager:CourseQuertSet 
        enrolled_courses = Course.objects.for_user(user).published()
        
        total_comp = 0
        course_count = enrolled_courses.count()

        # Calculate math
        if course_count > 0:
            for course in enrolled_courses:
                # Optimized math: directly query instead of using Serializer methods
                total_sources = course.content_sources.count()
                if total_sources > 0:
                    validated = Lecture.objects.filter(
                        content_source__course=course, 
                        validation_status='validated'
                    ).count()
                    total_comp += int((validated / total_sources) * 100)
            
            avg_completion = int(total_comp / course_count)
        else:
            avg_completion = 0

        # Prepare the final structure
        return {
            "stats": {
                "completion": avg_completion,
                "avg_quiz": 0,
                "study_hours": 0,
                "grade": "N/A"
            },
            "courses": StudentAnalyticsCourseSerializer(
                enrolled_courses, many=True, context=request_context
            ).data,
            "recommendations": ["Keep going! Finish your pending lectures to boost your score."]
        }