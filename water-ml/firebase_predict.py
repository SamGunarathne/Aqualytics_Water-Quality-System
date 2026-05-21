# firebase_predict.py

import firebase_admin
from firebase_admin import credentials, db
import pickle
import time
import warnings
import pandas as pd

# Hide warnings
warnings.filterwarnings("ignore")

# Load Firebase key
cred = credentials.Certificate("serviceAccountKey.json")

# Prevent multiple initialization errors
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

# Load ML model
model = pickle.load(open("model.pkl", "rb"))

# Connect ONLY to waterData
water_data_ref = db.reference("waterData")

# Track last processed timestamp
last_timestamp = None

# Track previous values for anomaly detection
previous_ph = None
previous_turbidity = None
previous_tds = None
previous_temperature = None

print("ML Prediction System Started...")

while True:

    try:

        data = water_data_ref.order_by_child("timestamp").limit_to_last(1).get()

        # Check if water data exists
        if not data:
            print("No water data found...")
            time.sleep(5)
            continue

        water_data = data

        # Get latest reading safely
        latest_key = list(water_data.keys())[0]
        latest_data = water_data[latest_key]

        # Required fields check
        required_fields = [
            "ph",
            "turbidity",
            "tds",
            "temperature",
            "timestamp"
        ]

        if not all(field in latest_data for field in required_fields):
            print("Missing required values...")
            time.sleep(5)
            continue

        # Avoid duplicate processing
        if latest_data.get("timestamp") == last_timestamp:
            time.sleep(5)
            continue

        last_timestamp = latest_data.get("timestamp")

        # Get sensor values safely
        ph = latest_data.get("ph")
        turbidity = latest_data.get("turbidity")
        tds = latest_data.get("tds")
        temperature = latest_data.get("temperature")

        # Null / empty value check
        if (
            ph is None or
            turbidity is None or
            tds is None or
            temperature is None
        ):
            print("Null sensor values detected...")
            time.sleep(5)
            continue

        # Create dataframe
        input_df = pd.DataFrame(
            [[ph, turbidity, tds, temperature]],
            columns=[
                "ph",
                "turbidity",
                "tds",
                "temperature"
            ]
        )

        # ML prediction
        prediction = model.predict(input_df)[0]

        # Convert prediction to status
        status = "Unsafe Water" if prediction == 1 else "Safe Water"

        # -------------------------------
        # ANOMALY DETECTION
        # -------------------------------

        anomaly = False
        anomaly_reason = "Normal"

        # Threshold-based anomalies
        if ph < 5 or ph > 9:
            anomaly = True
            anomaly_reason = "Abnormal pH"

        elif turbidity > 150:
            anomaly = True
            anomaly_reason = "High Turbidity"

        elif temperature > 45:
            anomaly = True
            anomaly_reason = "High Temperature"

        # Sudden change detection
        if previous_ph is not None:
            if abs(ph - previous_ph) > 2:
                anomaly = True
                anomaly_reason = "Sudden pH Change"

        if previous_turbidity is not None:
            if abs(turbidity - previous_turbidity) > 50:
                anomaly = True
                anomaly_reason = "Sudden Turbidity Change"

        # Update previous values
        previous_ph = ph
        previous_turbidity = turbidity
        previous_tds = tds
        previous_temperature = temperature

        # -------------------------------
        # Console Output
        # -------------------------------

        print("\n--- Live Prediction ---")
        print(f"pH: {ph}")
        print(f"Temperature: {temperature} °C")
        print(f"TDS: {tds}")
        print(f"Turbidity: {turbidity}")
        print(f"Prediction: {status}")

        if anomaly:
            print(f"⚠️ Anomaly Detected: {anomaly_reason}")
        else:
            print("No anomalies detected")

        # -------------------------------
        # Save prediction to Firebase
        # -------------------------------

        db.reference("predictions").push({
            "ph": ph,
            "temperature": temperature,
            "tds": tds,
            "turbidity": turbidity,
            "prediction": int(prediction),
            "status": status,
            "anomaly": anomaly,
            "anomaly_reason": anomaly_reason,
            "timestamp": latest_data.get("timestamp")
        })

    except Exception as e:
        print("System Error:", e)

    # Wait before next reading
    time.sleep(5)
