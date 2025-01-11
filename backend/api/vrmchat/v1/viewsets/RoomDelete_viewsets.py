# https://www.django-rest-framework.org/api-guide/status-codes/
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from apps.vrmchat.models import Room


class RoomDeleteViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def delete(self, request, room_id, *args, **kwargs):
        try:
            room_obj = get_object_or_404(Room,
                                         create_user = request.user,
                                         room_id     = room_id,
                                         is_active   = True,)
            room_obj.is_active = False
            room_obj.save()
            response = Response({}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response