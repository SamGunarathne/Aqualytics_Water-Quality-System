import firebase_admin
from firebase_admin import credentials, db
import pandas as pd

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app'
})

ref = db.reference("/")
data = ref.get()

#safety Check
if "waterData" not in data:
    print("No water data found")
    exit()

water_data = data["waterData"]

rows = []

for key in water_data:
    d = water_data[key]
    
    rows.append([
        d["ph"],
        d["temperature"],
        d["tds"],
        d["turbidity"]
    ])

df = pd.DataFrame(rows, columns=["ph", "temperature", "tds", "turbidity"])

print(df.head())

df.to_csv("sensor_data.csv", index=False)

print("Dataset saved as sensor_data.csv")