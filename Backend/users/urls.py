from django.urls import path
from users.views import *

urlpatterns = [
    path("test",TestIndex,name="test_index")
]
