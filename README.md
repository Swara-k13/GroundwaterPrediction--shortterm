# 🌊 GroundPulse
### Machine Learning-Based Short-Term Groundwater Level Prediction

GroundPulse is a machine learning-based groundwater forecasting application designed to predict short-term groundwater level changes in **Varthur, Bengaluru, Karnataka, India**.

The system combines historical groundwater measurements with environmental and weather-related parameters, including rainfall, temperature, soil moisture, and solar radiation, to generate groundwater level predictions and provide insights into historical trends.

GroundPulse integrates machine learning models with a Flask backend and a React-based frontend to make groundwater forecasting accessible through an interactive web application.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Machine Learning Approach](#-machine-learning-approach)
- [Input Parameters](#-input-parameters)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#️-installation-and-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Model Evaluation](#-model-evaluation)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🌍 Overview

Groundwater is an essential natural resource for domestic consumption, agriculture, and urban development. Continuous monitoring and prediction of groundwater levels can help identify fluctuations, understand environmental patterns, and support sustainable water resource management.

GroundPulse uses historical groundwater observations and environmental variables to estimate short-term groundwater level changes. The application combines machine learning, data processing, and interactive visualizations to present predictions and historical analytics through a user-friendly interface.

**Study Area:** Varthur, Bengaluru, Karnataka, India

**Forecasting Goal:** Short-term groundwater level prediction

---

## ✨ Features

- **Groundwater Level Prediction:** Generate short-term groundwater predictions using trained machine learning models.
- **Environmental Parameter Integration:** Incorporate rainfall, average temperature, soil moisture, and solar radiation.
- **Historical Groundwater Analysis:** Utilize previous groundwater observations as lagged input features.
- **Interactive Prediction Interface:** Enter environmental and historical parameters through a React-based interface.
- **Analytics Dashboard:** Explore historical groundwater trends and environmental data through visualizations.
- **Historical Data Visualization:** Display groundwater and related environmental patterns to support data-driven analysis.
- **About and Information Sections:** Present project details, underlying technology, and the importance of groundwater forecasting.
- **Full-Stack Integration:** Connect the React frontend with a Flask REST API.
- **Model Reusability:** Load previously trained machine learning models for prediction without retraining on every request.

---

## 🤖 Machine Learning Approach

GroundPulse uses supervised machine learning techniques for short-term groundwater level forecasting.

### Models Used

**1. Random Forest Regressor**

Random Forest is an ensemble learning algorithm that combines predictions from multiple decision trees. It improves prediction stability and helps capture nonlinear relationships between environmental parameters and groundwater levels.

**2. XGBoost Regressor**

XGBoost is a gradient-boosting algorithm that builds decision trees sequentially, with each successive tree attempting to reduce the errors of the previous trees. It provides efficient learning and strong predictive performance.

The trained model is serialized and loaded by the Flask backend during application execution.

### Input Features

The prediction pipeline uses environmental and historical groundwater features, including:

- Rainfall
- Average temperature
- Soil moisture
- Solar radiation
- Previous groundwater level (Lag 1)
- Groundwater level two days earlier (Lag 2)
- Groundwater level three days earlier (Lag 3)

The feature order and preprocessing applied during prediction must remain consistent with the training pipeline.

---

## 📊 Input Parameters

| Parameter | Description |
|---|---|
| Rainfall (mm) | Rainfall measurement or forecast |
| Temperature (°C) | Average temperature |
| Soil Moisture | Soil moisture measurement |
| Solar Radiation | Solar radiation measurement |
| Lag 1 (m) | Groundwater level from the previous day |
| Lag 2 (m) | Groundwater level from two days earlier |
| Lag 3 (m) | Groundwater level from three days earlier |

**Note:** Input units, scaling, and preprocessing must be consistent with the original training dataset.

---

## 🛠️ Technology Stack

### Machine Learning and Backend

- Python
- Flask
- Flask-CORS
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Pickle for model serialization

### Frontend

- React.js
- JavaScript
- CSS
- Vite
- Recharts (for data visualization, if used in the implementation)

### Development and Deployment

- Git and GitHub
- Node.js and npm
- Render (backend deployment)

---

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
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── pages/
│   │       ├── Prediction.jsx
│   │       └── Analytics.jsx
│   └── public/
│
└── README.md
```

*The structure above represents the main project components. Additional files and folders may be present in the repository.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the application:

- Python 3.10 or a compatible version
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Swara-k13/GroundwaterPrediction--shortterm.git
cd GroundwaterPrediction--shortterm
```

### 2. Set Up the Python Environment

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

---

## 🚀 Running the Application

GroundPulse consists of a Flask backend and a React frontend. Both must be running for the complete application to function locally.

### 1. Start the Flask Backend

Open a terminal in the project root directory and execute:

```bash
python app.py
```

The backend will start using the host and port configured in the Flask application.

For the default Flask development configuration, the backend is commonly available at:

```text
http://127.0.0.1:5000
```

### 2. Start the React Frontend

Open a separate terminal:

```bash
cd frontend
npm run dev
```

Open the local development URL displayed in the terminal. For a default Vite configuration, this is commonly:

```text
http://localhost:5173
```

Ensure that the frontend API configuration points to the correct Flask backend URL.

---

## 🔌 API Endpoints

The Flask backend provides REST API endpoints for communication between the React frontend and the machine learning model.

### Historical Data

```http
GET /api/historical-data
```

This endpoint provides historical groundwater and environmental data for displaying analytics in the frontend.

The prediction endpoint, HTTP method, request parameters, and response structure should be documented according to the implementation in `app.py`.

---

## 📈 Model Evaluation

The performance of the machine learning models is evaluated using standard regression metrics.

- **R² Score (Coefficient of Determination):** Measures how well the model explains the variation in groundwater levels.
- **Mean Absolute Error (MAE):** Measures the average absolute difference between actual and predicted values.
- **Root Mean Squared Error (RMSE):** Measures prediction error while assigning greater weight to larger errors.

### Model Performance

The following are the previously recorded evaluation results:

| Model | R² Score | MAE | RMSE |
|---|---:|---:|---:|
| Random Forest | 0.9689 | 0.0630 | 0.0969 |
| XGBoost | 0.9783 | 0.0504 | 0.0811 |

Based on these recorded results, XGBoost achieved a higher R² score and lower MAE and RMSE compared with Random Forest.

*Note: These metrics should be verified against the final training and testing results. MAE and RMSE units depend on the target variable and any transformations applied during preprocessing.*

---

## 🚀 Future Enhancements

- Integrate regularly updated weather observations and forecasts.
- Expand the forecasting system to additional groundwater monitoring locations.
- Incorporate uncertainty estimates and prediction intervals.
- Improve model validation using time-based train-test splits.
- Implement automated model retraining and performance monitoring.
- Introduce groundwater trend alerts and notifications.
- Enhance the analytics dashboard with additional historical and predictive visualizations.
- Explore advanced machine learning and deep learning techniques for improved forecasting.

---

## 👩‍💻 Author

**Swara Kulkarni**

Information Science and Engineering

GitHub: [Swara-k13](https://github.com/Swara-k13)

---

⭐ If you find this project interesting, consider giving the repository a star!
