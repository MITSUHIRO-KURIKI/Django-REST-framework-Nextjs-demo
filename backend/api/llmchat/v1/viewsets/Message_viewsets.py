# https://www.django-rest-framework.org/api-guide/status-codes/
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from apps.llmchat.models import Message
from ..serializers import MessageSerializer


class MessageViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def patch(self, request, room_id, message_id, *args, **kwargs):
        try:
            message_obj = Message.objects.filter(message_id           = message_id,
                                                 room_id__create_user = request.user,
                                                 room_id__room_id     = room_id,
                                                 room_id__is_active   = True,
                                            ).first()
            if message_obj:
                serializer = MessageSerializer(instance=message_obj, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                response = Response(serializer.data, status=status.HTTP_200_OK)
            else:
                response = Response({}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response

    def delete(self, request, room_id, message_id, *args, **kwargs):
        # データは残して参照不可とする
        try:
            message_obj = get_object_or_404(Message,
                                            message_id           = message_id,
                                            room_id__create_user = request.user,
                                            room_id__room_id     = room_id,
                                            room_id__is_active   = True,)
            message_obj.is_active = False
            message_obj.save()
            response = Response({}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response