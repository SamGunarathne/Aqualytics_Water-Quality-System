# Aqualytics - Machine Learning & Backend Module

## Overview

This module handles the Machine Learning and backend prediction functionality of the Aqualytics Smart Water Quality Monitoring System.

The purpose of this module is to:
- process water quality sensor data
- train prediction models
- generate water quality predictions
- integrate predictions with Firebase Realtime Database
- support real-time dashboard visualisation

This module was developed progressively, starting from synthetic data experimentation and later transitioning into real sensor-based prediction workflows.



# Objectives

The main objectives of this module are:

- Understand and implement the machine learning workflow
- Develop a water quality prediction system
- Integrate ML predictions with Firebase
- Process real-time sensor readings
- Build an automated prediction pipeline



# Machine Learning Workflow

The development process was completed in multiple stages.

## Phase 1 - Initial ML Prototype

At the beginning of development, live IoT sensor data was not available.  
To continue progress, a synthetic dataset approach was used to understand and test the ML pipeline.

### Steps Completed
1. Generate synthetic water quality data
2. Create labels based on water quality conditions
3. Train a prediction model
4. Save the trained model
5. Test prediction functionality

### Files Used

| File | Purpose |
|---|---|
| `generate_data.py` | Generates synthetic water quality dataset |
| `water_data.csv` | Generated training dataset |
| `train_model.py` | Trains initial ML model |
| `model.pkl` | Saved trained model |
| `predict.py` | Tests prediction functionality |



## Phase 2 - Real Sensor Data Integration

After the IoT module completed Firebase integration, live sensor readings became available.

The ML system was then integrated with Firebase to process real-time sensor data.

### Steps Completed
1. Read sensor data from Firebase
2. Store sensor history into dataset format
3. Retrain model using real sensor readings
4. Generate real-time predictions
5. Update predictions back to Firebase

### Files Used

| File | Purpose |
|---|---|
| `prepare_data.py` | Extracts Firebase sensor data into CSV format |
| `sensor_data.csv` | Dataset generated from real sensor readings |
| `Train_new_model.py` | Retrains model using real sensor data |
| `firebase_predict.py` | Real-time Firebase prediction system |



# Water Parameters Used

The prediction model analyses the following water quality parameters:

- pH
- Turbidity
- Temperature
- TDS (Total Dissolved Solids)



# Technologies Used

- Python
- Firebase Realtime Database
- Firebase Admin SDK
- Pandas
- Scikit-learn
- CSV Processing



# Prediction Workflow

```text
Firebase Sensor Data
        ↓
Python Backend Processing
        ↓
ML Prediction
        ↓
Prediction Sent Back to Firebase
        ↓
Frontend Dashboard Display
```



# Project Structure

```text
Aqualytics/
│
├── firebase_predict.py
├── generate_data.py
├── prepare_data.py
├── predict.py
├── train_model.py
├── Train_new_model.py
├── water_data.csv
├── sensor_data.csv
├── model.pkl
├── requirements.txt
├── .gitignore
└── README.md
```



# Installation

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```



# Firebase Setup

1. Create Firebase Realtime Database
2. Generate Firebase Admin SDK key
3. Download the JSON credentials file
4. Add the file to the project directory

Example:

```text
serviceAccountKey.json
```



# Running the Module

## Generate Synthetic Dataset

```bash
python generate_data.py
```

## Train Initial Model

```bash
python train_model.py
```

## Test Prediction

```bash
python predict.py
```

## Prepare Real Sensor Dataset

```bash
python prepare_data.py
```

## Retrain Model with Real Data

```bash
python Train_new_model.py
```

## Start Real-Time Prediction System

```bash
python firebase_predict.py
```



# Current Status

### Completed
- Synthetic ML workflow
- Firebase integration
- Real-time prediction pipeline
- Model retraining workflow
- Backend prediction automation

### Currently Improving
- Prediction accuracy
- Real sensor dataset collection
- Model optimisation
- System reliability



# Future Improvements

- Advanced ML algorithms
- TinyML deployment
- Real-time alerts
- Prediction confidence analysis
- Historical data analytics
- Improved classification accuracy



# Author

Machine Learning & Backend Module  
Aqualytics Project
