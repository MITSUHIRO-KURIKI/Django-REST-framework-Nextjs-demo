from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenVerifyView, TokenBlacklistView,
)
from .viewsets import (
    CustomTokenObtainPairViewSet, CustomTokenRefreshViewSet,
    CustomTokenBlacklistViewSet, CustomTokenVerifyViewSet,
    CSRFTokenViewSet,
)

app_name = 'api.token.v1'

# JWT トークン取得/再取得/検証
## djoser.urls.jwt
## https://djoser.readthedocs.io/en/latest/jwt_endpoints.html
urlpatterns = [
    path('create/',    CustomTokenObtainPairViewSet.as_view(), name='create'),
    path('refresh/',   CustomTokenRefreshViewSet.as_view(),    name='refresh'),
    path('verify/',    CustomTokenVerifyViewSet.as_view(),     name='verify'),
    path('blacklist/', CustomTokenBlacklistViewSet.as_view(),  name='blacklist'),
    # ↓ import { getCsrfToken } from 'next-auth/react';を使うため不要
    # path('csrf/',      CSRFTokenViewSet.as_view(),             name='csrf'),
]