from django.db import models

class Skaters(models.Model):
    number = models.IntegerField()
    name = models.CharField(max_length=255)
    position = models.DecimalField(max_length=1)
    time_on_ice = models.DurationField()
    games_played = models.IntegerField()
    all_shifts = models.IntegerField()
    goals = models.FloatField()
    first_assist = models.FloatField()
    second_assist = models.FloatField()
    assists = models.FloatField()
    points = models.FloatField()