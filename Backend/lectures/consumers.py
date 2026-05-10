import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GroupMessage

class StudyRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'study_room_{self.room_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Check if it's a chat message or signaling (for video)
        msg_type = data.get('type', 'chat')

        if msg_type == 'chat':
            message = data.get('message')
            
            # User profile se sahi naam uthayein (Middleware ki wajah se scope['user'] authenticated hoga)
            user = self.scope['user']
            if user.is_authenticated:
                # Agar model mein full_name hai toh wo, warna username
                sender_name = getattr(user, 'full_name', user.username)
            else:
                sender_name = "Anonymous"
            
            # Save message to DB (intezar karne ki zaroorat nahi, background mein save ho jayega)
            await self.save_message(message)

            # Send message to group (Isi broadcast se doosre profile ko msg milega)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender_name
                }
            )
        
        # Signaling for Video/Audio (WebRTC)
        elif msg_type in ['offer', 'answer', 'candidate']:
            # Broadcast signaling data to everyone else in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signal_message',
                    'data': data,
                    'sender_channel_name': self.channel_name # Taake sender ko wapas na milay (optional check)
                }
            )

    async def chat_message(self, event):
        # WebSocket ko message wapas bhej raha hai
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'sender': event['sender']
        }))

    async def signal_message(self, event):
        # WebRTC signals ko send karna (Lekin sender ko wapas nahi bhejna chahiye)
        # Agar aap Peer-to-Peer logic use kar rahe hain toh ye zaroori hai
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def save_message(self, content):
        # Database mein save karne ka logic
        if self.scope['user'].is_authenticated and content:
            return GroupMessage.objects.create(
                sender=self.scope['user'],
                content=content,
                room_id=self.room_id
            )
        return None