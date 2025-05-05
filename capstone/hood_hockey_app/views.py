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
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import KFold, cross_val_score
from sklearn.metrics import accuracy_score, confusion_matrix

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
    # Order columns to match table 

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

            ### # Data cleaning/transformation
            ### if table == "hood_hockey_app_skaters":
            ###     df = clean_skaters(df)
            ### elif table == "hood_hockey_app_goalies":
            ###     df = clean_goalies(df)
            ### elif table == "hood_hockey_app_games":
            ###     df = clean_games(df)
            ### elif table == "hood_hockey_app_lines":
            ###     df = clean_lines(df)
            ### elif table == "hood_hockey_app_drive":
            ###     df = clean_drive(df)
            ### else:
            ###     print("No cleaning function found for this table")

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

from itertools import combinations

# Optimal line combinations by PER
class OptimalLinesPERView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # --- Fetch Necessary Data ---
                # Fetch PER data (forwards) - Assuming tables exist
                # Use explicit column selection
                cursor.execute("""
                    SELECT "Player", "PER"
                    FROM hood_hockey_app_per_forwards
                """)
                columns_per_fwd = [col[0] for col in cursor.description]
                results_per_fwd = cursor.fetchall()
                per_fwd_df = pd.DataFrame(results_per_fwd, columns=columns_per_fwd)

                # Fetch PER data (defenders)
                cursor.execute("""
                    SELECT "Player", "PER"
                    FROM hood_hockey_app_per_defenders
                """)
                columns_per_def = [col[0] for col in cursor.description]
                results_per_def = cursor.fetchall()
                per_def_df = pd.DataFrame(results_per_def, columns=columns_per_def)

                # Fetch skaters data - Only Player and Position needed for filtering
                cursor.execute("""
                    SELECT "Player", "Position", "Shirt number"
                    FROM hood_hockey_app_skaters
                """)
                columns_skaters = [col[0] for col in cursor.description]
                results_skaters = cursor.fetchall()
                skaters_df = pd.DataFrame(results_skaters, columns=columns_skaters)


            # --- Data Processing and Merging ---
            # Ensure PER columns are numeric, coerce errors to NaN
            per_fwd_df['PER'] = pd.to_numeric(per_fwd_df['PER'], errors='coerce')
            per_def_df['PER'] = pd.to_numeric(per_def_df['PER'], errors='coerce')


            # Separate forwards and defenders from the main skaters list
            forwards_base = skaters_df[skaters_df['Position'] == 'F'].copy()
            defenders_base = skaters_df[skaters_df['Position'] == 'D'].copy()

            # Merge PER data onto the filtered skaters data
            # Use 'left' merge to keep all skaters even if PER data is missing
            forwards = pd.merge(forwards_base, per_fwd_df, on='Player', how='left')
            defenders = pd.merge(defenders_base, per_def_df, on='Player', how='left')

            # --- Handle NaN/Inf values before sending to frontend ---
            # JSON standard doesn't support NaN, Infinity, -Infinity directly.
            # We need to replace them with something JSON compliant, like None (which becomes null).
            # Or potentially a string like "N/A" if preferred for display.

            # Replace infinite values with NaN first
            forwards.replace([np.inf, -np.inf], np.nan, inplace=True)
            defenders.replace([np.inf, -np.inf], np.nan, inplace=True)

            # Convert DataFrames to list of dictionaries
            # Important: Use fillna(None) to replace NaN -> None *before* to_dict
            fwds_list = forwards.fillna(np.nan).replace([np.nan], [None]).to_dict(orient='records')
            defs_list = defenders.fillna(np.nan).replace([np.nan], [None]).to_dict(orient='records')

            # Alternative using custom JSON encoder (more complex, less common for this case)
            # class CustomEncoder(json.JSONEncoder):
            #     def default(self, obj):
            #         if isinstance(obj, np.integer): return int(obj)
            #         if isinstance(obj, np.floating): return float(obj) if np.isfinite(obj) else None # Convert NaN/Inf to None
            #         if isinstance(obj, np.ndarray): return obj.tolist()
            #         if pd.isna(obj): return None # Handle pandas NaT etc.
            #         return json.JSONEncoder.default(self, obj)
            # fwds_list = forwards.to_dict(orient='records')
            # defs_list = defenders.to_dict(orient='records')
            # response_data = {"forwards": fwds_list, "defenders": defs_list}
            # return Response(json.dumps(response_data, cls=CustomEncoder), content_type='application/json', status=status.HTTP_200_OK)


            # --- Return Response ---
            # DRF's Response handler *should* handle None correctly (converting to null)
            return Response(
                {
                    "forwards": fwds_list,
                    "defenders": defs_list
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(f"Error in OptimalLinesPERView: {e}")
            print(traceback.format_exc())
            # Ensure the error message itself doesn't contain non-JSON compliant values
            error_message = f"An error occurred: {str(e)}"
            return Response({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                

'''
# Synergy scores
class SynScoreView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # lines query 
                cursor.execute("""
                    SELECT * 
                    FROM hood_hockey_app_lines
                """)
                columns_lines = [col[0] for col in cursor.description]
                results_lines = cursor.fetchall() 
                # skaters query
                cursor.execute("""
                    SELECT * 
                    FROM hood_hockey_app_skaters
                """)
                columns_skaters = [col[0] for col in cursor.description]
                results_skaters = cursor.fetchall()
                # data frames
                lines = pd.DataFrame(results_lines, columns=columns_lines)
                skaters = pd.DataFrame(results_skaters, columns=columns_skaters)

                # Preprocessing
                lines['total_toi_minutes'] = (lines['Time on ice (mins)'] * 60 + lines['Time on ice (secs)']) / 60
                skaters[['First Name', 'Last Name']] = skaters['Player'].str.split(' ', expand=True)
                # last_name_combinations = list(combinations(last_names, 2))

                # ------ Calculate synergy scores (Forwards) --------
                forwards = skaters[skaters['Position'] == 'F'].copy()
                last_names = forwards['Last Name'].to_list()

                print("--------------------------------------------------")
                print("FWDS shape")
                print(forwards.shape)

                # Generate combinations
                last_name_combinations = list(combinations(last_names, 3)) 

                synergies_rate = {}

                print(f"Calculating synergy for {len(last_name_combinations)} pairs (Rate Based)...")

                for i, (player1, player2, player3) in enumerate(last_name_combinations):
                
                    # --- Data for all 3 ---
                    lines_with_both = lines[lines['Line'].str.contains(player1) & lines['Line'].str.contains(player2) & lines['Line'].str.contains(player3)]

                    goals_both_val = lines_with_both['Goals'].sum()
                    toi_both_val = lines_with_both['total_toi_minutes'].sum()
                    rate_both = (goals_both_val / toi_both_val) * 60 if toi_both_val > 0 else 0

                    # --- Data for Player 1 without Player 2 and Player 3 ---
                    lines_p1_only = lines[lines['Line'].str.contains(player1) & ~lines['Line'].str.contains(player2) & ~lines['Line'].str.contains(player3)]

                    goals_p1_val = lines_p1_only['Goals'].sum()
                    toi_p1_val = lines_p1_only['total_toi_minutes'].sum()
                    rate_p1_only = (goals_p1_val / toi_p1_val) * 60 if toi_p1_val > 0 else 0

                    # --- Data for Player 2 without Player 1 and Player 3 ---
                    lines_p2_only = lines[~lines['Line'].str.contains(player1) & lines['Line'].str.contains(player2) & ~lines['Line'].str.contains(player3)]
                    goals_p2_val = lines_p2_only['Goals'].sum()
                    toi_p2_val = lines_p2_only['total_toi_minutes'].sum()
                    rate_p2_only = (goals_p2_val / toi_p2_val) * 60 if toi_p2_val > 0 else 0

                    # --- Data for Player 3 without Player 1 and Player 2 ---
                    lines_p3_only = lines[~lines['Line'].str.contains(player1) & ~lines['Line'].str.contains(player2) & lines['Line'].str.contains(player3)]
                    goals_p3_val = lines_p3_only['Goals'].sum()
                    toi_p3_val = lines_p3_only['total_toi_minutes'].sum()
                    rate_p3_only = (goals_p3_val / toi_p3_val) * 60 if toi_p3_val > 0 else 0

                    # --- Average Individual Rate and Synergy Rate ---
                    rate_individual_avg = (rate_p1_only + rate_p2_only + rate_p3_only) / 3

                    # Synergy Score based on rates
                    synergy_score_rate = rate_both - rate_individual_avg
                    synergies_rate[(player1, player2, player3)] = synergy_score_rate
                
                synergy_rate_fwd = pd.DataFrame(synergies_rate.items(), columns=['Pair', 'Rate Synergy Score (G60)'])
                synergy_rate_fwd = synergy_rate_fwd.sort_values('Rate Synergy Score (G60)', ascending=False)

                # ------ Calculate synergy scores (Defenders) -------
                defenders = skaters[skaters['Position'] == 'D'].copy()
                last_names = defenders['Last Name'].to_list()

                # Generate combinations
                last_name_combinations = list(combinations(last_names, 2)) 

                synergies_rate = {}

                print(f"Calculating synergy for {len(last_name_combinations)} pairs (Rate Based)...")

                for i, (player1, player2) in enumerate(last_name_combinations):
                
                    # --- Data for Both ---
                    lines_with_both = lines[lines['Line'].str.contains(player1) & lines['Line'].str.contains(player2)]

                    goals_both_val = lines_with_both['Goals'].sum()
                    toi_both_val = lines_with_both['total_toi_minutes'].sum()
                    rate_both = (goals_both_val / toi_both_val) * 60 if toi_both_val > 0 else 0

                    # --- Data for Player 1 without Player 2 ---
                    lines_p1_only = lines[lines['Line'].str.contains(player1) & ~lines['Line'].str.contains(player2)]

                    goals_p1_val = lines_p1_only['Goals'].sum()
                    toi_p1_val = lines_p1_only['total_toi_minutes'].sum()
                    rate_p1_only = (goals_p1_val / toi_p1_val) * 60 if toi_p1_val > 0 else 0

                    # --- Data for Player 2 without Player 1 ---
                    lines_p2_only = lines[~lines['Line'].str.contains(player1) & lines['Line'].str.contains(player2)]
                    goals_p2_val = lines_p2_only['Goals'].sum()
                    toi_p2_val = lines_p2_only['total_toi_minutes'].sum()
                    rate_p2_only = (goals_p2_val / toi_p2_val) * 60 if toi_p2_val > 0 else 0

                    # --- Average Individual Rate and Synergy Rate---
                    rate_individual_avg = (rate_p1_only + rate_p2_only) / 2

                    # Synergy Score based on rates
                    synergy_score_rate = rate_both - rate_individual_avg
                    synergies_rate[(player1, player2)] = synergy_score_rate
                
                synergy_rate_def = pd.DataFrame(synergies_rate.items(), columns=['Pair', 'Rate Synergy Score (G60)'])
                synergy_rate_def = synergy_rate_def.sort_values('Rate Synergy Score (G60)', ascending=False)

                # prepare response
                fwds = synergy_rate_fwd.to_dict(orient='records')
                defs = synergy_rate_def.to_dict(orient='records')

                # Return a combined JSON response
                return Response(
                    {
                        "forwards": fwds,
                        "defenders": defs
                    }
                )
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      
'''
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
import plotly.graph_objects as go # Import Plotly graph objects
import plotly.io as pio # Import Plotly IO for JSON conversion
import pandas as pd
import numpy as np # Make sure numpy is imported
from django.db import connection
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import plotly.graph_objects as go
import plotly.io as pio
import traceback # Import traceback for better error logging
from urllib.parse import unquote # To decode URL-encoded strings
import plotly.express as px

# DRIVE data visualizations

# Skater CF%
class SkaterCFView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Skaters query - Fetch only required columns
                cursor.execute("""
                    SELECT "Player"
                    FROM hood_hockey_app_skaters
                """)
                columns_skaters = [col[0] for col in cursor.description]
                results_skaters = cursor.fetchall() # Fetch all rows

                # Lines query - Fetch required columns
                cursor.execute("""
                    SELECT "Line", "CORSI+", "CORSI-"
                    FROM hood_hockey_app_lines
                """)
                columns_lines = [col[0] for col in cursor.description]
                results_lines = cursor.fetchall() # Fetch all rows

            # --- Create DataFrames ---
            # Use fetched results directly
            skaters = pd.DataFrame(results_skaters, columns=columns_skaters)
            print("-------------------------------------------")
            print("Skaters DataFrame")
            print(skaters.head()) 

            lines = pd.DataFrame(results_lines, columns=columns_lines)
            print("-------------------------------------------")
            print("Lines DataFrame")
            print(lines.head()) 


            skaters[['First Name', 'Last Name']] = skaters['Player'].str.split(' ', expand=True)
            last_names = skaters['Last Name'].to_list()
            # Avoid division by zero: (CF + CA) might be 0 if TOI is very low or no events occurred
            lines['CF_Percent'] = np.where(
                (lines['CORSI+'] + lines['CORSI-']) > 0,
                (lines['CORSI+'] / (lines['CORSI+'] + lines['CORSI-'])) * 100,
                50.0 # Assign 50% for zero-event lines (common practice)
            )

            # --- Robust Player Matching ---
            # Create a list of players for each line for easier matching
            # Adjust the split character ('-') if your delimiter is different
            lines['PlayerList'] = lines['Line'].str.split('-')

            # --- Simple Average Calculation ---
            player_simple_avg_cf_percent = {} # Dictionary to store results

            for name in last_names:
                # Filter lines where the player *exactly* matches one in the list
                # Use the stored _list_type for isinstance check
                matching_lines = lines[lines['Line'].str.contains(name, na=False)]

                if not matching_lines.empty:
                    # Calculate the simple arithmetic mean of the 'CF_Percent' for the matching lines
                    # The .mean() method directly calculates the simple average
                    average_cf_percent = matching_lines['CF_Percent'].mean()
                    player_simple_avg_cf_percent[name] = average_cf_percent
                else:
                    # Handle cases where the player was not found on any line
                    player_simple_avg_cf_percent[name] = np.nan # Assign NaN (Not a Number)

            player_simple_avg_cf_percent_df = pd.DataFrame(list(player_simple_avg_cf_percent.items()), columns=['Player Name', 'Simple Avg CF%'])
            player_simple_avg_cf_percent_df = pd.DataFrame(list(player_simple_avg_cf_percent.items()), columns=['Player Name', 'Simple Avg CF%'])
            player_simple_avg_cf_percent_df['Player Name'] = skaters['First Name'] + ' ' + skaters['Last Name']
            # --- Create Plotly Bar Chart (if data exists) ---
            fig = None
            chart_json = None
            if not player_simple_avg_cf_percent_df.empty:
                fig = px.bar(
                    player_simple_avg_cf_percent_df,
                    x='Player Name',
                    y='Simple Avg CF%',
                    title='Average CORSI+ Percentage by Player',
                    labels={'Simple Avg CF%': 'Avg CF%'}, # Shorter label
                    # Consider removing text on bars if many players, becomes cluttered
                    # text='Simple Avg CF%'
                )

                # Update layout for better readability
                # fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside') # Add % sign if desired
                fig.update_layout(
                    xaxis_title='Player', # Shorter title
                    yaxis_title='Avgerage CORSI+%',
                    xaxis_tickangle=-45,
                    yaxis=dict(range=[0, 100]), # Set Y-axis range 0-100 for percentage
                    margin=dict(b=100), # Add bottom margin if needed for labels
                    xaxis={'categoryorder':'array', 'categoryarray': player_simple_avg_cf_percent_df['Player Name'].tolist()} # Keep sorted order
                )
                # Convert figure to JSON string
                chart_json = pio.to_json(fig)


            # --- Prepare Data for Response ---
            # Convert DataFrame to list of dictionaries for JSON compatibility
            player_data_list = player_simple_avg_cf_percent_df.to_dict(orient='records')

            # --- Return Combined JSON Response ---
            return Response(
                {
                    "player_data": player_data_list, # List of player stats
                    "chart_json": chart_json         # Plotly chart JSON string (or null)
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": f"An error occurred processing skater CF%: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Define Available Metrics ---
AVAILABLE_METRICS = {
    # Offensive candidates
    "Goals": "numeric",
    "Assists": "numeric",
    "Points": "numeric",
    "First assist": "numeric",
    "Second assist": "numeric",
    "Shots": "numeric", 
    "Shots on goal": "numeric",
    "Faceoffs won": "numeric", 
    # Defensive candidates
    "Hits": "numeric",
    "Blocked shots": "numeric",
    # Time - Always needed
    "Time on ice (Minutes)": "numeric",
    # Non-numeric / Identifiers - Always needed
    "Player": "string",
    "Position": "string",
    "Shirt number": "string", # Ensure this is selected
}

# --- Default Configuration ---
DEFAULT_OFFENSIVE_METRICS = ["Goals", "First assist", "Second assist"]
DEFAULT_OFFENSIVE_WEIGHTS = [2.0, 1.75, 1.5]
DEFAULT_DEFENSIVE_METRICS = ["Hits", "Blocked shots"]
DEFAULT_DEFENSIVE_WEIGHTS = [1.5, 2.0]

class PERView(views.APIView):
    permission_classes = [AllowAny]

    def _parse_param(self, param_string, param_type=str):
        """Helper to parse comma-separated query parameters."""
        if not param_string:
            return []
        try:
            # Decode URL encoding (e.g., '%20' for space) before splitting
            decoded_string = unquote(param_string)
            items = decoded_string.split(',')
            if param_type == float:
                return [float(item) for item in items]
            elif param_type == int:
                 return [int(item) for item in items]
            else:
                return [str(item).strip() for item in items] # Trim whitespace
        except Exception as e:
            print(f"Error parsing parameter string '{param_string}': {e}")
            return [] # Return empty list on error

    def _build_formula_string(self, metrics, weights, category_name):
        """Helper to create a human-readable formula string."""
        if not metrics or not weights or len(metrics) != len(weights):
            return f"{category_name} Value = Not configured correctly"
        terms = []
        for metric, weight in zip(metrics, weights):
             terms.append(f"({weight:.2f} * [{metric}])") # Use [] to denote column name
        return f"{category_name} Value = " + " + ".join(terms)

    def get(self, request):
        try:
            # --- Get Metrics & Weights from Query Params (with defaults) ---
            offensive_metrics = self._parse_param(request.query_params.get('offensive_metrics'), str) or DEFAULT_OFFENSIVE_METRICS
            offensive_weights = self._parse_param(request.query_params.get('offensive_weights'), float) or DEFAULT_OFFENSIVE_WEIGHTS
            defensive_metrics = self._parse_param(request.query_params.get('defensive_metrics'), str) or DEFAULT_DEFENSIVE_METRICS
            defensive_weights = self._parse_param(request.query_params.get('defensive_weights'), float) or DEFAULT_DEFENSIVE_WEIGHTS

            # Basic validation
            if len(offensive_metrics) != len(offensive_weights):
                raise ValueError("Mismatch between offensive metrics and weights count.")
            if len(defensive_metrics) != len(defensive_weights):
                 raise ValueError("Mismatch between defensive metrics and weights count.")

            # --- Determine ALL columns needed for calculation and identification ---
            required_numeric_metrics = list(set(
                offensive_metrics + defensive_metrics + ["Time on ice (Minutes)"]
            ))
            # Ensure all requested metrics are valid and available
            for metric in required_numeric_metrics:
                if metric not in AVAILABLE_METRICS or AVAILABLE_METRICS[metric] != 'numeric':
                    raise ValueError(f"Invalid or non-numeric metric requested: {metric}")

            # Columns needed for identification/display
            required_id_cols = ["Player", "Position", "Shirt number"] # Add any others needed for tables/charts

            all_required_cols = list(set(required_numeric_metrics + required_id_cols))
            # Format for SQL query (ensure correct quoting if needed)
            sql_select_cols = ", ".join([f'"{col}"' for col in all_required_cols])


            # --- Fetch Data ---
            with connection.cursor() as cursor:
                query = f"SELECT {sql_select_cols} FROM hood_hockey_app_skaters"
                print(f"Executing Query: {query}") # For debugging
                cursor.execute(query)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                skaters = pd.DataFrame(results, columns=columns)

            # --- Data Cleaning & Preparation ---
            # Convert numeric cols, coerce errors, drop NAs in *required* numeric cols
            for col in required_numeric_metrics:
                 skaters[col] = pd.to_numeric(skaters[col], errors='coerce')

            skaters = skaters.dropna(subset=required_numeric_metrics)
             # Ensure time on ice > 0 AFTER converting to numeric and dropping NA
            if "Time on ice (Minutes)" in skaters.columns:
                skaters = skaters[skaters["Time on ice (Minutes)"] > 0]
            else:
                # Should not happen if validation is correct, but handle defensively
                print("Warning: 'Time on ice (Minutes)' column missing after data load.")
                skaters = pd.DataFrame(columns=skaters.columns) # Make empty if time is missing


            # Separate into forwards and defenders
            forwards = skaters[skaters['Position'] == 'F'].copy()
            defenders = skaters[skaters['Position'] == 'D'].copy()

            # --- DYNAMIC PER Calculation ---
            def calculate_dynamic_per(df, off_metrics, off_weights, def_metrics, def_weights):
                if df.empty:
                    df['OffensiveValue'] = 0.0
                    df['DefensiveValue'] = 0.0
                    df['PER'] = pd.Series(dtype='float64')
                    return df

                # Calculate weighted sum for offense
                offensive_value = pd.Series(0.0, index=df.index)
                if off_metrics: # Check if list is not empty
                    for metric, weight in zip(off_metrics, off_weights):
                        if metric in df.columns:
                            offensive_value += df[metric] * weight
                        else:
                            print(f"Warning: Offensive metric '{metric}' not found in DataFrame columns for calculation.")


                # Calculate weighted sum for defense
                defensive_value = pd.Series(0.0, index=df.index)
                if def_metrics: # Check if list is not empty
                    for metric, weight in zip(def_metrics, def_weights):
                         if metric in df.columns:
                            defensive_value += df[metric] * weight
                         else:
                             print(f"Warning: Defensive metric '{metric}' not found in DataFrame columns for calculation.")


                df['OffensiveValue'] = offensive_value # Store for potential display
                df['DefensiveValue'] = defensive_value # Store for potential display

                # Calculate PER with division handling (same logic as before)
                time_col = "Time on ice (Minutes)" # Assuming this is always required
                df['PER'] = np.where(
                    (defensive_value > 0) & (df[time_col] > 0), # Check both defense and time > 0
                    (offensive_value / defensive_value) / df[time_col],
                    np.where(
                        offensive_value > 0,
                        np.inf,
                        0.0
                    )
                )
                df.replace([np.inf, -np.inf], np.nan, inplace=True)
                df.dropna(subset=['PER'], inplace=True)
                return df.sort_values(by='PER', ascending=False)

            forwards = calculate_dynamic_per(forwards, offensive_metrics, offensive_weights, defensive_metrics, defensive_weights)
            defenders = calculate_dynamic_per(defenders, offensive_metrics, offensive_weights, defensive_metrics, defensive_weights)

            # Push to database to access outside of this class
            # Connect to PostgreSQL
            db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            engine = create_engine(db_url)
            forwards_df = pd.DataFrame(forwards, columns=all_required_cols + ['OffensiveValue', 'DefensiveValue', 'PER'])
            defenders_df = pd.DataFrame(defenders, columns=all_required_cols + ['OffensiveValue', 'DefensiveValue', 'PER'])
            forwards_df.to_sql("hood_hockey_app_per_forwards", engine, if_exists='replace', index=False)
            defenders_df.to_sql("hood_hockey_app_per_defenders", engine, if_exists='replace', index=False)

            # --- Build Formula Strings ---
            fwd_formula_off = self._build_formula_string(offensive_metrics, offensive_weights, "Offensive")
            fwd_formula_def = self._build_formula_string(defensive_metrics, defensive_weights, "Defensive")
            fwd_formula_per = "PER = (Offensive Value + Defensive Value) / [Time on ice (Minutes)]"
            # Same formulas apply to defenders based on the input config
            def_formula_off = fwd_formula_off
            def_formula_def = fwd_formula_def
            def_formula_per = fwd_formula_per

            # --- Prepare Chart Data (Plotly JSON) ---
            # (Chart generation logic remains the same, using the calculated 'PER' column)
            fwd_chart_json = None
            if not forwards.empty:
                fig_fwd = go.Figure(data=[go.Bar(x=forwards['Player'], y=forwards['PER'], name='Forward PER', hovertemplate='<b>%{x}</b><br>PER: %{y:.3f}<extra></extra>')])
                fig_fwd.update_layout(title="Forward Player Efficiency Rating (PER)", xaxis_title="Player", yaxis_title="PER", xaxis={'categoryorder':'array', 'categoryarray': forwards['Player'].tolist(), 'tickangle': -45}, margin=dict(b=100))
                fwd_chart_json = pio.to_json(fig_fwd)

            def_chart_json = None
            if not defenders.empty:
                fig_def = go.Figure(data=[go.Bar(x=defenders['Player'], y=defenders['PER'], name='Defender PER', marker_color='orange', hovertemplate='<b>%{x}</b><br>PER: %{y:.3f}<extra></extra>')])
                fig_def.update_layout(title="Defender Player Efficiency Rating (PER)", xaxis_title="Player", yaxis_title="PER", xaxis={'categoryorder':'array', 'categoryarray': defenders['Player'].tolist(), 'tickangle': -45}, margin=dict(b=100))
                def_chart_json = pio.to_json(fig_def)

            # --- Prepare response ---
            top_forwards_list = forwards.to_dict(orient='records') if not forwards.empty else []
            top_defenders_list = defenders.to_dict(orient='records') if not defenders.empty else []

            return Response(
                {
                    "top_forwards": top_forwards_list,
                    "top_defenders": top_defenders_list,
                    "forward_chart_json": fwd_chart_json,
                    "defender_chart_json": def_chart_json,
                    # --- Add Formula Strings ---
                    "formula": {
                         "offensive": fwd_formula_off, # Same formula used for both based on input
                         "defensive": fwd_formula_def, # Same formula used for both based on input
                         "per": fwd_formula_per
                    }
                },
                status=status.HTTP_200_OK
            )
        except ValueError as ve: # Catch specific validation errors
             print(f"Validation Error in PERView: {ve}")
             print(traceback.format_exc())
             return Response({"error": f"Configuration error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST) # Bad Request
        except Exception as e:
            print(f"Error in PERView: {e}")
            print(traceback.format_exc())
            return Response({"error": f"An error occurred processing PER data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# GAR - Modified to send raw data for frontend splitting
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
            
# Fitness correlation graphs
class FitnessCorrelationView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                # Get skaters data - SELECT NEEDED COLUMNS
                cursor.execute("""
                    SELECT "Player", "Shirt number", "Position", "Goals"
                    FROM hood_hockey_app_skaters
                """)
                skater_results = cursor.fetchall()
                skater_columns = [col[0] for col in cursor.description]
                skaters_df = pd.DataFrame(skater_results, columns=skater_columns)

                # Get DRIVE data - Aggregate Max Speed
                cursor.execute("""
                    SELECT "playerId", MAX("speed") AS max_speed
                    FROM hood_hockey_app_drive
                    GROUP BY "playerId"
                """)
                drive_results = cursor.fetchall()
                drive_columns = [col[0] for col in cursor.description]
                drive_df = pd.DataFrame(drive_results, columns=drive_columns)

            if skaters_df.empty or drive_df.empty:
                 return Response({"error": "Missing skater or drive data."}, status=status.HTTP_404_NOT_FOUND)

            # --- Data Cleaning and Processing ---
            # DRIVE processing: Convert playerId to integer (matching Shirt number type)
            # Ensure 'playerId' column exists and handle potential errors
            if 'playerId' in drive_df.columns:
                # Attempt to remove 'h' and convert, coercing errors to NaN
                drive_df['player_id_num'] = pd.to_numeric(drive_df['playerId'].astype(str).str.lstrip('h'), errors='coerce')
                drive_df.dropna(subset=['player_id_num'], inplace=True) # Drop rows where conversion failed
                drive_df['player_id'] = drive_df['player_id_num'].astype(int)
                drive_df = drive_df.rename(columns={'max_speed': 'Max Speed'}) # Match case for axis label later
            else:
                 return Response({"error": "'playerId' column not found in drive data."}, status=status.HTTP_400_BAD_REQUEST)


            # Skaters processing: Convert Shirt number to int, Goals to numeric
            if 'Shirt number' in skaters_df.columns and 'Goals' in skaters_df.columns:
                 skaters_df['player_id'] = pd.to_numeric(skaters_df['Shirt number'], errors='coerce')
                 skaters_df['Goals'] = pd.to_numeric(skaters_df['Goals'], errors='coerce')
                 skaters_df.dropna(subset=['player_id', 'Goals'], inplace=True) # Drop rows where conversion failed
                 skaters_df['player_id'] = skaters_df['player_id'].astype(int)
            else:
                 return Response({"error": "'Shirt number' or 'Goals' column not found in skater data."}, status=status.HTTP_400_BAD_REQUEST)


            # --- Data Merging ---
            # Select only necessary columns before merge
            drive_subset = drive_df[['player_id', 'Max Speed']]
            skater_subset = skaters_df[['player_id', 'Player', 'Position', 'Goals']] # Added 'Player'
            # Use inner merge to keep only players present in both datasets with valid IDs
            merged_df = pd.merge(drive_subset, skater_subset, on='player_id', how='inner')

            if merged_df.empty:
                print("Merged DataFrame is empty after inner join.")
                return Response({"message": "No players found matching between skater and drive data."}, status=status.HTTP_204_NO_CONTENT)

            # Ensure data types after merge
            merged_df['Max Speed'] = pd.to_numeric(merged_df['Max Speed'], errors='coerce')
            merged_df['Goals'] = pd.to_numeric(merged_df['Goals'], errors='coerce')
            merged_df.dropna(subset=['Max Speed', 'Goals'], inplace=True)


            # Separate forwards and defenders *after* successful merge
            forwards_df = merged_df[merged_df['Position'] == 'F'].copy()
            defenders_df = merged_df[merged_df['Position'] == 'D'].copy()

            # --- Create Plotly Scatterplots ---
            fwd_chart_json = None
            if not forwards_df.empty:
                fig_fwd = px.scatter(
                    forwards_df,
                    x='Max Speed',
                    y='Goals',
                    title='Forwards: Max Speed vs Goals',
                    labels={'Max Speed': 'Max Speed (Units)', 'Goals': 'Goals Scored'},
                    hover_data=['Player'] # Show player name on hover
                )
                fig_fwd.update_traces(marker=dict(size=8, opacity=0.7))
                fwd_chart_json = pio.to_json(fig_fwd)

            def_chart_json = None
            if not defenders_df.empty:
                fig_def = px.scatter(
                    defenders_df,
                    x='Max Speed',
                    y='Goals',
                    title='Defenders: Max Speed vs Goals',
                    labels={'Max Speed': 'Max Speed (Units)', 'Goals': 'Goals Scored'},
                    hover_data=['Player'] # Show player name on hover
                )
                fig_def.update_traces(marker=dict(size=8, opacity=0.7, color='orange')) # Different color
                def_chart_json = pio.to_json(fig_def)

            # --- Return JSON Response ---
            return Response({
                    'forward_scatter_json': fwd_chart_json,
                    'defender_scatter_json': def_chart_json
                }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in FitnessCorrelationView: {e}")
            print(traceback.format_exc())
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# --------------------
# Games
# --------------------

# views.py

import pandas as pd
import numpy as np
from django.db import connection
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# --- Scikit-learn Imports ---
# Make sure scikit-learn is installed: pip install scikit-learn
try:
    from sklearn.model_selection import KFold, cross_val_score
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, confusion_matrix
    from sklearn.preprocessing import StandardScaler # Good practice for Logistic Regression
    from sklearn.pipeline import Pipeline # Useful for combining steps
    from sklearn.exceptions import ConvergenceWarning
    import warnings
    warnings.filterwarnings("ignore", category=ConvergenceWarning) # Suppress convergence warnings if desired
    SKLEARN_INSTALLED = True
except ImportError:
    # Handle case where sklearn might not be installed
    SKLEARN_INSTALLED = False
    print("CRITICAL WARNING: scikit-learn is not installed. Logistic Regression functionality will be unavailable.")
    # Define dummy classes/functions if needed elsewhere, or just rely on the check below

# --- Plotly Imports ---
import plotly.express as px
import plotly.io as pio # Import Plotly IO for JSON conversion
import traceback # For error logging


# views.py

import pandas as pd
import numpy as np
from django.db import connection
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# --- Scikit-learn Imports ---
try:
    from sklearn.model_selection import KFold, cross_val_score
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, confusion_matrix
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.exceptions import ConvergenceWarning
    import warnings
    warnings.filterwarnings("ignore", category=ConvergenceWarning)
    SKLEARN_INSTALLED = True
except ImportError:
    SKLEARN_INSTALLED = False
    print("CRITICAL WARNING: scikit-learn is not installed.")

# --- Plotly Imports ---
import plotly.express as px
import plotly.graph_objects as go # Import graph_objects for combined plots
import plotly.io as pio
import traceback


class LogRegView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not SKLEARN_INSTALLED:
             return Response({"error": "Server configuration error: scikit-learn missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM hood_hockey_app_games")
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]

            if not results: return Response({"error": "No game data found."}, status=status.HTTP_404_NOT_FOUND)

            # --- Data Processing ---
            data = pd.DataFrame(results, columns=columns)
            data = data[(data['Type'] == 'Total') & (data['isOpponent'] == False)].copy()
            if data.empty: return Response({"error": "No 'Total' primary team data."}, status=status.HTTP_404_NOT_FOUND)

            data['Outcome'] = data['Outcome'].replace({'Win': 1, 'Loss': 0})
            data['Outcome'] = pd.to_numeric(data['Outcome'], errors='coerce')
            data.dropna(subset=['Outcome'], inplace=True)
            data['Outcome'] = data['Outcome'].astype(int)

            cols_to_drop = ['GameID', 'Type', 'Team', 'Date', 'isOpponent', 'OpponentTeam', 'OpponentScore', 'Outcome']
            data_cleaned = data.drop(columns=[col for col in cols_to_drop if col in data.columns], errors='ignore')
            X = data_cleaned.select_dtypes(include=np.number)
            y = data['Outcome']

            if X.empty or y.empty or X.shape[0] != y.shape[0]:
                return Response({"error": "Not enough valid data after cleaning."}, status=status.HTTP_400_BAD_REQUEST)

            if X.isnull().values.any():
                 print("Warning: Filling NaN values in features with column means.")
                 X = X.fillna(X.mean())

            # --- Model Training and Evaluation ---
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('logreg', LogisticRegression(max_iter=1000, random_state=42, solver='liblinear'))
            ])
            # ... (cross-validation logic - keep as before) ...
            n_splits = 5
            if min(y.value_counts()) < n_splits: n_splits = max(2, min(y.value_counts()))
            kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
            mean_cv_accuracy = None
            try:
                 scores = cross_val_score(pipeline, X, y, cv=kf, scoring='accuracy')
                 mean_cv_accuracy = scores.mean()
                 print(f"Mean CV accuracy: {mean_cv_accuracy}")
            except ValueError as cv_error: print(f"Cross-validation failed: {cv_error}")

            pipeline.fit(X, y)
            model = pipeline.named_steps['logreg']
            scaler = pipeline.named_steps['scaler'] # Get the fitted scaler

            # --- Feature Importance ---
            coef_chart_json = None
            violin_chart_json = None
            probability_curve_json = None # Initialize new chart JSON
            primary_predictor_name = None # Store the name of the plotted predictor

            if hasattr(model, 'coef_'):
                coef_series = pd.Series(model.coef_[0], index=X.columns)
                top_feats = coef_series.abs().sort_values(ascending=False).head(10)

                # --- Coefficient Bar Chart (Existing - unchanged generation logic) ---
                if not top_feats.empty:
                    signed_coefs = coef_series[top_feats.index]
                    coef_df = signed_coefs.reset_index(); coef_df.columns = ['Feature', 'Coefficient (on Scaled Data)']
                    fig_coefs = px.bar(coef_df.sort_values(by='Coefficient (on Scaled Data)', ascending=True), x='Coefficient (on Scaled Data)', y='Feature', orientation='h', title='Top 10 Feature Importances', labels={'Coefficient (on Scaled Data)':'Coefficient (Impact on Log-Odds)'})
                    fig_coefs.update_layout(yaxis={'categoryorder':'total ascending'})
                    coef_chart_json = pio.to_json(fig_coefs)

                # --- Violin Plot (Existing - unchanged generation logic) ---
                if not top_feats.empty:
                    violin_data_cols = top_feats.index.tolist() + ['Outcome']; valid_violin_cols = [col for col in violin_data_cols if col in data.columns]
                    if len(valid_violin_cols) > 1:
                        melt_df = data[valid_violin_cols].melt(id_vars='Outcome', var_name='Feature', value_name='Value')
                        melt_df['Outcome'] = melt_df['Outcome'].map({1: 'Win', 0: 'Loss'})
                        fig_violin = px.violin(melt_df, x='Feature', y='Value', color='Outcome', box=True, points=False, title='Distribution of Top Features by Game Outcome', category_orders={"Feature": top_feats.index.tolist()})
                        fig_violin.update_xaxes(tickangle=45)
                        violin_chart_json = pio.to_json(fig_violin)

                # --- ADDED: Probability Curve Plot ---
                if not top_feats.empty:
                    primary_predictor_name = top_feats.index[0] # Use the most important feature
                    print(f"Generating probability curve for: {primary_predictor_name}")

                    # 1. Generate a range of values for the primary predictor (using original data range)
                    x_range_orig = np.linspace(data[primary_predictor_name].min(),
                                               data[primary_predictor_name].max(),
                                               100) # 100 points for a smooth curve

                    # 2. Scale this range *using the same fitted scaler*
                    # Create a temporary DataFrame matching the structure of X
                    temp_df = pd.DataFrame(0, index=range(len(x_range_orig)), columns=X.columns)
                    temp_df[primary_predictor_name] = x_range_orig
                    # Scale the temporary DataFrame
                    x_range_scaled = scaler.transform(temp_df)

                    # 3. Predict probabilities using the fitted model on the scaled range
                    # predict_proba gives [[P(class 0), P(class 1)], ...]
                    probabilities = model.predict_proba(x_range_scaled)[:, 1] # Get probability of class 1 (Win)

                    # 4. Create the Plotly figure using graph_objects
                    fig_prob = go.Figure()

                    # Add scatter plot for actual data points (Win/Loss) vs original feature value
                    # Add slight jitter to y-axis to avoid overlap
                    jitter_amount = 0.02
                    fig_prob.add_trace(go.Scatter(
                        x=data[primary_predictor_name],
                        y=data['Outcome'] + np.random.uniform(-jitter_amount, jitter_amount, size=len(data)), # Add jitter
                        mode='markers',
                        name='Actual Outcome (0=Loss, 1=Win)',
                        marker=dict(
                            color=data['Outcome'], # Color by outcome
                            colorscale=[[0, 'red'], [1, 'blue']], # Specify colors
                            opacity=0.6,
                            size=5
                        )
                    ))

                    # Add the predicted probability curve (using original x range for plotting)
                    fig_prob.add_trace(go.Scatter(
                        x=x_range_orig, # Plot against original values
                        y=probabilities,
                        mode='lines',
                        name='Predicted Win Probability',
                        line=dict(color='green', width=2)
                    ))

                    # Update layout
                    fig_prob.update_layout(
                        title=f'Predicted Win Probability vs {primary_predictor_name}',
                        xaxis_title=primary_predictor_name,
                        yaxis_title='Probability of Winning',
                        yaxis_range=[-0.1, 1.1], # Set Y-axis range slightly outside 0-1
                        legend_title_text='Legend'
                    )

                    # 5. Convert to JSON
                    probability_curve_json = pio.to_json(fig_prob)

            else: # Handle case where model had no coefficients
                 print("Warning: Model coefficients not available, cannot generate plots.")

            # --- Prepare and Return JSON Response ---
            response_data = {
                "message": "Logistic regression analysis complete.",
                "mean_cv_accuracy": mean_cv_accuracy if mean_cv_accuracy is not None else "N/A",
                "coefficients_chart_json": coef_chart_json,
                "violin_chart_json": violin_chart_json,
                "probability_curve_json": probability_curve_json, # ADDED
                "probability_curve_feature": primary_predictor_name # ADDED name of feature used
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in LogRegView: {e}")
            print(traceback.format_exc())
            return Response({"error": f"An error occurred during logistic regression analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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

class FaceoffWinPercentView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                # Select only necessary columns
                cursor.execute("""
                    SELECT *
                    FROM hood_hockey_app_games
                """)
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description]

            if not results:
                 return Response({"error": "No game data found."}, status=status.HTTP_404_NOT_FOUND)

            # --- Data Processing ---
            games = pd.DataFrame(results, columns=columns)

            # Convert Date to datetime objects (crucial for plotting time series)
            # Try multiple formats if necessary, or specify the exact format if known
            try:
                 games['Date'] = pd.to_datetime(games['Date']) # Common format
            except ValueError:
                 try:
                      games['Date'] = pd.to_datetime(games['Date'], format='%m/%d/%Y') # Example format
                 except Exception as date_err:
                      print(f"Warning: Could not parse Date column automatically: {date_err}. Ensure format is consistent.")
                      # Optionally drop rows with unparseable dates or return error
                      games.dropna(subset=['Date'], inplace=True)


            # Filter for primary team totals
            games = games[(games['Type'] == 'Total') & (games['isOpponent'] == False)].copy()

            if games.empty:
                return Response({"error": "No 'Total' game data found for the primary team."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure Faceoff % column is numeric, handle errors (e.g., '%' signs)
            # If it already includes '%', remove it before converting
            if games['Faceoffs won, %'].dtype == 'object': # Check if it's a string type
                 games['Faceoffs won, %'] = games['Faceoffs won, %'].astype(str).str.replace('%', '', regex=False)
            games['Faceoffs won, %'] = pd.to_numeric(games['Faceoffs won, %'], errors='coerce')
            games.dropna(subset=['Faceoffs won, %'], inplace=True) # Drop rows where conversion failed

            if games.empty:
                return Response({"error": "No valid faceoff percentage data found after cleaning."}, status=status.HTTP_404_NOT_FOUND)


            # Sort by Date for the line plot
            games = games.sort_values(by='Date')

            # ---------------------
            # Plotly graphs
            # ---------------------

            games['Puck battles won, %'] = games['Puck battles won, %'] * 100
            # --- Puck battles graph ---
            fig_puck_battles = px.line(
                games,
                x='Date',
                y='Puck battles won, %',
                title='Puck Battle Win Percentage Over Time',
                markers=True, # Add markers to data points
                labels={'Puck battles won, %': 'Puck battles won, %'} # Cleaner axis label
            )

            # --- Net xG graph ---
            fig_xg = px.line(
                games,
                x='Date',
                y="Net xG (xG - Opponent's xG)",
                title='Net xG Over Time',
                markers=True, # Add markers to data points
                labels={'Net xG': 'Net xG'} # Cleaner axis label
            )

            games['CORSI%'] = games['CORSI%'] * 100
            # --- CORSI% graph ---
            fig_corsi = px.line(
                games,
                x='Date',
                y='CORSI%',
                title='CORSI Percentage Over Time',
                markers=True, # Add markers to data points
                labels={'CORSI, %': 'CORSI %'} # Cleaner axis label
            )

            games['Faceoffs won, %'] = games['Faceoffs won, %'] * 100
            # --- faceoff win % graph ---
            fig_faceoff = px.line(
                games,
                x='Date',
                y='Faceoffs won, %',
                title='Faceoff Win Percentage Over Time',
                markers=True, # Add markers to data points
                labels={'Faceoffs won, %': 'Faceoff Win %'} # Cleaner axis label
            )

            # Customize layouts
            fig_faceoff.update_layout(
                xaxis_title='Date',
                yaxis_title='Faceoff Win Percentage (%)',
                yaxis_range=[0, 100] 
            )
            fig_faceoff.update_xaxes(tickangle=45)

            fig_corsi.update_layout(
                xaxis_title='Date',
                yaxis_title='CORSI Percentage (%)',
                yaxis_range=[0, 100] 
            )
            fig_corsi.update_xaxes(tickangle=45)

            fig_xg.update_layout(
                xaxis_title='Date',
                yaxis_title='Net xG',
                yaxis_range=[-10, 5] 
            )
            fig_corsi.update_xaxes(tickangle=45)

            fig_puck_battles.update_layout(
                xaxis_title='Date',
                yaxis_title='Puck Battle Win Percentage (%)',
                yaxis_range=[0, 100] 
            )
            fig_corsi.update_xaxes(tickangle=45)


            # --- Convert to JSON ---
            faceoff_chart_json = pio.to_json(fig_faceoff)
            corsi_chart_json = pio.to_json(fig_corsi)
            xg_chart_json = pio.to_json(fig_xg)
            puck_battles_chart_json = pio.to_json(fig_puck_battles)

            # Return JSON response
            return Response({'faceoff_chart_json': faceoff_chart_json,
                             'corsi_chart_json': corsi_chart_json,
                             'xg_chart_json': xg_chart_json,
                             'puck_battles_chart_json': puck_battles_chart_json}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in FaceoffWinPercentView: {e}")
            print(traceback.format_exc())
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