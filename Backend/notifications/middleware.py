from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        # Token ko validate karna aur user nikalna
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        # Agar token expire ho ya invalid ho toh AnonymousUser return karein
        print(f"WebSocket Auth Error: {e}")
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Query string se token nikalna (e.g., ?token=...)
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token_key = query_params.get("token")

        # FIX: Check karein ke token maujood ho aur wo string 'null' na ho
        if token_key and token_key != 'null' and token_key != 'undefined':
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)