from rest_framework.serializers import ModelSerializer
from apps.user_properties.models import UserReceptionSetting

class UserReceptionSettingSerializer(ModelSerializer):

    class Meta:
        model  = UserReceptionSetting
        fields = ['is_receive_all', 'is_receive_important_only']
        read_only_fields = ('id','unique_account_id',)