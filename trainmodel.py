from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import numpy as np
import json
import pandas as pd

app = Flask(__name__)
CORS(app)


# ==========================================
# LOAD MODEL
# ==========================================

model = pickle.load(open("model/model.pkl", "rb"))


# ==========================================
# LOAD ANALYTICS INFORMATION
# ==========================================

with open("model/analytics.json", "r") as f:
    analytics = json.load(f)


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# SINGLE-DAY PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        # ----------------------------------
        # Current-day environmental inputs
        # ----------------------------------

        rainfall = float(data["rainfall"])
        temperature = float(data["temperature"])
        soil = float(data["soil"])
        radiation = float(data["radiation"])

        # ----------------------------------
        # Actual groundwater observations
        # from previous three days
        # ----------------------------------

        lag1 = float(data["lag1"])
        lag2 = float(data["lag2"])
        lag3 = float(data["lag3"])

        # ----------------------------------
        # Create feature vector
        #
        # IMPORTANT:
        # Order must be identical to training
        #
        # Rainfall
        # Avg_Temp
        # Solar Radiation
        # Soil Wetness
        # Lag 1
        # Lag 2
        # Lag 3
        # ----------------------------------

        features = np.array([
            rainfall,
            temperature,
            radiation,
            soil,
            lag1,
            lag2,
            lag3
        ]).reshape(1, -1)

        # ----------------------------------
        # Prediction
        # ----------------------------------

        prediction = model.predict(features)[0]

        prediction = float(prediction)

        # ----------------------------------
        # Status classification
        # ----------------------------------

        if prediction > -25:

            status = "High (Good Water Level)"

        elif prediction > -32:

            status = "Moderate"

        else:

            status = "Low (Deep Water Level)"

        # ----------------------------------
        # Return prediction
        # ----------------------------------

        return jsonify({

            "prediction": prediction,

            "status": status,

            "input_lags": {
                "lag1": lag1,
                "lag2": lag2,
                "lag3": lag3
            }

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400


# ==========================================
# SEVEN-DAY FORECAST
# ==========================================

@app.route("/predict7", methods=["POST"])
def predict7():

    try:

        data = request.json

        # ----------------------------------
        # Environmental inputs
        # ----------------------------------

        rainfall = float(data["rainfall"])
        temperature = float(data["temperature"])
        radiation = float(data["radiation"])
        soil = float(data["soil"])

        # ----------------------------------
        # Actual previous groundwater levels
        # ----------------------------------

        lag1 = float(data["lag1"])
        lag2 = float(data["lag2"])
        lag3 = float(data["lag3"])

        # ----------------------------------
        # Temporary history
        #
        # We DO NOT modify the original
        # observations supplied by the user.
        # ----------------------------------

        temp_history = [lag3, lag2, lag1]

        predictions = []

        # ----------------------------------
        # Recursive 7-day forecasting
        # ----------------------------------

        for i in range(7):

            current_lag1 = temp_history[-1]
            current_lag2 = temp_history[-2]
            current_lag3 = temp_history[-3]

            features = np.array([

                rainfall,
                temperature,
                radiation,
                soil,

                current_lag1,
                current_lag2,
                current_lag3

            ]).reshape(1, -1)

            pred = model.predict(features)[0]

            pred = float(pred)

            predictions.append(pred)

            # ----------------------------------
            # Use prediction as next lag value
            # ----------------------------------

            temp_history.append(pred)

        # ----------------------------------
        # Return forecast
        # ----------------------------------

        return jsonify({

            "forecast": predictions,

            "initial_lags": {
                "lag1": lag1,
                "lag2": lag2,
                "lag3": lag3
            }

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400


# ==========================================
# HISTORICAL DATA API
# ==========================================

@app.route("/api/historical-data", methods=["GET"])
def historical_data():

    try:

        # ----------------------------------
        # Load actual dataset
        # ----------------------------------

        df = pd.read_csv(
            "data/Varthur_Feature_Engineered.csv",
            encoding="latin1"
        )

        # ----------------------------------
        # Clean column names
        # Same preprocessing as training
        # ----------------------------------

        df.columns = (
            df.columns
            .str.strip()
            .str.replace(" ", "_")
            .str.replace(r"\(|\)", "", regex=True)
        )

        # ----------------------------------
        # Convert Date
        # ----------------------------------

        df["Date"] = pd.to_datetime(
            df["Date"],
            errors="coerce"
        )

        df = df.dropna(subset=["Date"])

        df = df.sort_values("Date")

        # ----------------------------------
        # Select required columns
        # ----------------------------------

        columns = [

            "Date",
            "GW_Level_m",
            "Rainfall_mm",
            "Avg_Temp_C",
            "Root_Zone_Soil_Wetness",
            "Solar_Radiation_MJ_m2"

        ]

        df = df[columns]

        # ----------------------------------
        # Rename for frontend
        # ----------------------------------

        df = df.rename(columns={

            "Date": "date",

            "GW_Level_m": "groundwater",

            "Rainfall_mm": "rainfall",

            "Avg_Temp_C": "temperature",

            "Root_Zone_Soil_Wetness": "soil",

            "Solar_Radiation_MJ_m2": "radiation"

        })

        # ----------------------------------
        # Convert NaN → None
        # ----------------------------------

        df = df.where(
            pd.notnull(df),
            None
        )

        # ----------------------------------
        # Convert to JSON
        # ----------------------------------

        data = df.to_dict(
            orient="records"
        )

        return jsonify(data)

    except Exception as e:

        print(
            "Historical data error:",
            e
        )

        return jsonify({

            "error": str(e)

        }), 500


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )