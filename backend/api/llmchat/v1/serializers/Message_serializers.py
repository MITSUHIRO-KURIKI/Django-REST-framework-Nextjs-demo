from rest_framework.serializers import ModelSerializer, CharField
from apps.llmchat.models import Message

class MessageSerializer(ModelSerializer):

    room_id = CharField(source='room_id.room_id', read_only=True)

    class Meta:
        model  = Message
        fields = '__all__'
        read_only_fields = ('id','room_id','message_id')