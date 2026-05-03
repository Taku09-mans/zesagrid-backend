from db_config import get_db_connection

print("Injecting fresh ZesaGrid seed data...")

try:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Inject Groups
    cursor.execute("""
        INSERT INTO Grid_Groups (group_name, risk_level)
        VALUES ('Group A', 'High'), ('Group B', 'Medium'), ('Group C', 'Low')
        RETURNING group_id, group_name;
    """)
    group_map = {name: g_id for g_id, name in cursor.fetchall()}

    # Inject Suburbs
    suburbs_data = [
        ('Kuwadzana', group_map['Group A']),
        ('Warren Park', group_map['Group A']),
        ('Borrowdale', group_map['Group B']),
        ('Mabvuku', group_map['Group A']),
        ('Avondale', group_map['Group C'])
    ]

    cursor.executemany(
        "INSERT INTO Suburbs (suburb_name, grid_group_id) VALUES (%s, %s)",
        suburbs_data
    )

    conn.commit()
    print("SUCCESS! Suburbs linked and online.")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    if 'conn' in locals(): conn.close()