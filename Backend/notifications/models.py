from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
# Create your models here.


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    verb = models.CharField(max_length=255)
    # model relation ship table form django_content_type  (gives the app_lable_and_model_name)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    # the actual row of the model (eg ...row 4 in app_lable_and_model_name model)
    object_id = models.PositiveIntegerField()
    target = GenericForeignKey('content_type', 'object_id')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'notification'
