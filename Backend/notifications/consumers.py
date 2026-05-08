import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        print(f"DEBUG: WebSocket Attempt by User: {self.scope['user']}")
        
        if self.user.is_authenticated:
            # Create a unique group name for this specific user
            self.group_name = f"user_notifications_{self.user.id}"

            # Join the group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # This method is called when we send a message to the Group from Celery
    async def send_notification(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event["content"]))