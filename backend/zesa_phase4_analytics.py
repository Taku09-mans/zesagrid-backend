import psycopg2
import pandas as pd
import warnings

# Suppress pandas warning about database connections
warnings.filterwarnings('ignore', category=UserWarning)

print("Initiating ZesaGrid Phase 4: Time-Series Analytics Engine...")
# KEEP THIS SECRET: Plug in your ZesaGrid Neon string here
CONNECTION_STRING = "postgresql://neondb_owner:npg_4v0murYeGptE@ep-curly-brook-amws1v4g-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

try:
    conn = psycopg2.connect(CONNECTION_STRING)

    # 1. Extract the complete history using a Relational SQL Query
    query = """
        SELECT 
            s.suburb_name, 
            g.risk_level, 
            p.start_time, 
            p.outage_type, 
            p.duration_hours
        FROM Power_Outages p
        JOIN Suburbs s ON p.suburb_id = s.suburb_id
        JOIN Grid_Groups g ON s.grid_group_id = g.group_id;
    """

    print("Extracting 6 months of historical grid data from the cloud...")
    df = pd.read_sql_query(query, conn)

    # 2. Data Science: Aggregating the Impact
    print("Crunching the numbers...\n")

    # Group the data by suburb and calculate the core metrics
    impact_df = df.groupby(['suburb_name', 'risk_level'])['duration_hours'].agg(
        Total_Outage_Hours='sum',
        Total_Incidents='count',
        Average_Duration='mean'
    ).reset_index()

    # Sort the dataframe so the worst-affected suburb is at the very top
    impact_df = impact_df.sort_values(by='Total_Outage_Hours', ascending=False)

    # Format the average duration to 1 decimal place so it reads cleanly
    impact_df['Average_Duration'] = impact_df['Average_Duration'].round(1)

    # 3. Present the Findings
    print("--- ZESAGRID ANALYTICS: HARARE SUBURB IMPACT LEADERBOARD ---")
    print(impact_df.to_string(index=False))

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
        print("\nDatabase connection safely closed.")