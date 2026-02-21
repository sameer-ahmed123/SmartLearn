from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from lectures.models import Lecture, Course
# Agar aapke paas assessments hain toh unka model bhi import karein
# from assessment.models import StudentProgress 

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """
    Role-based Dashboard Metrics:
    - Teachers ko unke courses/validations dikhayega.
    - Students ko unki progress/enrolled courses dikhayega.
    """
    user = request.user

    # --- TEACHER LOGIC ---
    if user.role == 'teacher':
        total_courses = Course.objects.filter(teacher=user).count()
        total_lectures = Lecture.objects.filter(generated_by=user).count()
        pending_validation_count = Lecture.objects.filter(
            generated_by=user, 
            validation_status='pending'
        ).count()
        
        return Response({
            "role": "teacher",
            "metrics": {
                "total_courses": total_courses,
                "total_lectures_generated": total_lectures,
                "pending_validation_count": pending_validation_count,
            }
        })

    # --- STUDENT LOGIC (Sameer Ahmed ka Data) ---
    elif user.role == 'student':
        # Yahan hum wo courses nikaal rahe hain jin mein student enrolled hai
        # Note: 'enrolled_students' field aapke Course model mein honi chahiye
        enrolled_courses_count = Course.objects.filter(enrolled_students=user).count()
        
        # Static data for now (Jab tak aap progress model nahi banate)
        return Response({
            "role": "student",
            "metrics": {
                "full_name": user.full_name,
                "enrolled_courses": enrolled_courses_count,
                "current_streak": 5,  # Sample data
                "average_grade": "84%", # Gradebook UI se match karne ke liye
                "pending_assignments": 12
            }
        })

    return Response({"detail": "Role not recognized"}, status=400)