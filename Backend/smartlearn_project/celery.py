import os,eventlet,sys # type: ignore
from celery import Celery
from dotenv import load_dotenv

# ------ COMMAND TO RUN CELERY WORKER : celery -A smartlearn_project worker -l info --pool=solo   ------ #
# ------ COMMAND TO RUN CELERY WORKER : celery -A smartlearn_project worker -l info --pool=eventlet -c 10   ------ #
# ------ --pool=solo ==> for one task at a time ----- #
# -----  --pool=eventlet ==> for upto 10 tasks at a time ----- #


# # Check if the process being run is explicitly the Celery worker process
# # This prevents the monkey patch from breaking Django's runserver or shell commands.
# is_celery_worker = 'celery' in sys.argv and 'worker' in sys.argv
# # --- EVENTLET MONKEY PATCH FOR ASYNCHRONOUS POOL ---
# # This must be done BEFORE any other modules that use non-greened I/O functions.
# try:
#     # Patch Python's standard libraries for asynchronous behavior
#     eventlet.monkey_patch() 
# except ImportError:
#     # eventlet is not mandatory for solo mode, so we skip the patch if not installed.
#     pass
# # --- END PATCH ---  ===> patch wala kaam end pe dehku ga

load_dotenv()

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
