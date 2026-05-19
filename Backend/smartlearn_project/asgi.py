"""
ASGI config for smartlearn_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application

# Settings and Setup must come BEFORE importing routing or models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartlearn_project.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# Import routing files
import notifications.routing
import lectures.routing 
from notifications.middleware import TokenAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(
                # Combining both notification and lecture (study room) patterns
                notifications.routing.websocket_urlpatterns + 
                lectures.routing.websocket_urlpatterns
            )
        )
    ),
})