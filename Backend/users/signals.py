from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from users.models import Profile,User

@receiver(post_save , sender=User)
def create_user_profile(sender, created, instance,**kwargs):
    if created:
        Profile.objects.create(user = instance)
        

@receiver(post_save, sender=User)
def save_user_profile(sender,instance,created,**kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()