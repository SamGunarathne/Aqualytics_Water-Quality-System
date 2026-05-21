import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import pickle

# Load real sensor dataset
df = pd.read_csv("sensor_data.csv")

# Remove missing values
df = df.dropna()

# Rule-based labeling
def label_water(row):

    if row["ph"] < 6.5 or row["ph"] > 8.5:
        return 1

    if row["turbidity"] > 150:
        return 1

    if row["temperature"] > 45:
        return 1

    return 0

# Create labels
df["label"] = df.apply(label_water, axis=1)

# Correct feature order
X = df[[
    "ph",
    "turbidity",
    "tds",
    "temperature"
]]

y = df["label"]

# Train model
model = DecisionTreeClassifier(random_state=42)

model.fit(X, y)

# Save model
pickle.dump(model, open("model.pkl", "wb"))

print("New model trained successfully")
