# ZesaGrid Data & Analytics Platform

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Power BI](https://img.shields.io/badge/power_bi-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)

## Project Overview
The ZesaGrid Platform is a predictive data systems architecture designed to track, analyse, and forecast power grid instability and load shedding across Zimbabwean suburbs. 

Recognising the severe operational challenges caused by unpredictable power outages, this project engineers a comprehensive pipeline that simulates realistic time-series grid data, stores it in a secure cloud relational database, and utilises machine learning to predict the exact nature of an outage (Local Fault vs. Scheduled Load Shedding) based on geospatial and temporal variables.

## Systems Architecture

The platform operates across a sophisticated five-phase pipeline:

1. Cloud Relational Database (PostgreSQL): A 3rd Normal Form (3NF) relational database hosted on Neon (Serverless AWS PostgreSQL). It utilises strict primary and foreign key constraints to map Suburbs to their respective Load Shedding Grid Groups.
2. Time-Series Data Simulator: A Python-based stochastic engine that synthesises 6 months of historical power outage data. It utilises weighted probability logic to generate outage durations and types based on the assigned risk level of each geographic zone.
3. Analytics Bridge (Pandas): SQL-to-Pandas pipelines extract relational cloud data for automated aggregation, calculating the total hours lost, incident counts, and average duration of outages per suburb.
4. Machine Learning Engine: A RandomForestClassifier trained via scikit-learn. It performs automated feature engineering (extracting hour-of-day variables) to predict whether an upcoming outage is a severe load shedding event or a minor local fault, achieving a high degree of predictive accuracy.
5. Business Intelligence (Power BI): A live-connected, mobile-optimised Power BI dashboard visualising custom DAX metrics, outage leaderboards, and risk breakdowns across the national grid.

## Repository Structure

├── database/
│   ├── zesa_db_setup.py         # DDL scripts for 3NF PostgreSQL architecture
│   ├── zesa_seed_data.py        # Automated entity seeding (Groups & Suburbs)
├── analytics/
│   ├── zesa_phase3_simulator.py # Stochastic time-series data generator
│   ├── zesa_phase4_analytics.py # Pandas extraction and data aggregation
│   ├── zesa_phase5_ml.py        # Scikit-learn Random Forest predictive model
├── dashboard/
│   ├── zesagrid_ui.pbix         # Power BI Dashboard file
└── README.md


## How to Run the Pipeline

1. Clone the repository:
git clone https://github.com/yourusername/ZesaGrid_Platform.git
cd ZesaGrid_Platform

2. Set up the Virtual Environment & Install Dependencies:
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install psycopg2-binary pandas scikit-learn

3. Configure the Database:
* Create a free serverless database on Neon.tech.
* Replace the CONNECTION_STRING variable in all Python scripts with your secure PostgreSQL URL.
* Run the setup and seed scripts to build the architecture: 
  python database/zesa_db_setup.py
  python database/zesa_seed_data.py

4. Generate Data and Run the Machine Learning Oracle:
python analytics/zesa_phase3_simulator.py
python analytics/zesa_phase5_ml.py

## Author
Takunda Mandizvidza - Data Science and Systems | University of Zimbabwe
Architecting data-driven solutions for complex, real-world ecosystems.