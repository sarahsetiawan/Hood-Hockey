from django.urls import path
from . import views
from .views import DriveBasicQueryView, FaceoffWinPercentView, GARView, GamesFileUploadView, GamesQueryView, GoaliesQueryView, GoaliesSavePercentBarChartView, SavesPerGameView, testListCreate, testFileUpload, SkatersFileUploadView, GoaliesFileUploadView, LinesFileUploadView, DriveFileUploadView, LinesRankingsView, FitnessCorrelationView

urlpatterns = [
    path("games/", views.GamesListCreate.as_view(), name="games-list"),
    path("games/delete/<int:pk>/", views.GamesDelete.as_view(), name="delete-games"),
    path('games-upload-file/', GamesFileUploadView.as_view(), name='game-file-upload'),
    path('test/', testListCreate.as_view(), name='test-list'),
    path('tests-upload-file/', testFileUpload.as_view(), name='test-file-upload'),
    path('skaters-upload-file/', SkatersFileUploadView.as_view(), name='skater-file-upload'),
    path('goalies-upload-file/', GoaliesFileUploadView.as_view(), name='goalie-file-upload'),
    path('lines-upload-file/', LinesFileUploadView.as_view(), name='line-file-upload'),
    path('drive-upload-file/', DriveFileUploadView.as_view(), name='drive-file-upload'),
    path('lines-rankings/', LinesRankingsView.as_view(), name='lines-rankings'),
    path('fitness-corr/', FitnessCorrelationView.as_view(), name='fitness-corr'),
    path('games-query/', GamesQueryView.as_view(), name='display-games'),
    path('goalies-query/', GoaliesQueryView.as_view(), name='display-goalies'),
    path('goalies-savepercent-barchart/', GoaliesSavePercentBarChartView.as_view(), name='savepercent-chart'),
    path('saves-per-game/', SavesPerGameView.as_view(), name='saves-per-game-barchart'),
    path('faceoff-wins-graph/', FaceoffWinPercentView.as_view(), name='faceoff-wins'),
    path('drive-query/', DriveBasicQueryView.as_view(), name='drive-query'),
    path('gar/', GARView.as_view(), name='gar'),
]