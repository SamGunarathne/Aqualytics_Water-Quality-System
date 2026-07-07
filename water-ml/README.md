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



## Phase 2 - Real Sensor Data Integration & Dual-Layer Safety

After the IoT module completed Firebase integration, live sensor readings became available. The system was upgraded with deep data sanitization, fault tolerance, and a stateful anomaly tracking layer.

### Steps Completed
1. Read live sensor data dynamically from Firebase
2. Parse inputs with strict data type conversion and safety checks
3. Track rolling states to detect sudden environmental changes
4. Retrain the model using rule-backed real sensor logs
5. Run a separate analytical verification to measure model metrics

### Files Used

| File | Purpose |
|---|---|
| `prepare_data.py` | Extracts Firebase sensor data into CSV format |
| `sensor_data.csv` | Dataset generated from real sensor readings |
| `train_new_model.py`| Retrains model with updated feature synchronization |
| `evaluate_model.py` | Runs 80/20 train/test evaluation metrics |
| `firebase_predict.py` | Core engine managing real-time ML + anomaly tracking |




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

Firebase Sensor Data
        ↓
Python Backend Processing (Type Checking & State Tracking)
        ↓
Dual-Layer Analytics (ML Classification + Heuristic Anomaly Flags)
        ↓
Prediction & Anomaly Data Pushed to Firebase
        ↓
Frontend Dashboard Display & Alert UI




# Project Structure

Aqualytics/
│
├── firebase_predict.py
├── generate_data.py
├── prepare_data.py
├── predict.py
├── evaluate_model.py
├── train_model.py
├── train_new_modell.py
├── water_data.csv
├── sensor_data.csv
├── model.pkl
├── requirements.txt
└── README.md




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

## Evaluate Performance Metrics

```bash
python evaluate_model.py
```

## Start Real-Time Prediction System

```bash
python firebase_predict.py
```



# Current Status

### Completed
- Synthetic ML workflow prototyping
- Live Firebase integration and telemetry stream ingestion
- Input validation, type checking, and fallback crash handler routing
- Dual-layer safety: Scikit-learn Decision Tree classification paired with heuristic checks
- Real-time anomaly alerts (Sudden spikes, threshold caps, specific event reason tracking)
- Model validation tracking script setup


# Future Scope / Long-Term Development

- Expanding the rules baseline into human-labeled feedback streams
- Tuning hyperparameters for advanced forest classifiers



# Author

Machine Learning & Backend Module  
Aqualytics Project
