from rest_framework.serializers import ModelSerializer, ReadOnlyField
from apps.vrmchat.models import RoomSettings

class RoomSettingsRoomNameSerializer(ModelSerializer):

    room_id__room_id = ReadOnlyField(source='room_id.room_id')

    class Meta:
        model = RoomSettings
        fields = ['room_id__room_id', 'room_name',]