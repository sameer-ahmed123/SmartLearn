from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Notification
from django.contrib.contenttypes.models import ContentType
from .serializers import NotificationSerializer

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def notification_list_view(request):
    """
    GET: Fetch notification history.
    PATCH: Mark all notifications as read.
    """
    if request.method == 'GET':
        # Show latest notifications first
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        paginatior  = PageNumberPagination()
        paginatior.page_size = 10
        
        result_page = paginatior.paginate_queryset(notifications, request)
        
        serializer = NotificationSerializer(result_page, many=True)
        return paginatior.get_paginated_response(serializer.data)

    elif request.method == 'PATCH':
        # Mark all as read
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."}, status=200)

# @api_view(['PATCH'])
# @permission_classes([IsAuthenticated])
# def mark_single_as_read(request, pk):
#     """
#     PATCH: Mark a specific notification as read.
#     """
#     notification = get_object_or_404(Notification, id=pk, recipient=request.user)
#     notification.is_read = True
#     notification.save()
#     return Response({"detail": "Notification marked as read."}, status=200)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_read_by_target(request):
    """
    PATCH: Mark notifications as read based on what they point to.
    Expects payload: {"target_type": "lecture", "target_id": 33}
    """
    target_type = request.data.get('target_type')
    target_id = request.data.get('target_id')

    if not target_type or not target_id:
        return Response({"error": "Missing target data"}, status=400)

    try:
        # Find the correct table in django_content_type
        ct = ContentType.objects.get(model=target_type)
        
        # Find ANY unread notifications for this user that point to this specific item
        updated_count = Notification.objects.filter(
            recipient=request.user,
            content_type=ct,
            object_id=target_id,
            is_read=False
        ).update(is_read=True)

        return Response({"detail": f"{updated_count} notifications marked as read."}, status=200)
    
    except ContentType.DoesNotExist:
        return Response({"error": "Invalid target type"}, status=400)