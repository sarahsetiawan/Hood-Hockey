from django.contrib import admin
from django.urls import path, include
from hood_hockey_app.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("hood_hockey_app/user/register/", CreateUserView.as_view(), name="register"),
    path("hood_hockey_app/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("hood_hockey_app/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("hood_hockey_app-auth/", include("rest_framework.urls")),
    path("hood_hockey_app/", include("hood_hockey_app.urls")),
]