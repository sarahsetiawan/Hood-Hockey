from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Lists all tables in the database'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
            tables = cursor.fetchall()

        for table in tables:
            self.stdout.write(table[0])  # Print table names