import psycopg2
import random
from datetime import datetime, timedelta

print("Initiating ZesaGrid Phase 3: Time-Series Data Simulator...")
# KEEP THIS SECRET: Plug in your ZesaGrid Neon string here
CONNECTION_STRING = "postgresql://neondb_owner:npg_4v0murYeGptE@ep-curly-brook-amws1v4g-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

try:
    conn = psycopg2.connect(CONNECTION_STRING)
    cursor = conn.cursor()

    # 1. Fetch the Suburbs and their specific Risk Levels from the database
    cursor.execute("""
        SELECT s.suburb_id, s.suburb_name, g.risk_level 
        FROM Suburbs s
        JOIN Grid_Groups g ON s.grid_group_id = g.group_id;
    """)
    suburbs = cursor.fetchall()

    print("Synthesizing 500 historical power outage events over the last 6 months...")

    # 2. Generate the Data locally
    outages_data = []
    now = datetime.now()

    for _ in range(500):
        # Pick a random suburb from our list
        suburb = random.choice(suburbs)
        suburb_id = suburb[0]
        risk_level = suburb[2]

        # Generate a random start time within the last 180 days
        days_ago = random.randint(1, 180)
        hours_ago = random.randint(0, 23)
        start_time = now - timedelta(days=days_ago, hours=hours_ago)

        # 3. AI Logic: Determine the Outage Type and Duration based on Risk Level
        if risk_level == 'High':
            # High risk: 85% chance of Load Shedding, lasts 6 to 12 hours
            outage_type = random.choices(['Load Shedding', 'Fault'], weights=[85, 15])[0]
            duration = random.randint(6, 12)
        elif risk_level == 'Medium':
            # Medium risk: 50/50 split, lasts 4 to 8 hours
            outage_type = random.choices(['Load Shedding', 'Fault'], weights=[50, 50])[0]
            duration = random.randint(4, 8)
        else:
            # Low risk: Very rare Load Shedding, mostly short faults lasting 1 to 4 hours
            outage_type = random.choices(['Load Shedding', 'Fault'], weights=[20, 80])[0]
            duration = random.randint(1, 4)

        end_time = start_time + timedelta(hours=duration)

        # Add this specific power cut to our massive list
        outages_data.append((suburb_id, start_time, end_time, outage_type, duration))

    # 4. Bulk Insert: Fire all 500 records into the cloud database at exactly the same time
    insert_query = """
        INSERT INTO Power_Outages (suburb_id, start_time, end_time, outage_type, duration_hours)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.executemany(insert_query, outages_data)

    # Save the changes
    conn.commit()
    print("SUCCESS! 500 localized power outages are now live in the national grid database.")

except Exception as e:
    print(f"An error occurred: {e}")
    conn.rollback()  # Protects the database

finally:
    if 'conn' in locals() and conn:
        cursor.close()
        conn.close()
        print("Database connection safely closed.")