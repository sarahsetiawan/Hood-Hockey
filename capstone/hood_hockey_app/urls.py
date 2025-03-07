from django.urls import path
from . import views
from .views import GamesFileUploadView, testListCreate

urlpatterns = [
    path("games/", views.GamesListCreate.as_view(), name="games-list"),
    path("games/delete/<int:pk>/", views.GamesDelete.as_view(), name="delete-games"),
    path('games-upload-file/', GamesFileUploadView.as_view(), name='game-file-upload'),
    path('test/', testListCreate.as_view(), name='game-file-upload'),
]