"""
URL configuration for smartlearn_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve
from django.views.decorators.clickjacking import xframe_options_sameorigin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include([
        path('auth/', include('users.urls')),
        path('lectures/', include('lectures.urls')),
        path('assessments/', include('assessment.urls')),
        path('ai/', include('ai_core.urls')),
        path('dashboard/', include('dashboard.urls')),
        path('chat/', include('chatbot.urls')),
    ])),
    path('silk/', include('silk.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, view=xframe_options_sameorigin(
        static_serve), document_root=settings.MEDIA_ROOT)
