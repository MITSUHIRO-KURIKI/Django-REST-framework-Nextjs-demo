# https://www.django-rest-framework.org/api-guide/status-codes/
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from apps.vrmchat.models import Room


class RoomCreateViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def post(self, request, *args, **kwargs):
        try:
            room     = Room.objects.create(create_user=request.user)
            response = Response({
                'roomId': room.room_id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response