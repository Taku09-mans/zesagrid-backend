from db_config import get_db_connection

print("Connecting to Neon Cloud Database for ZesaGrid...")

try:
    conn = get_db_connection()
    cursor = conn.cursor()

    create_tables_query = """
    DROP TABLE IF EXISTS Power_Outages CASCADE;
    DROP TABLE IF EXISTS Suburbs CASCADE;
    DROP TABLE IF EXISTS Grid_Groups CASCADE;

    CREATE TABLE Grid_Groups (
        group_id SERIAL PRIMARY KEY,
        group_name VARCHAR(10) NOT NULL UNIQUE,
        risk_level VARCHAR(20)
    );

    CREATE TABLE Suburbs (
        suburb_id SERIAL PRIMARY KEY,
        suburb_name VARCHAR(100) NOT NULL,
        city VARCHAR(50) DEFAULT 'Harare',
        grid_group_id INT,
        FOREIGN KEY (grid_group_id) REFERENCES Grid_Groups(group_id)
    );

    CREATE TABLE Power_Outages (
        outage_id SERIAL PRIMARY KEY,
        suburb_id INT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        outage_type VARCHAR(50) NOT NULL,
        duration_hours DECIMAL(5,2),
        FOREIGN KEY (suburb_id) REFERENCES Suburbs(suburb_id)
    );
    """
    cursor.execute(create_tables_query)
    conn.commit()
    print("SUCCESS! Infrastructure Rebuilt.")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    if 'conn' in locals(): conn.close()