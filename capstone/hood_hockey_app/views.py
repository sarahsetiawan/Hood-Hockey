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

# -----------------------------
# Cleaning Functions
# -----------------------------

def clean_skaters(skaters):
    ### Warning message
    # <ipython-input-5-24ca94916310>:1: FutureWarning: Downcasting behavior in `replace` is deprecated 
    # and will be removed in a future version. To retain the old behavior, explicitly call `result.infer_objects(copy=False)`. 
    # To opt-in to the future behavior, set `pd.set_option('future.no_silent_downcasting', True)`
    skaters = skaters.replace('-', 0)
    percentage_columns = ['Faceoffs won, %', 'Faceoffs won in DZ, %', 'Faceoffs won in NZ, %', 'Faceoffs won in OZ, %']
    for col in percentage_columns:
        skaters[col] = skaters[col].str.replace('%', '').astype(float)
    # Convert '0' values to '00:00' in specified time columns if they exist
    skaters['Time on ice'] = skaters['Time on ice'].apply(lambda x: '00:00' if x == 0 else x)
    skaters['Penalty time'] = skaters['Penalty time'].apply(lambda x: '00:00' if x == 0 else x)
    # Splitting 'Time on ice' column into minutes and seconds
    skaters[['Time on ice (Minutes)', 'Time on ice (Seconds)']] = skaters['Time on ice'].str.split(':', expand=True)
    skaters['Time on ice (Minutes)'] = skaters['Time on ice (Minutes)'].astype(int)
    skaters['Time on ice (Seconds)'] = skaters['Time on ice (Seconds)'].astype(int)
    # Splitting 'Penalty time' into minutes and seconds
    skaters[['Penalty time (Minutes)', 'Penalty time (Seconds)']] = skaters['Penalty time'].str.split(':', expand=True)
    skaters['Penalty time (Minutes)'] = skaters['Penalty time (Minutes)'].astype(int)
    skaters['Penalty time (Seconds)'] = skaters['Penalty time (Seconds)'].astype(int)
    # Drop the original columns
    skaters = skaters.drop(['Time on ice', 'Penalty time'], axis=1)
    # Replace NaN values with 0
    skaters = skaters.fillna(0)
    return skaters

# ---------------------------------
# File Upload Handling
# ---------------------------------

# File upload function
def upload(table, request, replace=True, json=False):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)

        # Save the file locally
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        try:
            if json == False:
                # Read the Excel file with Pandas
                df = pd.read_excel(file_path)
            else:
                # Read the JSON file with Pandas
                df = pd.read_json(file_path)

            # Connect to PostgreSQL
            db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            engine = create_engine(db_url)

            # Data cleaning/transformation
            if table == "hood_hockey_app_skaters":
                df = clean_skaters(df)



            # Push data to SQL 
            ### change if_exists to append to append data to existing table
            ### change if_exists to replace to replace data in existing table
            table_name = table  
            if replace == True:
                df.to_sql(table_name, engine, if_exists='replace', index=False)
            else:
                df.to_sql(table_name, engine, if_exists='append', index=False)

            return Response({"message": "File uploaded and stored in database!"}, status=status.HTTP_201_CREATED)

        except pd.errors.ParserError as pe:
            return Response({"error": f"Pandas parsing error: {str(pe)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Test
class testFileUpload(views.APIView):
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

            # Push data to SQL 
            ### change if_exists to append to append data to existing table
            ### change if_exists to replace to replace data in existing table
            table_name = "hood_hockey_app_test"  
            df.to_sql(table_name, engine, if_exists='append', index=False)

            # -----------------------------------------
        except pd.errors.ParserError as pe:
            return Response({"error": f"Pandas parsing error: {str(pe)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Skaters 
class SkatersFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_skaters", request)

# Games
class GamesFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_games", request)
    
# Goalies
class GoaliesFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_goalies", request)
    
# Lines
class LinesFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_lines", request)
    
# Drive
class DriveFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_drive", request, json=True)