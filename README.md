# AquaForecast 🌊
### Machine Learning-Based Short-Term Groundwater Level Prediction

AquaForecast is a machine learning-based groundwater forecasting application designed to predict short-term groundwater level changes in **Varthur, Bengaluru, Karnataka, India**. The system combines historical groundwater measurements with weather and environmental parameters to generate predictions and provide insights into groundwater trends.

The project integrates a machine learning model with a Flask backend and a React frontend to make groundwater forecasting accessible through an interactive web application.

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Machine Learning Approach](#-machine-learning-approach)
- [Input Parameters](#-input-parameters)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Running the Application](#-running-the-application)
- [API Endpoint](#-api-endpoint)
- [Model Evaluation](#-model-evaluation)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

## 🌍 Overview

Groundwater is an essential resource for domestic consumption, agriculture, and urban development. Predicting groundwater level fluctuations can help identify trends and support better water resource management.

AquaForecast uses historical groundwater levels and environmental variables to estimate future groundwater conditions. It combines machine learning, data processing, and an interactive dashboard to present predictions and historical analytics.

**Study Area:** Varthur, Bengaluru, Karnataka, India

**Forecasting Goal:** Short-term groundwater level prediction

## ✨ Features

- **Groundwater Prediction:** Generate groundwater level predictions using a trained machine learning model.
- **Weather-Based Inputs:** Incorporate rainfall, temperature, soil moisture, and solar radiation.
- **Historical Groundwater Trends:** Use previous groundwater observations as lagged input features.
- **Interactive Dashboard:** Access predictions and project analytics through a React-based interface.
- **Historical Data Visualization:** Explore groundwater and environmental data through charts.
- **Analytics Support:** Display historical trends and model-related analytical information.
- **Full-Stack Integration:** Connect the React frontend with a Flask REST API.
- **Model Reusability:** Load a previously trained model for inference without retraining it on every request.

## 🤖 Machine Learning Approach

The project uses supervised machine learning for short-term groundwater level forecasting.

### Models

- **Random Forest Regressor:** An ensemble learning algorithm that combines predictions from multiple decision trees.
- **XGBoost Regressor:** A gradient-boosting algorithm that builds decision trees sequentially to improve predictive performance.

The trained model is saved as a serialized file and loaded by the Flask backend when the application starts.

### Input Features

The prediction pipeline uses environmental and historical groundwater features, including:

- Rainfall
- Average temperature
- Soil moisture
- Solar radiation
- Previous groundwater level (Lag 1)
- Groundwater level two days earlier (Lag 2)
- Groundwater level three days earlier (Lag 3)

The exact feature order and preprocessing must match those used during model training.

## 📊 Input Parameters

| Parameter | Description |
|---|---|
| Rainfall (mm) | Rainfall measurement or forecast |
| Temperature (°C) | Average temperature |
| Soil Moisture | Root-zone soil moisture value |
| Solar Radiation | Solar radiation measurement |
| Lag 1 (m) | Groundwater level from the previous day |
| Lag 2 (m) | Groundwater level from two days earlier |
| Lag 3 (m) | Groundwater level from three days earlier |

**Note:** Input units, soil-moisture scaling, and solar-radiation units must be consistent with the training dataset and model preprocessing.

## 🛠️ Technology Stack

### Machine Learning and Backend
- Python
- Flask
- Flask-CORS
- NumPy
- Pandas
- Scikit-learn
- XGBoost
- Pickle for model serialization

### Frontend
- React.js
- JavaScript
- CSS
- Vite, if used in the existing frontend configuration
- Recharts, if used for dashboard visualizations

### Development and Deployment
- Git and GitHub
- Render for backend deployment
- Node.js and npm for frontend development

## 📁 Project Structure

```text
GroundwaterPrediction--shortterm/
│
├── app.py
├── trainmodel.py
├── requirements.txt
│
├── data/
│   └── Varthur_Feature_Engineered.csv
│
├── model/
│   ├── model.pkl
│   └── analytics.json
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   └── App.jsx
│   └── public/
│
└── README.md
```

*This is a representative structure. Adjust filenames and paths to match the files actually present in your repository.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.10 or another Python version compatible with your ML dependencies
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Swara-k13/GroundwaterPrediction--shortterm.git
cd GroundwaterPrediction--shortterm
```

### 2. Set up the Python environment

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Start the Flask backend

From the directory containing `app.py`, run:

```bash
python app.py
```

The backend will start on the host and port configured in the Flask application.

If the backend uses Flask's default development configuration, it is commonly available at:

```text
http://127.0.0.1:5000
```

### 4. Start the React frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

```text
http://localhost:5173
```

Ensure the frontend API configuration points to the running Flask backend.

## 🔌 API Endpoint

The Flask backend exposes API routes for communication between the frontend and backend.

The project includes a historical-data endpoint:

```http
GET /api/historical-data
```

This endpoint is intended to provide historical data for frontend analytics.

The exact prediction endpoint, HTTP method, request schema, and response format should be documented according to the implementation in `app.py`.

## 📈 Model Evaluation

Model performance should be evaluated using appropriate regression metrics:

- **R² Score:** Measures how well the model explains variation in groundwater levels.
- **Mean Absolute Error (MAE):** Measures average absolute prediction error.
- **Root Mean Squared Error (RMSE):** Penalizes larger prediction errors more heavily.

For reference, previously recorded evaluation results for the project were:

| Model | R² Score | MAE | RMSE |
|---|---:|---:|---:|
| Random Forest | 0.9689 | 0.0630 | 0.0969 |
| XGBoost | 0.9783 | 0.0504 | 0.0811 |

These results should be verified against the final training and test evaluation before being treated as the current model's performance. The units of MAE and RMSE depend on the target variable and any transformations applied to it.

## 🚀 Future Enhancements

- Integrate reliable, regularly updated weather observations and forecasts.
- Expand the forecasting system to additional groundwater monitoring locations.
- Add uncertainty estimates and prediction intervals.
- Improve model validation using time-based train-test splits.
- Add automated model retraining and monitoring.
- Provide groundwater trend alerts and actionable water-management insights.
- Improve the dashboard with additional historical and predictive visualizations.

## 👩‍💻 Author

**Swara Kulkarni**

Information Science and Engineering

GitHub: [Swara-k13](https://github.com/Swara-k13)
