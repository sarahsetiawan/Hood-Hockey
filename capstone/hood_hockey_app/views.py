from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import GamesSerializer, UserSerializer, testSerializer
from .models import Games, test
import pandas as pd
from sqlalchemy import create_engine
import os
from django.conf import settings

# ------------------------------------------------------
# PostgreSQL database connection settings 
# ------------------------------------------------------

# Database Credentials 
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

class testListCreate(generics.ListCreateAPIView):
    serializer_class = testSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return test.objects

#     def perform_create(self, serializer):
#         if serializer.is_valid():
#             serializer.save(author=self.request.user) 
#         else:
#             print(serializer.errors)    

class GamesListCreate(generics.ListCreateAPIView):
    serializer_class = GamesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Games.objects.filter(author=user) ### May need to change

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user) 
        else:
            print(serializer.errors)


class GamesDelete(generics.DestroyAPIView):
    serializer_class = GamesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Games.objects.filter(author=user) ### May need to change


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# ---------------------------------
# File Upload Handling
# ---------------------------------

# Games
class GamesFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)

        # Save the file locally
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        try:
            # Read the Excel file with Pandas
            df = pd.read_excel(file_path)

            # Connect to PostgreSQL
            db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            engine = create_engine(db_url)

            # -----------------------------------------
            # Data cleaning/transformation
            # -----------------------------------------

            ### Cleaning functions here


            # Push data to SQL 
            ### change if_exists to append to append data to existing table
            ### change if_exists to replace to replace data in existing table
            table_name = "hood_hockey_app_games"  
            df.to_sql(table_name, engine, if_exists='replace', index=False)

            return Response({"message": "File uploaded and stored in database!"}, status=status.HTTP_201_CREATED)

        except pd.errors.ParserError as pe:
            return Response({"error": f"Pandas parsing error: {str(pe)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 