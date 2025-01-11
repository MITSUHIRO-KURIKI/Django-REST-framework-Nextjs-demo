# https://www.django-rest-framework.org/api-guide/status-codes/
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from django_filters import NumberFilter
from django_filters.rest_framework import FilterSet
from concurrency.fields import AutoIncVersionField
from api.utils import StandardThrottle
from apps.vrmchat.models import RoomSettings
from apps.vrmchat.models import MODEL_NAME_CHOICES
from ..serializers import RoomSettingsRoomNameSerializer

MODEL_NAME_CHOICES_TUPLE = MODEL_NAME_CHOICES()

# AutoIncVersionField を使用して filter すると型不明になるため対応
class RoomSettingsFilter(FilterSet):
    class Meta:
        model = RoomSettings
        fields = '__all__'
        filter_overrides = {
            AutoIncVersionField: {
                'filter_class': NumberFilter,
                'extra': lambda f: {
                    'lookup_expr': 'exact',
                },
            },
        }

class RoomSettingsRoomNameListViewSet(ListAPIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]
    serializer_class   = RoomSettingsRoomNameSerializer
    filterset_class    = RoomSettingsFilter

    def get_queryset(self):
        return RoomSettings.objects.filter(room_id__create_user = self.request.user,
                                           room_id__is_active=True,)