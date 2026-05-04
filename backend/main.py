import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from db_config import get_db_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    suburb_id: int
    outage_hour: int


def run_trained_model(suburb_id, hour):
    """
    Internal engine that pulls live data and runs the Random Forest Classifier.
    """
    conn = get_db_connection()
    query = """
        SELECT suburb_id, EXTRACT(HOUR FROM start_time) as outage_hour, outage_type 
        FROM Power_Outages;
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        return "INSUFFICIENT DATA", 0.0

    # Feature Engineering
    df['target'] = df['outage_type'].apply(lambda x: 1 if x == 'Load Shedding' else 0)

    X = df[['suburb_id', 'outage_hour']]
    y = df['target']

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Predict for the specific suburb and time
    prediction_df = pd.DataFrame({'suburb_id': [suburb_id], 'outage_hour': [hour]})
    pred = model.predict(prediction_df)[0]
    prob = model.predict_proba(prediction_df)[0].max()

    result = "LOAD SHEDDING" if pred == 1 else "LOCAL FAULT"
    return result, round(float(prob), 2)


@app.get("/")
def health_check():
    return {"status": "ZesaGrid API is Live"}


@app.get("/api/suburbs")
def get_suburbs():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT suburb_id as id, suburb_name as name FROM Suburbs ORDER BY name", conn)
    conn.close()
    return df.to_dict(orient='records')


@app.get("/api/leaderboard")
def get_leaderboard():
    conn = get_db_connection()
    # ---> FIX APPLIED HERE: Added AVG calculation to the SQL Query <---
    query = """
        SELECT 
            s.suburb_name as suburb, 
            SUM(p.duration_hours) as total_hours,
            AVG(p.duration_hours) as avg_duration
        FROM Power_Outages p
        JOIN Suburbs s ON p.suburb_id = s.suburb_id
        GROUP BY s.suburb_name
        ORDER BY total_hours DESC
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    # Ensure the average is clean (e.g., 4.2 instead of 4.288339)
    if not df.empty:
        df['avg_duration'] = df['avg_duration'].round(1)

    return df.to_dict(orient='records')


@app.post("/api/predict")
def predict_outage(request: PredictionRequest):
    prediction, confidence = run_trained_model(request.suburb_id, request.outage_hour)
    return {
        "prediction": prediction,
        "confidence": confidence,
        "suburb_id": request.suburb_id,
        "hour": request.outage_hour
    }