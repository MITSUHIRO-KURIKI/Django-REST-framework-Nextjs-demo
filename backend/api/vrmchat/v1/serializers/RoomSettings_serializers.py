from rest_framework.serializers import ModelSerializer
from apps.vrmchat.models import RoomSettings

class RoomSettingsSerializer(ModelSerializer):

    class Meta:
        model  = RoomSettings
        fields = '__all__'
        read_only_fields = ('id','room_id',)