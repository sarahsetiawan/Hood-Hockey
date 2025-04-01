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
import numpy as np
import json
import matplotlib
matplotlib.use('Agg') # Fix threading issue
import matplotlib.pyplot as plt
import plotly.graph_objects as go

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

def clean_drive(df):
    # Add extra columns to the DataFrame 
    extra_cols = [
        'with_puck', 'sk_back', 'endurance', 'endurance_on',
        'zoneT', 'period', 'homeSide', 'zoneCat',
        'NumInD', 'NumInO', 'NumInN', 'TotalOnIce',
        'playDirection', 'zoneCat_team', 'closestOppTagId',
        'dist_to_opp', 'closestOppx', 'closestOppy', 'playerId_y'
    ]

    for col in extra_cols:
        if col not in df.columns:
            df[col] = np.nan
    
    # ✅ Replace empty strings across the whole DataFrame
    df.replace('', np.nan, inplace=True)

    # ✅ Convert boolean-like columns to float
    bool_cols = ['with_puck', 'sk_back', 'endurance', 'endurance_on', 
                 'speedUp', 'speedDown_end', 'speedUp_start', 
                 'gap', 'deaccel', 'g_force_peak']

    for col in bool_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # ✅ Remove non-numeric columns from float conversion
    float_cols = [
        'x', 'y', 'vx', 'vy', 'q', 'superframe', 'speed', 'acceleration',
        'ax', 'ay', 'totalDistance', 'displacement', 'skatingAngle',
        'curvature', 'radius_curvature', 'a_tot', 'a_centripetal',
        'g_force', 'lean', 'g_force_avg', 'toi'
    ]

    for col in float_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # ✅ Rearrange columns to match the other data frames
    df = df[['tagId', 'timestamp', 'x', 'y', 'vx', 'vy', 'q', 'superframe', 'speed',
       'acceleration', 'ax', 'ay', 'totalDistance', 'displacement', 'playerId',
       'gameStatus', 'skatingAngle', 'speedUp', 'zone', 'playingPosition',
       'speedDown_end', 'speedUp_start', 'team', 'gap', 'curvature',
       'radius_curvature', 'a_tot', 'a_centripetal', 'g_force', 'lean',
       'skatingEdge', 'g_force_avg', 'g_force_peak', 'deaccel',
       'sustained_speed', 'anomaly', 'playerShift', 'playerShiftNum', 'toi',
       'with_puck', 'sk_back', 'endurance', 'endurance_on', 'zoneT', 'period',
       'homeSide', 'zoneCat', 'NumInD', 'NumInO', 'NumInN', 'TotalOnIce',
       'playDirection', 'zoneCat_team', 'closestOppTagId', 'dist_to_opp',
       'closestOppx', 'closestOppy', 'playerId_y']]

    return df



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
    # Convert date column to datetime 
    games_cleaned['Date'] = pd.to_datetime(games_cleaned['Date'], format='%m/%d/%Y')
    # Drop the Score and Goal column 
    games_cleaned = games_cleaned.drop(columns=['Score', 'Goals', 'Penalty time'])
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
            elif table == "hood_hockey_app_drive":
                df = clean_drive(df)
            else:
                print("No cleaning function found for this table")



            # Push data to SQL -- replace or append 
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
        return upload("hood_hockey_app_drive", request, json=True, replace=False)

# ------------
# Lines 
# ------------

# Lines ranking 
class LinesRankingsView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                # Query for CORSI ranking
                cursor.execute("""
                    SELECT "Line", "CORSI", 
                           RANK() OVER (ORDER BY "CORSI" DESC) AS "CORSI Rank"
                    FROM hood_hockey_app_lines
                    LIMIT 5
                """)
                corsi_columns = [col[0] for col in cursor.description]
                corsi_results = [dict(zip(corsi_columns, row)) for row in cursor.fetchall()]

                # Query for Goals ranking
                cursor.execute("""
                    SELECT "Line", "Goals", 
                           RANK() OVER (ORDER BY "Goals" DESC) AS "Goals Rank"
                    FROM hood_hockey_app_lines
                    LIMIT 5
                """)
                goals_columns = [col[0] for col in cursor.description]
                goals_results = [dict(zip(goals_columns, row)) for row in cursor.fetchall()]

            # Return a combined JSON response
            return Response(
                {
                    "corsi": corsi_results,
                    "goals": goals_results
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------
# Skaters
# ------------

import io
import base64

# PER Rankings
class PERView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get skaters data
                cursor.execute("""
                    SELECT *
                    FROM hood_hockey_app_skaters
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                skaters = pd.DataFrame(results, columns=columns)

                # Seperate into forwards and defenders
                forwards = skaters[skaters['Position'] == 'F']
                defenders = skaters[skaters['Position'] == 'D']

                # Calculate PER for forwards
                offensive_value = 2 * forwards['Goals'] + 1.75 * forwards['First assist'] + 1.5 * forwards['Second assist']
                defensive_value = 1.5 * forwards['Hits'] + 2 * forwards['Blocked shots']
                per = (offensive_value / defensive_value) / forwards['Time on ice (Minutes)']
                forwards['PER'] = per

                # Calculate PER for defenders
                offensive_value = 2 * defenders['Goals'] + 1.75 * defenders['First assist'] + 1.5 * defenders['Second assist']
                defensive_value = 1.5 * defenders['Hits'] + 2 * defenders['Blocked shots']
                per = (offensive_value / defensive_value) / defenders['Time on ice (Minutes)']
                defenders['PER'] = per

                # Rank by PER
                forwards = forwards.sort_values(by='PER', ascending=False)
                defenders = defenders.sort_values(by='PER', ascending=False)

                ### Remove inf values
                forwards = forwards.replace([np.inf, -np.inf], np.nan).dropna()

                return Response(
                    {
                        "top_forwards": forwards.to_dict(orient='records'),
                        "top_defenders": defenders.to_dict(orient='records')
                    },
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            print(f"Error in PERView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

## GAR - Modified to send raw data for frontend splitting
class GARView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        metric = request.query_params.get('metric', 'Points')
        allowed_metrics = ['Points', 'Goals', 'Assists']

        print(f"--- GARView: Received request for metric = {metric} ---")

        if metric not in allowed_metrics:
            return Response(
                {"error": f"Invalid metric. Allowed metrics are: {', '.join(allowed_metrics)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ar_column_name = f"{metric}AR"

        try:
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT "Shirt number", "Player", "Position", "Points", "Goals", "Assists"
                    FROM hood_hockey_app_skaters
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                skaters = pd.DataFrame(results, columns=columns)

                for col in allowed_metrics:
                    skaters[col] = pd.to_numeric(skaters[col], errors='coerce')
                essential_cols = ['Shirt number', 'Player', 'Position', metric]
                skaters.dropna(subset=essential_cols, inplace=True)

                forwards = skaters[skaters['Position'] == 'F'].copy()
                defenders = skaters[skaters['Position'] == 'D'].copy()

                chart_data_forwards = None
                top_forwards_df = pd.DataFrame(columns=['Shirt number', 'Player', metric, ar_column_name])

                chart_data_defenders = None
                top_defenders_df = pd.DataFrame(columns=['Shirt number', 'Player', metric, ar_column_name])

                # --- Process Forwards ---
                if not forwards.empty:
                    replacement_fwd = float(forwards[metric].quantile(0.30))
                    forwards.loc[:, ar_column_name] = forwards[metric] - replacement_fwd
                    forwards = forwards.sort_values(by=ar_column_name, ascending=False)
                    top_forwards_df = forwards[['Shirt number', 'Player', metric, ar_column_name]].head(5)

                    # --- Prepare Chart Data (Raw Values for Frontend Splitting) ---
                    chart_forwards = forwards.sort_values(by=ar_column_name, ascending=False)

                    chart_data_forwards = {
                        "players": chart_forwards['Player'].tolist(),
                        "metric_values": chart_forwards[metric].tolist(), # Send base metric values
                        "ar_values": chart_forwards[ar_column_name].tolist(), # Send AR values
                        "threshold_metric": replacement_fwd, # Send the threshold value
                        "metric": metric,
                        "ar_column": ar_column_name,
                    }


                # --- Process Defenders ---
                if not defenders.empty:
                    replacement_def = float(defenders[metric].quantile(0.30))
                    defenders.loc[:, ar_column_name] = defenders[metric] - replacement_def
                    defenders = defenders.sort_values(by=ar_column_name, ascending=False)
                    top_defenders_df = defenders[['Shirt number', 'Player', metric, ar_column_name]].head(5)

                    chart_defenders = defenders.sort_values(by=ar_column_name, ascending=False)

                    chart_data_defenders = {
                        "players": chart_defenders['Player'].tolist(),
                        "metric_values": chart_defenders[metric].tolist(),
                        "ar_values": chart_defenders[ar_column_name].tolist(),
                        "threshold_metric": replacement_def,
                        "metric": metric,
                        "ar_column": ar_column_name,
                    }

                response_data = {
                        "top_forwards": top_forwards_df.to_dict(orient='records'),
                        "top_defenders": top_defenders_df.to_dict(orient='records'),
                        "chart_data_forwards": chart_data_forwards,
                        "chart_data_defenders": chart_data_defenders
                    }
                print(f"--- GARView: Sending response data keys: {response_data.keys()} ---")

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"!!! ERROR in GARView for metric '{metric}' !!!")
            return Response({"error": f"An error occurred processing metric '{metric}': {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# GAR
# class GARView(views.APIView):
#     permission_classes = [AllowAny]
# 
#     def get(self, request, metric="Points"):
#         try:
#             with connection.cursor() as cursor:
#                     # Get skaters data
#                     cursor.execute("""
#                         SELECT "Shirt number", "Player", "Position", "Points", "Goals", "Assists"
#                         FROM hood_hockey_app_skaters
#                     """)
#                     results = cursor.fetchall()
#                     columns = [col[0] for col in cursor.description]
# 
#                     # All skaters
#                     skaters = pd.DataFrame(results, columns=columns)
#                     # Forwards
#                     forwards = skaters[skaters['Position'] == 'F']
#                     # Defenders
#                     defenders = skaters[skaters['Position'] == 'D']
# 
#                     # Calculate replacement level (30th percentile -- may need adjustment) for each position
#                     replacement_fwd = forwards[metric].quantile(0.30)
#                     replacement_def = defenders[metric].quantile(0.30)
#                     # Add PAR/GAR/AAR to data frames and rank
#                     if metric == "Points":
#                         forwards['PointsAR'] = forwards['Points'] - replacement_fwd
#                         forwards = forwards.sort_values(by='PointsAR', ascending=False)
#                         defenders['PointsAR'] = defenders['Points'] - replacement_def
#                         defenders = defenders.sort_values(by='PointsAR', ascending=False)
#                         # Top 5 forwards and defenders
#                         top_forwards = forwards[['Shirt number', 'Player', metric, 'PointsAR']].head(5)
#                         top_defenders = defenders[['Shirt number', 'Player', metric, 'PointsAR']].head(5)
#                     elif metric == "Goals":
#                         forwards['GoalsAR'] = forwards['Goals'] - replacement_fwd
#                         forwards = forwards.sort_values(by='GoalsAR', ascending=False)
#                         defenders['GoalsAR'] = defenders['Goals'] - replacement_def
#                         defenders = defenders.sort_values(by='GoalsAR', ascending=False)
#                         # Top 5 forwards and defenders
#                         top_forwards = forwards[['Shirt number', 'Player', metric, 'GoalsAR']].head(5)
#                         top_defenders = defenders[['Shirt number', 'Player', metric, 'GoalsAR']].head(5)
#                     elif metric == "Assists":
#                         forwards['AssistsAR'] = forwards['Assists'] - replacement_fwd
#                         forwards = forwards.sort_values(by='AssistsAR', ascending=False)
#                         defenders['AssistsAR'] = defenders['Assists'] - replacement_def
#                         defenders = defenders.sort_values(by='AssistsAR', ascending=False)
#                         # Top 5 forwards and defenders
#                         top_forwards = forwards[['Shirt number', 'Player', metric, 'AssistsAR']].head(5)
#                         top_defenders = defenders[['Shirt number', 'Player', metric, 'AssistsAR']].head(5)
#                     else:
#                         return Response({"error": "Invalid metric. Please choose 'Points', 'Goals', or 'Assists'."}, status=status.HTTP_400_BAD_REQUEST)
# 
#                     return Response(
#                         {
#                             "top_forwards": top_forwards.to_dict(orient='records'),
#                             "top_defenders": top_defenders.to_dict(orient='records')
#                         },
#                         status=status.HTTP_200_OK
#                     )
#         except Exception as e:
#             return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
# Goals Vs. Max Speed
class FitnessCorrelationView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                # Get skaters data
                cursor.execute("""
                    SELECT "Shirt number", "Goals"
                    FROM hood_hockey_app_skaters
                """)
                skater_results = cursor.fetchall()
                skater_columns = [col[0] for col in cursor.description]

                # Get DRIVE data
                cursor.execute("""
                    SELECT "playerId", MAX("speed") AS max_speed
                    FROM hood_hockey_app_drive
                    GROUP BY "playerId"
                """)
                drive_results = cursor.fetchall()
                drive_columns = [col[0] for col in cursor.description]

            # Initial data frames
            skaters_df = pd.DataFrame(skater_results, columns=skater_columns)
            drive_df = pd.DataFrame(drive_results, columns=drive_columns)
            print("----------------------------------------------------------")
            print("Inititial DFs")
            print("----------------------------------------------------------")
            print("skaters")
            print(skaters_df)
            print("drive")
            print(drive_df)

            # --- Data Cleaning and Processing ---

            # DRIVE processing: Convert playerId to integer
            drive_df['playerId'] = drive_df['playerId'].str.lstrip('h').astype(int)
            drive_df = drive_df.rename(columns={'playerId': 'player_id', 'max_speed': 'max_speed'})

            # Skaters processing:  Rename, Replace, *then* assign player_id
            skaters_df = skaters_df.rename(columns={'Shirt number': 'shirt_number', 'Goals': 'goals'})
            skaters_df['shirt_number'] = skaters_df['shirt_number'].astype(int)
            skaters_df['player_id'] = skaters_df['shirt_number']  # Assign player_id *after* cleaning goals

            print("----------------------------------------------------------")
            print("After processing")
            print("----------------------------------------------------------")
            print("skaters")
            print(skaters_df)
            print("drive")
            print(drive_df)

            # --- Data Merging ---
            merged_df = pd.merge(drive_df, skaters_df, on='player_id', how='inner')

            print("----------------------------------------------------------")
            print("Merged df")
            print("----------------------------------------------------------")
            print(merged_df)

            if merged_df.empty:
                return Response({"message": "No matching data found for players and their speeds/goals."}, status=status.HTTP_204_NO_CONTENT)

            # --- Scatterplot Data Prep and Plotting ---
            plt.figure(figsize=(8, 6))
            plt.scatter(merged_df['max_speed'], merged_df['goals'])
            plt.xlabel('Max Speed')
            plt.ylabel('Goals')
            plt.title('Scatterplot of Max Speed vs Goals')
            plt.grid(True)

            # --- Save and Return Image ---
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            image_base64 = base64.b64encode(buf.read()).decode('utf-8')
            return Response({'image': image_base64}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in FitnessCorrelationView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# --------------------
# Games
# --------------------

# Basic query 
class GamesQueryView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get skaters data
                cursor.execute("""
                    SELECT *
                    FROM hood_hockey_app_games
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                games_data = [dict(zip(columns, row)) for row in results]
                return Response({"games": games_data}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in GamesQueryView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Faceoff win %
class FaceoffWinPercentView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get skaters data
                cursor.execute("""
                    SELECT "Date", "Faceoffs won, %"
                    FROM hood_hockey_app_games
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                games = pd.DataFrame(results, columns=columns)
                games = games.sort_values(by='Date')
                # Line graph
                plt.plot(games['Date'], games['Faceoffs won, %'], marker='o', linestyle='-', color='b')
                plt.xlabel('Date')
                plt.ylabel('Faceoffs won (%)')
                plt.title('Faceoff Win Percentage Over Time')
                plt.xticks(rotation=45)
                plt.grid(True)
                # Save and Return Image
                buf = io.BytesIO()
                plt.savefig(buf, format='png')
                plt.close()
                buf.seek(0)
                image_base64 = base64.b64encode(buf.read()).decode('utf-8')
                return Response({'image': image_base64}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in FitnessCorrelationView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------
# Goalies
# -------------------

# Basic query
class GoaliesQueryView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get goalies data
                cursor.execute("""
                    SELECT * 
                    FROM hood_hockey_app_goalies
                """)  
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                goalies_data = [dict(zip(columns, row)) for row in results]
                return Response({"goalies": goalies_data}, status=status.HTTP_200_OK) 

        except Exception as e:
            print(f"Error in GoaliesQueryView: {e}")  # Corrected class name
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Save percentage bar chart
class GoaliesSavePercentBarChartView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get goalies data
                cursor.execute("""
                    SELECT "Player", "Games played", "Saves", "Saves, %"
                    FROM hood_hockey_app_goalies
                """) 
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                goalies = pd.DataFrame(results, columns=columns)
                #goalies['Saves, %'] = goalies['Saves, %'].str.rstrip('%').astype(float)
                # Save % bar chart
                plt.figure()
                plt.bar(goalies['Player'], goalies['Saves, %'])
                plt.xlabel('Player')
                plt.ylabel('Saves (%)')
                plt.title('Save Percentage by Player')
                plt.ylim(0, 100)  # Set y-axis limits from 0 to 100
                plt.yticks(ticks=[10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                plt.xticks(rotation=45)
                # Save and Return Image 
                buf = io.BytesIO()
                plt.savefig(buf, format='png')
                plt.close()
                buf.seek(0)
                image_base64 = base64.b64encode(buf.read()).decode('utf-8')
                return Response({'image': image_base64}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in FitnessCorrelationView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Saves per game bar chart
class SavesPerGameView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Get goalies data
                cursor.execute("""
                    SELECT "Player", "Games played", "Saves"
                    FROM hood_hockey_app_goalies
                """) 
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                goalies = pd.DataFrame(results, columns=columns)
                # Add saves per game to df
                goalies['Saves per Game'] = goalies['Saves'] / goalies['Games played']
                # Saves per game bar chart
                plt.figure()
                plt.bar(goalies['Player'], goalies['Saves per Game'])
                plt.xlabel('Player')
                plt.ylabel('Saves per Game')
                plt.title('Saves per Game by Player')
                plt.xticks(rotation=45)
                # Save and Return Image 
                buf = io.BytesIO()
                plt.savefig(buf, format='png')
                plt.close()
                buf.seek(0)
                image_base64 = base64.b64encode(buf.read()).decode('utf-8')
                return Response({'image': image_base64}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in FitnessCorrelationView: {e}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -------------------
# Drive
# -------------------

# Basic query
class DriveBasicQueryView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT *
                    FROM hood_hockey_app_drive 
                    LIMIT 5
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                drive_data = [dict(zip(columns, row)) for row in results]
                return Response({"drive": drive_data}, status=status.HTTP_200_OK) 
        except Exception as e:
            print(f"Error in GoaliesQueryView: {e}")  # Corrected class name
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)