import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# 1. Load the real processed dataset
df = pd.read_csv("sensor_data.csv")
df = df.dropna()

# 2. Reapply ground truth rules to evaluate how well the tree matched them
def label_water(row):
    if row["ph"] < 6.5 or row["ph"] > 8.5: return 1
    if row["turbidity"] > 150: return 1
    if row["temperature"] > 45: return 1
    if row["tds"] > 1000: return 1
    return 0

df["label"] = df.apply(label_water, axis=1)

X = df[["ph", "turbidity", "tds", "temperature"]]
y = df["label"]

# 3. Create a clean 80/20 train/test split matching professional standards
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Load final production model
try:
    model = pickle.load(open("model.pkl", "rb"))
except FileNotFoundError:
    print("Error: Train the model first by running train_new_modell.py")
    exit()

# 5. Generate predictions on the test set
y_pred = model.predict(X_test)

# 6. Calculate Academic Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=1)
recall = recall_score(y_test, y_pred, zero_division=1)
f1 = f1_score(y_test, y_pred, zero_division=1)
cm = confusion_matrix(y_test, y_pred)

# 7. Print Report Formatted for Your Documentation
print("\n=============================================")
print("     AQUALYTICS ML MODEL EVALUATION METRICS   ")
print("=============================================")
print(f"Overall Accuracy : {accuracy * 100:.2f}%")
print(f"Precision Score  : {precision:.4f}")
print(f"Recall Score     : {recall:.4f} (Critical Safety Metric)")
print(f"F1-Score         : {f1:.4f}")
print("---------------------------------------------")
print("Confusion Matrix:")
print(f"True Negatives (Correctly predicted Safe)  : {cm[0][0]}")
print(f"False Positives (False Alarms triggered)   : {cm[0][1]}")
print(f"False Negatives (Missed Unsafe Incidents)  : {cm[1][0]}")
print(f"True Positives (Correctly predicted Unsafe): {cm[1][1]}")
print("=============================================\n")
