import psycopg2

try:
    # ------------------------------------------------------
    # connect to hood_hockey database
    # ------------------------------------------------------
    conn = psycopg2.connect("postgresql://my_hood_user:my_strong_password@localhost:5432/hood_hockey")  

    print("Successfully connected to the hood_hockey database!")
    # ------------
    # SQL
    # ------------
    cur = conn.cursor()
    cur.execute("SELECT version();")  # Example query
    version = cur.fetchone()
    print(f"PostgreSQL version: {version}")

    # commit changes
    conn.commit()  
    print("commited")

except (Exception, psycopg2.Error) as error:
    print(f"Error connecting to database: {error}")

finally:
    if 'conn' in locals() and conn:  # Check if connection exists
        cur.close()  # Close the cursor
        conn.close()  # Close the connection