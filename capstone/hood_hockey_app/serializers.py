from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Games


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class GamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Games
        fields = [
            "Date", "Opponent", "Score_HC", "Score_Opp", "Goals", "Penalties", "Penalties_Drawn",
            "Penalty_Time_Min", "Penalty_Time_Sec", "Faceoffs", "Faceoffs_Won", "Faceoff_Win_Percentage",
            "Hits", "Faceoffs_DZ", "Faceoffs_Won_DZ", "Faceoffs_Won_DZ_Percentage", "Faceoffs_NZ",
            "Faceoffs_Won_NZ", "Faceoffs_Won_NZ_Percentage", "Faceoffs_OZ", "Faceoffs_Won_OZ",
            "Faceoffs_Won_OZ_Percentage", "Blocked_Shots", "Faceoffs_Lost", "Scoring_Chances",
            "CORSI_Percentage", "Hits_Against", "Power_Play", "Successful_Power_Play", "Power_Play_Min",
            "Power_Play_Sec", "Power_Play_Percentage", "Short_Handed", "Penalty_Killing",
            "Short_Handed_Min", "Short_Handed_Sec", "Short_Handed_Percentage", "xG_Per_Shot",
            "Opponents_xG_Per_Shot", "Net_xG", "xG_Converssion", "xG", "Opponent_xG", "xG_Per_Goal",
            "Shots", "Shots_On_Goal", "Shots_Blocking", "Missed_Shots", "Percentage_Shots_On_Goal",
            "Slapshot", "Wrist_Shot", "Power_Play_Shots", "Short_Handed_Shots", "Shootouts_Scored",
            "Offensive_Play_Min", "Offensive_Play_Sec", "Defensive_Play_Min", "Defensive_Play_Sec",
            "OZ_Possession_Min", "OZ_Possession_Sec", "NZ_Possession_Min", "NZ_Possession_Sec",
            "DZ_Possession_Min", "DZ_Possession_Sec", "Puck_Battles", "Puck_Battles_Won",
            "Puck_Battles_Won_Percentage", "Puck_Battles_OZ", "Puck_Battles_NZ", "Puck_Battles_DZ",
            "Dekes", "Dekes_Successful", "Dekes_Unsuccessful", "Dekes_Successful_Percentage",
            "Passes_Total", "Accurate_Passes", "Accurate_Passes_Percentage", "Pre_Shot_Passes",
            "Dump_Ins", "Dump_Outs", "Passes_To_The_Slot", "OZ_Play", "OZ_Play_With_Shots",
            "OZ_Play_With_Shots_Percentage", "Counter_Attacks", "Counter_Attack_With_Shots",
            "Counter_Attack_With_Shots_Percentage", "Takeaways", "Takeaways_In_NZ", "Takeaways_In_DZ",
            "Puck_Losses", "Puck_Losses_OZ", "Puck_Losses_NZ", "Puck_Losses_DZ", "Retrievals",
            "Power_Play_Retrievals", "Penalty_Kill_Retrievals", "EV_OZ_Retrievals", "EV_DZ_Retrievals",
            "Takeaways_In_OZ", "Loose_Puck_Recovery", "Opponent_Dump_In_Retrievals", "Entries",
            "Entries_Via_Pass", "Entries_Via_Dump_In", "Entries_Via_Stickhandling", "Breakouts",
            "Breakouts_Via_Pass", "Breakouts_Via_Dump_Out", "Breakouts_Via_Stickhandling", "author" # foreign key
        ] 
        extra_kwargs = {"author": {"read_only": True}}