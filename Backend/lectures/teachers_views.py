from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course, Lecture, ContentSource
from users.permissions import IsTeacher


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_dashboard(request):
    user = request.user

    data = {
        "total_courses": Course.objects.filter(teacher=user).count(),
        "draft_courses": Course.objects.filter(teacher=user, status="draft").count(),
        "published_courses": Course.objects.filter(teacher=user, status="published").count(),
        "pending_lectures": Lecture.objects.filter(
            content_source__course__teacher=user,
            validation_status="pending"
        ).count(),
        "content_sources": ContentSource.objects.filter(
            course__teacher=user
        ).count(),
    }

    return Response(data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Lecture
from users.permissions import IsTeacher


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsTeacher])
def validate_lecture(request, pk):
    """
    Teacher validates or rejects a lecture.
    """

    try:
        lecture = Lecture.objects.get(
            pk=pk,
            content_source__course__teacher=request.user
        )
    except Lecture.DoesNotExist:
        return Response(
            {"detail": "Lecture not found or you do not have permission."},
            status=status.HTTP_404_NOT_FOUND
        )

    validation_status = request.data.get("validation_status")
    rejection_comment = request.data.get("rejection_comment", "")

    if validation_status not in ["validated", "rejected"]:
        return Response(
            {"detail": "Invalid validation status."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if validation_status == "rejected" and not rejection_comment:
        return Response(
            {"detail": "Rejection comment is required when rejecting."},
            status=status.HTTP_400_BAD_REQUEST
        )

    lecture.validation_status = validation_status
    lecture.rejection_comment = rejection_comment if validation_status == "rejected" else None
    lecture.validated_by = request.user
    lecture.save()

    return Response(
        {
            "message": f"Lecture {validation_status} successfully.",
            "lecture_id": lecture.id,
            "status": lecture.validation_status
        },
        status=status.HTTP_200_OK
    )
