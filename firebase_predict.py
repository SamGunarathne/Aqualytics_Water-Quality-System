import firebase_admin
from firebase_admin import credentials, db
import pickle
import time
import warnings
import pandas as pd

# Hide warnings (clean output)
warnings.filterwarnings("ignore")

# Load Firebase key
cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Load ML model
model = pickle.load(open("model.pkl", "rb"))

# Connect to database
ref = db.reference("/")

# Track last processed data
last_timestamp = None

print(" ML system started...")

while True:
    data = ref.get()

    # Check if data exists
    if "waterData" not in data:
        print("No data found...")
        time.sleep(5)
        continue

    water_data = data["waterData"]

    # Get latest reading using timestamp
    latest_key = max(water_data.keys(), key=lambda k: water_data[k]["timestamp"])
    latest_data = water_data[latest_key]

    # Avoid duplicate processing
    if latest_data["timestamp"] == last_timestamp:
        time.sleep(5)
        continue

    last_timestamp = latest_data["timestamp"]

    # Create dataframe
    input_df = pd.DataFrame([[
        latest_data["ph"],
        latest_data["turbidity"],
        latest_data["tds"],
        latest_data["temperature"]
    ]], columns=[
        "ph",
        "turbidity",
        "tds",
        "temperature"
    ])

    # ML prediction
    prediction = model.predict(input_df)[0]


    # Convert prediction to status
    status = "Unsafe Water" if prediction == 1 else "Safe Water"

    # Console output
    print("\n--- Live Prediction ---")

    print(f"pH: {latest_data['ph']}")
    print(f"Temperature: {latest_data['temperature']} °C")
    print(f"TDS: {latest_data['tds']}")
    print(f"Turbidity: {latest_data['turbidity']}")

    print(f"Status: {status}")

    # Save prediction back to Firebase
    db.reference("predictions").push({

        "ph": latest_data["ph"],
        "temperature": latest_data["temperature"],
        "tds": latest_data["tds"],
        "turbidity": latest_data["turbidity"],

        "prediction": int(prediction),
        "status": status,

        "timestamp": latest_data["timestamp"]
    })

    # Wait before next check
    time.sleep(5)
