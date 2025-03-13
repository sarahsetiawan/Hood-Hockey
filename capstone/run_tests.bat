@echo off  'This prevents the commands themselves from being displayed

call .env.test  'Loads the environment variables from .env.test

python manage.py test  'Runs your Django tests