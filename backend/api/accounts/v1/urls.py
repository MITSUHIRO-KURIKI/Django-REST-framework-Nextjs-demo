from rest_framework.routers import DefaultRouter
from .viewsets import CustomUserViewSet

app_name = 'api.accounts.v1'

# JWT アカウント関連
## djoser.urls.base
## https://djoser.readthedocs.io/en/latest/base_endpoints.html
DjoserRouter = DefaultRouter()
DjoserRouter.register('', CustomUserViewSet)
urlpatterns = DjoserRouter.urls