# https://www.django-rest-framework.org/api-guide/status-codes/
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from apps.vrmchat.models import RoomSettings
from ..serializers import RoomSettingsRoomNameSerializer

class RoomSettingsRoomNameViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def get(self, request, room_id, *args, **kwargs):
        try:
            room_settings_obj = get_object_or_404(RoomSettings,
                                                  room_id__create_user = request.user,
                                                  room_id__room_id     = room_id,
                                                  room_id__is_active   = True,)
            serializer = RoomSettingsRoomNameSerializer(instance=room_settings_obj)
            response   = Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response