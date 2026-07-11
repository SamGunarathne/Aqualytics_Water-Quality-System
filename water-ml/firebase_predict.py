import firebase_admin
from firebase_admin import credentials, db
import pickle
import time
import warnings
import pandas as pd

# Hide warnings
warnings.filterwarnings("ignore")

# -----------------------------------
# FIREBASE INITIALIZATION
# -----------------------------------

cred = credentials.Certificate("serviceAccountKey.json")

# Prevent duplicate Firebase initialization
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

# -----------------------------------
# LOAD TRAINED MODEL
# -----------------------------------

model = pickle.load(open("model.pkl", "rb"))

# -----------------------------------
# DATABASE REFERENCES
# -----------------------------------

# Reads sensor data from this node
water_data_ref = db.reference("waterData")

# Saves ML predictions to this node
prediction_ref = db.reference("predictions")

# -----------------------------------
# TRACK PREVIOUS STATE
# -----------------------------------

# Prevent duplicate prediction processing
last_timestamp = None

# Store previous values for anomaly detection
previous_ph = None
previous_turbidity = None
previous_tds = None
previous_temperature = None

print("===================================")
print("ML Prediction System Started...")
print("Waiting for realtime sensor data...")
print("===================================")

# -----------------------------------
# MAIN LOOP
# -----------------------------------

while True:

    try:

        # -----------------------------------
        # GET LATEST WATER RECORD
        # -----------------------------------

        data = (
            water_data_ref
            .order_by_child("timestamp")
            .limit_to_last(1)
            .get()
        )

        # No data check
        if not data:
            print("No water data found...")
            time.sleep(5)
            continue

        # Ensure valid dictionary
        if not isinstance(data, dict) or len(data) == 0:
            print("Invalid Firebase data format...")
            time.sleep(5)
            continue

        # Get latest record safely
        latest_key = next(iter(data))
        latest_data = data[latest_key]

        # -----------------------------------
        # REQUIRED FIELD VALIDATION
        # -----------------------------------

        required_fields = [
            "ph",
            "turbidity",
            "tds",
            "temperature",
            "timestamp"
        ]

        # Check required fields exist
        if not all(field in latest_data for field in required_fields):
            print("Missing required sensor values...")
            time.sleep(5)
            continue

        # -----------------------------------
        # PREVENT DUPLICATE PROCESSING
        # -----------------------------------

        current_timestamp = latest_data.get("timestamp")

        if current_timestamp == last_timestamp:
            time.sleep(5)
            continue

        # Update last timestamp
        last_timestamp = current_timestamp

        # -----------------------------------
        # SAFE SENSOR VALUE CONVERSION
        # -----------------------------------

        try:

            ph = float(latest_data.get("ph"))
            turbidity = float(latest_data.get("turbidity"))
            tds = float(latest_data.get("tds"))
            temperature = float(latest_data.get("temperature"))

        except (TypeError, ValueError):

            print("Invalid sensor data types... Clearing tracking state to avoid anomalies.")
            # Clear previous state tracking values so a recovery on the 
            # next loop won't calculate sudden changes using stale history.
            previous_ph = None
            previous_turbidity = None
            previous_tds = None
            previous_temperature = None
            
            time.sleep(5)
            continue

        # -----------------------------------
        # CREATE DATAFRAME FOR MODEL
        # -----------------------------------

        input_df = pd.DataFrame(
            [[ph, turbidity, tds, temperature]],
            columns=[
                "ph",
                "turbidity",
                "tds",
                "temperature"
            ]
        )

        # -----------------------------------
        # ML PREDICTION
        # -----------------------------------

        prediction = model.predict(input_df)[0]

        # Convert prediction to readable label
        status = "Unsafe Water" if prediction == 1 else "Safe Water"

        # -----------------------------------
        # ANOMALY DETECTION
        # -----------------------------------

        anomaly = False
        anomaly_reason = "Normal"

        # -------------------------
        # Threshold-Based Detection
        # -------------------------

        if ph < 5 or ph > 9:

            anomaly = True
            anomaly_reason = "Abnormal pH"

        elif turbidity > 150:

            anomaly = True
            anomaly_reason = "High Turbidity"

        elif temperature > 45:

            anomaly = True
            anomaly_reason = "High Temperature"

        elif tds > 1000:

            anomaly = True
            anomaly_reason = "High TDS"

        # -------------------------
        # Sudden Change Detection
        # -------------------------

        if previous_ph is not None:

            if abs(ph - previous_ph) > 2:

                anomaly = True
                anomaly_reason = "Sudden pH Change"

        if previous_turbidity is not None:

            if abs(turbidity - previous_turbidity) > 50:

                anomaly = True
                anomaly_reason = "Sudden Turbidity Change"

        if previous_temperature is not None:

            if abs(temperature - previous_temperature) > 10:

                anomaly = True
                anomaly_reason = "Sudden Temperature Change"

        # -----------------------------------
        # UPDATE PREVIOUS VALUES
        # -----------------------------------

        previous_ph = ph
        previous_turbidity = turbidity
        previous_tds = tds
        previous_temperature = temperature

        # -----------------------------------
        # CONSOLE OUTPUT
        # -----------------------------------

        print("\n========== LIVE PREDICTION ==========")

        print(f"pH          : {ph}")
        print(f"Temperature : {temperature} °C")
        print(f"TDS         : {tds}")
        print(f"Turbidity   : {turbidity}")

        print("-------------------------------------")

        print(f"Prediction  : {status}")

        if anomaly:

            print(f"⚠️ Anomaly   : {anomaly_reason}")

        else:

            print("Anomaly     : None")

        print("=====================================")

        # -----------------------------------
        # SAVE RESULTS TO FIREBASE
        # -----------------------------------

        prediction_ref.push({

            "ph": ph,
            "temperature": temperature,
            "tds": tds,
            "turbidity": turbidity,

            "prediction": int(prediction),
            "status": status,

            "anomaly": anomaly,
            "anomaly_reason": anomaly_reason,

            "timestamp": current_timestamp
        })

        print("Prediction saved to Firebase.")

    except Exception as e:

        print("System Error:", e)

    # -----------------------------------
    # WAIT BEFORE NEXT CHECK
    # -----------------------------------

    time.sleep(5)
