import psycopg2
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import warnings

warnings.filterwarnings('ignore')

print("Initiating ZesaGrid Phase 5: Machine Learning Engine...")
# KEEP THIS SECRET: Plug in your ZesaGrid Neon string here
CONNECTION_STRING = "postgresql://neondb_owner:npg_4v0murYeGptE@ep-curly-brook-amws1v4g-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

try:
    conn = psycopg2.connect(CONNECTION_STRING)

    # 1. Extract the raw historical data for the AI to study
    print("Extracting training data from the cloud...")
    query = """
        SELECT 
            suburb_id, 
            EXTRACT(HOUR FROM start_time) as outage_hour, 
            outage_type 
        FROM Power_Outages;
    """
    df = pd.read_sql_query(query, conn)

    # 2. Feature Engineering: Convert the text targets into numbers for the AI
    # 1 = Load Shedding (Severe), 0 = Fault (Minor)
    df['target'] = df['outage_type'].apply(lambda x: 1 if x == 'Load Shedding' else 0)

    # Define our Features (X) and our Target (y)
    X = df[['suburb_id', 'outage_hour']]
    y = df['target']

    # Split the data: 80% to train, 20% to test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 3. Train the AI Model
    print("Training the Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Test its accuracy
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Accuracy on Historical Grid Data: {accuracy * 100:.2f}%\n")

    # 4. The Oracle: Predicting tonight's power cuts
    print("--- THE ZESAGRID ORACLE: PREDICTING TONIGHT'S OUTAGES ---")

    # Scenario A: Power goes out in Kuwadzana (High Risk, Suburb ID 1) at 18:00 (6 PM)
    scenario_a = pd.DataFrame({'suburb_id': [1], 'outage_hour': [18]})
    pred_a = model.predict(scenario_a)[0]
    result_a = "LOAD SHEDDING (Expect 6-12 hours in the dark)" if pred_a == 1 else "LOCAL FAULT (Should be back soon)"
    print(f"Scenario A - Kuwadzana @ 18:00: AI Predicts -> {result_a}")

    # Scenario B: Power goes out in Avondale (Low Risk, Suburb ID 5) at 18:00 (6 PM)
    scenario_b = pd.DataFrame({'suburb_id': [5], 'outage_hour': [18]})
    pred_b = model.predict(scenario_b)[0]
    result_b = "LOAD SHEDDING (Expect 6-12 hours in the dark)" if pred_b == 1 else "LOCAL FAULT (Should be back soon)"
    print(f"Scenario B - Avondale  @ 18:00: AI Predicts -> {result_b}")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()