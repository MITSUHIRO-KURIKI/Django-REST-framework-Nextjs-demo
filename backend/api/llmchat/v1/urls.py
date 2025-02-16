from django.urls import path
from .viewsets import (
    RoomCreateViewSet, RoomDeleteViewSet,
    RoomSettingsViewSet, RoomSettingsRoomNameListViewSet,
    MessageListViewSet, MessageViewSet,
)

app_name = 'api.llmchat.v1'

urlpatterns = [
    # Room model
    path('room/',              RoomCreateViewSet.as_view(), name='room_create'),
    path('room/<str:room_id>', RoomDeleteViewSet.as_view(), name='room_delete'),
    # RoomSettings model
    path('room_settings/<str:room_id>',  RoomSettingsViewSet.as_view(),             name='room_settings'),
    path('room_settings/list/room_name', RoomSettingsRoomNameListViewSet.as_view(), name='room_settings_room_name_list'),
    # Message model
    path('message/<str:room_id>',                  MessageListViewSet.as_view(), name='message_list'),
    path('message/<str:room_id>/<str:message_id>', MessageViewSet.as_view(),     name='message'),
]