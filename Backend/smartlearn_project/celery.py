import os
from celery import Celery

# ------ COMMAND TO RUN CELERY WORKER : celery -A smartlearn_project worker -l info --pool=solo   ------ #

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartlearn_project.settings')

# Create a Celery application instance
# The name 'smartlearn_project' is your main Django project name
app = Celery('smartlearn_project')

# Load task configuration from Django settings
# All Celery configuration keys should start with 'CELERY_' in settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps (looks for tasks.py files)
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')