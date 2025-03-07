from django.urls import path
from . import views
from .views import FileUploadView

urlpatterns = [
    path("games/", views.GamesListCreate.as_view(), name="games-list"),
    path("games/delete/<int:pk>/", views.GamesDelete.as_view(), name="delete-games"),
    path('upload-file/', FileUploadView.as_view(), name='file-upload'),
]