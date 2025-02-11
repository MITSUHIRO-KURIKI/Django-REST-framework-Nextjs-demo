from django.urls import path
from rest_framework.routers import DefaultRouter
from .viewsets import CustomUserViewSet, AccountDeleteViewSet

app_name = 'api.accounts.v1'

# URLが uniqueAccountId と競合するのでカスタムは先に登録する
urlpatterns = [
    path('', AccountDeleteViewSet.as_view(), name='delete'),
]

# JWT アカウント関連
## djoser.urls.base
## https://djoser.readthedocs.io/en/latest/base_endpoints.html
DjoserRouter = DefaultRouter()
DjoserRouter.register('', CustomUserViewSet)
urlpatterns += DjoserRouter.urls