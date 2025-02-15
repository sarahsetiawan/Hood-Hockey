from django.shortcuts import render
from django.db import connection

def list_tables():
    with connection.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")  # Or use pg_tables
        tables = cursor.fetchall()
        return [table[0] for table in tables]  # Extract table names from the result

# Example usage (in a view, management command, or script):
tables = list_tables()
print(tables)