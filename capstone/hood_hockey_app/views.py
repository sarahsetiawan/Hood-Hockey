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
from django.db import connection

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

def clean_lines(lines_df):
    # Replace '-' with 0
    lines_df.replace('-', 0, inplace=True)
    # Convert '0' values to '00:00' in specified time columns if they exist
    time_columns = ['Time on ice', 'Power play time']
    for col in time_columns:
        if col in lines_df.columns:
            lines_df[col] = lines_df[col].replace('0', '00:00')
            # Fill NaN values with '00:00' before splitting
            lines_df[col] = lines_df[col].fillna('00:00')
            # Split the time into minutes and seconds
            lines_df[[f'{col} (mins)', f'{col} (secs)']] = lines_df[col].str.split(':', expand=True)
            # Fill NaN values in the new columns with 0 and convert to integers
            lines_df[f'{col} (mins)'] = lines_df[f'{col} (mins)'].fillna(0).astype(int)
            lines_df[f'{col} (secs)'] = lines_df[f'{col} (secs)'].fillna(0).astype(int)
        else:
            print(f"Column '{col}' not found in DataFrame")
    # Split the time columns into minutes and seconds, fill NaN values with 0, and convert to integers
    for col in time_columns:
        if col in lines_df.columns:
            lines_df[col] = lines_df[col].replace('0', '00:00')
            # Fill NaN values with '00:00' before splitting
            lines_df[col] = lines_df[col].fillna('00:00')
            # Split the time into minutes and seconds
            lines_df[[f'{col} (mins)', f'{col} (secs)']] = lines_df[col].str.split(':', expand=True)
            # Fill NaN values in the new columns with 0 and convert to integers
            lines_df[f'{col} (mins)'] = lines_df[f'{col} (mins)'].fillna(0).astype(int)
            lines_df[f'{col} (secs)'] = lines_df[f'{col} (secs)'].fillna(0).astype(int)
        else:
            print(f"Column '{col}' not found in DataFrame")
    # Drop the original columns
    lines_df = lines_df.drop(time_columns, axis=1)
    return lines_df

def clean_games(games):
    games.replace('-', 0, inplace=True)
    # Remove rows where 'Opponent' contains 'Average'
    games_cleaned = games[~games['Opponent'].str.contains('Average', na=False)]
    # Split the 'Score' column into two separate columns
    games_cleaned[['Hood Score', 'Opponent Score']] = games_cleaned['Score'].str.split(':', expand=True)

    # Convert the new columns to numeric type
    games_cleaned['Hood Score'] = pd.to_numeric(games_cleaned['Hood Score']).astype(int)
    games_cleaned['Opponent Score'] = pd.to_numeric(games_cleaned['Opponent Score']).astype(int)

    # Convert percentage columns to float after removing '%'
    percentage_columns = ['Faceoffs won, %', 'Faceoffs won in DZ, %', 'Faceoffs won in NZ, %', 'Faceoffs won in OZ, %']
    for col in percentage_columns:
        if col in games_cleaned.columns:
            games_cleaned[col] = games_cleaned[col].str.replace('%', '').astype(float)
            # Convert the column to string before replacing '%'
            games_cleaned[col] = games_cleaned[col].astype(str).str.replace('%', '').astype(float)
        else:
            print(f"Column '{col}' not found in DataFrame")
    # Splitting 'Penalty time' into minutes and seconds
    games_cleaned[['Penalty time (Minutes)', 'Penalty time (Seconds)']] = games_cleaned['Penalty time'].str.split(':', expand=True)
    games_cleaned['Penalty time (Minutes)'] = games_cleaned['Penalty time (Minutes)'].astype(int)
    games_cleaned['Penalty time (Seconds)'] = games_cleaned['Penalty time (Seconds)'].astype(int)
    # Drop the Score and Goal column -- Drop Date column for now
    games_cleaned = games_cleaned.drop(columns=['Score', 'Goals', 'Date', 'Penalty time'])
    # Replace NaN values with 0
    games_cleaned = games_cleaned.fillna(0)
    return games_cleaned


def clean_goalies(goalies_df):
    goalies_df.replace('-', 0, inplace=True)
    # Convert '0' values to '00:00' in specified time columns if they exist
    time_columns = ['Time on ice', 'Penalty time']
    for col in time_columns:
        if col in goalies_df.columns:
            goalies_df[col] = goalies_df[col].replace('0', '00:00')
        else:
            print(f"Column '{col}' not found in DataFrame")
    # Convert percentage columns to float after removing '%'
    percentage_columns = ['Saves, %', 'Scoring chance saves, %']
    for col in percentage_columns:
        if col in goalies_df.columns:
            goalies_df[col] = goalies_df[col].str.replace('%', '').astype(float)
            # Convert the column to string before replacing '%'
            goalies_df[col] = goalies_df[col].astype(str).str.replace('%', '').astype(float)
        else:
            print(f"Column '{col}' not found in DataFrame")
    time_columns = ['Time on ice', 'Penalty time']
    for col in time_columns:
        if col in goalies_df.columns:
            goalies_df[col] = goalies_df[col].replace('0', '00:00')
            # Fill NaN values with '00:00' before splitting
            goalies_df[col] = goalies_df[col].fillna('00:00')
            # Split the time into minutes and seconds
            goalies_df[[f'{col} (mins)', f'{col} (secs)']] = goalies_df[col].str.split(':', expand=True)
            # Fill NaN values in the new columns with 0 and convert to integers
            goalies_df[f'{col} (mins)'] = goalies_df[f'{col} (mins)'].fillna(0).astype(int)
            goalies_df[f'{col} (secs)'] = goalies_df[f'{col} (secs)'].fillna(0).astype(int)
        else:
            print(f"Column '{col}' not found in DataFrame")
    # Drop the original columns
    goalies_df = goalies_df.drop(time_columns, axis=1)
    return goalies_df

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
            elif table == "hood_hockey_app_goalies":
                df = clean_goalies(df)
            elif table == "hood_hockey_app_games":
                df = clean_games(df)
            elif table == "hood_hockey_app_lines":
                df = clean_lines(df)
            else:
                print("No cleaning function found for this table")



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
    print("-----------------------------------------------------------")
    print("Lines Upload View")
    print("-----------------------------------------------------------")
    def post(self, request, *args, **kwargs):
        print("-----------------------------------------------------------")
        print("Lines post function")
        print("-----------------------------------------------------------")
        return upload("hood_hockey_app_lines", request)
    
# Drive
class DriveFileUploadView(views.APIView):
    def post(self, request, *args, **kwargs):
        return upload("hood_hockey_app_drive", request, json=True)

# ------------------------
# Lines Rankings 
# ------------------------

class LinesRankingsView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM hood_hockey_app_lines;")
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)