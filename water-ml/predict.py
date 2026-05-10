import pickle
import pandas as pd

model = pickle.load(open("model.pkl", "rb"))

# Example input
sample = pd.DataFrame([[
    7.0, 3.0, 300, 28
]], columns=['ph', 'turbidity', 'tds', 'temperature'])

prediction = model.predict(sample)[0]

result = "UNSAFE" if prediction == 1 else "SAFE"

print("Prediction:", result)