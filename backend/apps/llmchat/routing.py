from django.urls import path
from .consumers import LlmChatConsumer

llmchat_websocket_urlpatterns = [
    path('ws/llmchat/room/<str:room_id>', LlmChatConsumer.as_asgi()),
]