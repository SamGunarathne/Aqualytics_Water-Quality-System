import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import pickle

df = pd.read_csv("sensor_data.csv")

# Rule-based labeling
def label_water(row):
    if row["ph"] < 6.5 or row["ph"] > 8.5:
        return 1  # unsafe
    if row["turbidity"] > 100:
        return 1
    return 0  # safe

df["label"] = df.apply(label_water, axis=1)

X = df[["ph", "temperature", "tds", "turbidity"]]
y = df["label"]

model = DecisionTreeClassifier()
model.fit(X, y)

pickle.dump(model, open("model.pkl", "wb"))

print("New model trained and saved")