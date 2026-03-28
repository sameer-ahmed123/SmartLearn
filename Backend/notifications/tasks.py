from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from smartlearn_project import celery_app
from django.contrib.auth import get_user_model
from notifications.models import Notification
from lectures.models import Enrollment, Lecture
from django.contrib.contenttypes.models import ContentType

@celery_app.task
def create_bulk_notifications(course_id,verb,target_ct_id,target_id):
    User = get_user_model()
    target_ct = ContentType.objects.get_for_id(target_ct_id)
    
    student_ids = Enrollment.objects.filter(course_id=course_id).values_list('student_id',flat=True)
    
    print(f"DEBUG: Found {len(student_ids)} students for course {course_id}")
    
    notifications = [
        Notification(
            recipient_id = s_id,
            verb = verb,
            content_type = target_ct,
            object_id = target_id
        ) for s_id in student_ids
    ]
    
    Notification.objects.bulk_create(notifications)
    
    channel_layer = get_channel_layer()
    
    for s_id in student_ids:
        group_name = f"user_notifications_{s_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "content": {
                    "verb": verb,
                    "target_id": target_id,
                    "created_at": "Just now" # You can format the real date here
                }
            }
        )