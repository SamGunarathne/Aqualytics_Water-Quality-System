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

# Track previous values for sudden change detection
previous_ph = None
previous_turbidity = None
previous_tds = None
previous_temperature = None

print("ML Prediction System Started...")

while True:

    try:

        # Fetch only the single latest record
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
        ph = float(latest_data.get("ph", 0))
        turbidity = float(latest_data.get("turbidity", 0))
        tds = float(latest_data.get("tds", 0))
        temperature = float(latest_data.get("temperature", 0))

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


        # -------------------------------
        # HARDWARE FAULT DETECTION
        # -------------------------------
        # Catches loose wires, disconnected probes, or dead sensors 
        # before running the ML model to prevent false positive anomalies.
        
        hardware_fault = False
        fault_reason = "Normal"

        if ph <= 0 or ph > 14:
            hardware_fault = True
            fault_reason = "pH Sensor Disconnected or Out of Bounds"
        elif turbidity < 0 or turbidity > 3000: # Adjust max based on your sensor spec
            hardware_fault = True
            fault_reason = "Turbidity Sensor Fault"
        elif temperature < 0 or temperature > 60: 
            hardware_fault = True
            fault_reason = "Temperature Sensor Fault"
        elif tds < 0:
            hardware_fault = True
            fault_reason = "TDS Sensor Fault"

        # -------------------------------
        # ML PREDICTION & ANOMALIES
        # -------------------------------
        
        anomaly = False
        anomaly_reason = "Normal"
        prediction_val = 0
        status = "Unknown"

        if hardware_fault:
            # Skip ML if sensors are broken
            status = "Sensor Error"
            anomaly = True
            anomaly_reason = fault_reason
            
            # Reset previous tracking so it doesn't trigger sudden changes when it comes back online
            previous_ph = None
            previous_turbidity = None
            previous_tds = None
            previous_temperature = None
            
        else:
            # Run ML prediction on healthy data
            input_df = pd.DataFrame(
                [[ph, turbidity, tds, temperature]],
                columns=["ph", "turbidity", "tds", "temperature"]
            )

            prediction_val = model.predict(input_df)[0]
            status = "Unsafe Water" if prediction_val == 1 else "Safe Water"

            # Threshold-based anomalies (Water Quality)
            if ph < 5 or ph > 9:
                anomaly = True
                anomaly_reason = "Abnormal pH"
            elif turbidity > 150:
                anomaly = True
                anomaly_reason = "High Turbidity"
            elif temperature > 45:
                anomaly = True
                anomaly_reason = "High Temperature"

            # Sudden change detection (Water Quality)
            if previous_ph is not None:
                if abs(ph - previous_ph) > 2:
                    anomaly = True
                    anomaly_reason = "Sudden pH Change"

            if previous_turbidity is not None:
                if abs(turbidity - previous_turbidity) > 50:
                    anomaly = True
                    anomaly_reason = "Sudden Turbidity Change"

            # Update previous values for the next loop
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
        
        if hardware_fault:
            print(f"⚠️ HARDWARE FAULT: {fault_reason}")
        else:
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
            "prediction": int(prediction_val),
            "status": status,
            "anomaly": anomaly,
            "anomaly_reason": anomaly_reason,
            "hardware_fault": hardware_fault, # Added to payload so the UI can style it differently
            "timestamp": latest_data.get("timestamp")
        })

    except Exception as e:
        print("System Error:", e)

    # Wait before next reading
    time.sleep(5)
