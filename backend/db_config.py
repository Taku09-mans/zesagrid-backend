import os
import psycopg2
from dotenv import load_dotenv

# Load the .env file automatically
load_dotenv()

def get_db_connection():
    """
    Standardizes how every script in the ZesaGrid project connects to Neon.
    """
    connection_string = os.getenv("DATABASE_URL")
    if not connection_string:
        raise ValueError("DATABASE_URL not found in .env file")
    return psycopg2.connect(connection_string)