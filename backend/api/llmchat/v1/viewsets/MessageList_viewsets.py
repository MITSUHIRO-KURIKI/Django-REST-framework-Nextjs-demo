# https://www.django-rest-framework.org/api-guide/status-codes/
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from django_filters import NumberFilter
from django_filters.rest_framework import FilterSet
from concurrency.fields import AutoIncVersionField
from api.utils import StandardThrottle
from apps.llmchat.models import Message
from ..serializers import MessageSerializer


# AutoIncVersionField を使用して filter すると型不明になるため対応
class MessageFilter(FilterSet):
    class Meta:
        model            = Message
        fields           = ['message_id',
                            'user_message',
                            'llm_response',
                            'date_create',]
        filter_overrides = {
            AutoIncVersionField: {
                'filter_class': NumberFilter,
                'extra': lambda f: {
                    'lookup_expr': 'exact',
                },
            },
        }

class MessageListViewSet(ListAPIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]
    serializer_class   = MessageSerializer
    filterset_class    = MessageFilter

    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        return Message.objects.filter(room_id__create_user = self.request.user,
                                      room_id__room_id     = room_id,
                                      room_id__is_active   = True,)