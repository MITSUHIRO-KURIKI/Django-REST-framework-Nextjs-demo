from rest_framework.serializers import ModelSerializer
from apps.user_properties.models import UserProfile

class UserProfileSerializer(ModelSerializer):

    class Meta:
        model  = UserProfile
        fields = ['display_name', 'user_icon']
        read_only_fields = ('id','unique_account_id',)