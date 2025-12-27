from users.permissions import IsStudent
from lectures.models import *
from lectures.serializers import *
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.decorators import permission_classes, api_view

# -------------------------
# VIEW PUBLISHED COURSES
# -------------------------


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def student_course_list(request):
    courses = Course.objects.filter(status="published")
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)


# -------------------------
# ENROLL IN COURSE
# -------------------------

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def enroll_course(request):
    serializer = EnrollmentCreateSerializer(
        data=request.data,
        context={"request": request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Enrolled successfully"}, status=201)
    return Response(serializer.errors, status=400)


# -------------------------
# VIEW ENROLLED COURSES
# -------------------------

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def enrolled_courses(request):
    enrollments = Enrollment.objects.filter(student=request.user)
    serializer = EnrollmentListSerializer(enrollments, many=True)
    return Response(serializer.data)


# -------------------------
# UPDATE / VIEW LECTURE PROGRESS
# -------------------------

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def lecture_progress(request):
    if request.method == "GET":
        progress = LectureProgress.objects.filter(student=request.user)
        serializer = LectureProgressSerializer(progress, many=True)
        return Response(serializer.data)

    serializer = LectureProgressSerializer(
        data=request.data,
        context={"request": request}
    )
    if serializer.is_valid():
        LectureProgress.objects.update_or_create(
            student=request.user,
            lecture=serializer.validated_data["lecture"],
            defaults={"status": serializer.validated_data["status"]}
        )
        return Response({"message": "Progress updated"}, status=200)

    return Response(serializer.errors, status=400)
