import firebase_admin
from firebase_admin import credentials, db
import pandas as pd

# Firebase setup
cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

# Get database data
ref = db.reference("/")
data = ref.get()

# Safety check
if not data or "waterData" not in data:
    print("No water data found")
    exit()

water_data = data["waterData"]

rows = []

for key in water_data:

    d = water_data[key]

    # Required fields check
    required_fields = [
        "ph",
        "turbidity",
        "tds",
        "temperature"
    ]

    if not all(field in d for field in required_fields):
        continue

    rows.append([
        d.get("ph"),
        d.get("turbidity"),
        d.get("tds"),
        d.get("temperature")
    ])

# Create dataframe
df = pd.DataFrame(rows, columns=[
    "ph",
    "turbidity",
    "tds",
    "temperature"
])

# Remove empty values
df = df.dropna()

print(df.head())

# Save dataset
df.to_csv("sensor_data.csv", index=False)

print("Dataset saved as sensor_data.csv")
