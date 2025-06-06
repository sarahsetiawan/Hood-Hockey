from django.db import models
from django.contrib.auth.models import User

# Test Models
class test(models.Model):
    test1 = models.CharField(max_length=80)
    test2 = models.IntegerField()

class test2(models.Model):
    test1 = models.CharField(max_length=80)
    test2 = models.IntegerField()

# ------------------------------
# postgres models
# ------------------------------

# Combined games data
class Games(models.Model):
    Date = models.DateField(null=False, blank=False)
    Opponent = models.CharField(max_length=255)
    # break score column into 2 seperate score columns
    Score_HC = models.IntegerField()
    Score_Opp = models.IntegerField()
    Goals = models.IntegerField()
    Penalties = models.IntegerField()
    Penalties_Drawn = models.IntegerField()
    # Seperate penalty time into minutes and seconds
    Penalty_Time_Min = models.IntegerField()
    Penalty_Time_Sec = models.IntegerField()
    Faceoffs = models.IntegerField()
    Faceoffs_Won = models.IntegerField()
    Faceoff_Win_Percentage = models.IntegerField()
    Hits = models.IntegerField()
    # DZ
    Faceoffs_DZ = models.IntegerField()
    Faceoffs_Won_DZ = models.IntegerField()
    Faceoffs_Won_DZ_Percentage = models.IntegerField()
    #NZ
    Faceoffs_NZ = models.IntegerField()
    Faceoffs_Won_NZ = models.IntegerField()
    Faceoffs_Won_NZ_Percentage = models.IntegerField()
    #OZ
    Faceoffs_OZ = models.IntegerField()
    Faceoffs_Won_OZ = models.IntegerField()
    Faceoffs_Won_OZ_Percentage = models.IntegerField()
    Blocked_Shots = models.IntegerField()
    Faceoffs_Lost = models.IntegerField()
    Scoring_Chances = models.IntegerField()
    CORSI_Percentage = models.IntegerField()
    Hits_Against = models.IntegerField()
    Power_Play = models.IntegerField()
    Successful_Power_Play = models.IntegerField()
    # Seperate power play time into minutes and seconds
    Power_Play_Min = models.IntegerField()
    Power_Play_Sec = models.IntegerField()
    Power_Play_Percentage = models.FloatField()
    Short_Handed = models.IntegerField()
    Penalty_Killing = models.IntegerField()
    # seperate short-handed time into minutes and seconds
    Short_Handed_Min = models.IntegerField()
    Short_Handed_Sec = models.IntegerField()
    Short_Handed_Percentage = models.FloatField()
    xG_Per_Shot = models.FloatField()
    Opponents_xG_Per_Shot = models.FloatField()
    Net_xG = models.FloatField()
    xG_Converssion = models.FloatField()
    xG = models.FloatField()
    Opponent_xG = models.FloatField()
    xG_Per_Goal = models.FloatField()
    Shots = models.IntegerField()
    Shots_On_Goal = models.IntegerField()
    Shots_Blocking = models.IntegerField()
    Missed_Shots = models.IntegerField()
    Percentage_Shots_On_Goal = models.FloatField()
    Slapshot = models.IntegerField()
    Wrist_Shot = models.IntegerField()
    Power_Play_Shots = models.IntegerField()
    Short_Handed_Shots = models.IntegerField()
    Shootouts_Scored = models.IntegerField()
    # seperate offensive/defensive play into minutes and seconds
    Offensive_Play_Min = models.IntegerField()
    Offensive_Play_Sec = models.IntegerField()
    Defensive_Play_Min = models.IntegerField()
    Defensive_Play_Sec = models.IntegerField()
    # OZ
    OZ_Possession_Min = models.IntegerField()
    OZ_Possession_Sec = models.IntegerField()
    # NZ
    NZ_Possession_Min = models.IntegerField()
    NZ_Possession_Sec = models.IntegerField()
    # DZ
    DZ_Possession_Min = models.IntegerField()
    DZ_Possession_Sec = models.IntegerField()
    Puck_Battles = models.IntegerField()
    Puck_Battles_Won = models.IntegerField()
    Puck_Battles_Won_Percentage = models.IntegerField()
    Puck_Battles_OZ = models.IntegerField()
    Puck_Battles_NZ = models.IntegerField()
    Puck_Battles_DZ = models.IntegerField()
    Dekes = models.IntegerField()
    Dekes_Successful = models.IntegerField()
    Dekes_Unsuccessful = models.IntegerField()
    Dekes_Successful_Percentage = models.FloatField()
    Passes_Total = models.IntegerField()
    Accurate_Passes = models.IntegerField()
    Accurate_Passes_Percentage = models.FloatField()
    Pre_Shot_Passes = models.IntegerField()
    Dump_Ins = models.IntegerField()
    Dump_Outs = models.IntegerField()
    Passes_To_The_Slot = models.IntegerField()
    OZ_Play = models.IntegerField()
    OZ_Play_With_Shots = models.IntegerField()
    OZ_Play_With_Shots_Percentage = models.FloatField()
    Counter_Attacks = models.IntegerField()
    Counter_Attack_With_Shots = models.IntegerField()
    Counter_Attack_With_Shots_Percentage = models.FloatField()
    Takeaways = models.IntegerField()
    Takeaways_In_NZ = models.IntegerField()
    Takeaways_In_DZ = models.IntegerField()
    Puck_Losses = models.IntegerField()
    Puck_Losses_OZ = models.IntegerField()
    Puck_Losses_NZ = models.IntegerField()
    Puck_Losses_DZ = models.IntegerField()
    Retrievals = models.IntegerField()
    Power_Play_Retrievals = models.IntegerField()
    Penalty_Kill_Retrievals = models.IntegerField()
    EV_OZ_Retrievals = models.IntegerField()
    EV_DZ_Retrievals = models.IntegerField()
    Takeaways_In_OZ = models.IntegerField()
    Loose_Puck_Recovery = models.IntegerField()
    Opponent_Dump_In_Retrievals = models.IntegerField()
    Entries = models.IntegerField()
    Entries_Via_Pass = models.IntegerField()
    Entries_Via_Dump_In = models.IntegerField()
    Entries_Via_Stickhandling = models.IntegerField()
    Breakouts = models.IntegerField()
    Breakouts_Via_Pass = models.IntegerField()
    Breakouts_Via_Dump_Out = models.IntegerField()
    Breakouts_Via_Stickhandling = models.IntegerField()

    def __str__(self):
        return self.Opponent