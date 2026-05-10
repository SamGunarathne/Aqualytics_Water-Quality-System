import pandas as pd
import random

data = []

for _ in range(1000):
    ph = round(random.uniform(4, 10), 2)
    turbidity = round(random.uniform(0, 10), 2)
    tds = round(random.uniform(100, 1000), 2)
    temp = round(random.uniform(20, 40), 2)

    if (6.5 <= ph <= 8.5) and (turbidity < 5) and (tds < 500):
        label = 0 #safe
    else:
        label = 1 #unsafe

    data.append([ph, turbidity, tds, temp, label])

df = pd.DataFrame(data, columns=[
    "ph", "turbidity", "tds", "temperature", "label"
])

df.to_csv("water_data.csv", index=False)

print("Dataset created successfully")