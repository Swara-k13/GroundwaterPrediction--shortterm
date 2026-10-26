from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import numpy as np
import json
import pandas as pd
app = Flask(__name__)
CORS(app)

history = [-31.5, -31.6, -31.55]  # initial values
# Load model
model = pickle.load(open("model/model.pkl", "rb"))
# Load analytics information
with open("model/analytics.json", "r") as f:
    analytics = json.load(f)

# Home route → load UI
@app.route("/")
def home():
    return render_template("index.html")

# Prediction route

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body must contain JSON"}), 400

        required_fields = [
            "rainfall", "temperature", "soil", "radiation",
            "lag1", "lag2", "lag3"
        ]

        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                "error": f"Missing input fields: {', '.join(missing)}"
            }), 400

        # Read environmental inputs from the website
        rainfall = float(data["rainfall"])
        temperature = float(data["temperature"])
        soil = float(data["soil"])
        radiation = float(data["radiation"])

        # Read lag values entered by the user
        lag1 = float(data["lag1"])
        lag2 = float(data["lag2"])
        lag3 = float(data["lag3"])

        # Keep the same feature order used during training
        features = np.array([[
            rainfall,
            temperature,
            radiation,
            soil,
            lag1,
            lag2,
            lag3
        ]])

        prediction = float(model.predict(features)[0])

        # Classify the predicted level
        if prediction > -25:
            status = "High (Good Water Level)"
        elif prediction > -32:
            status = "Moderate"
        else:
            status = "Low (Deep Water Level)"

        return jsonify({
            "prediction": prediction,
            "status": status
        })

    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input values: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Seven-step recursive prediction route
@app.route("/predict7", methods=["POST"])
def predict7():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body must contain JSON"}), 400

        required_fields = [
            "rainfall", "temperature", "soil", "radiation",
            "lag1", "lag2", "lag3"
        ]

        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                "error": f"Missing input fields: {', '.join(missing)}"
            }), 400

        rainfall = float(data["rainfall"])
        temperature = float(data["temperature"])
        soil = float(data["soil"])
        radiation = float(data["radiation"])

        # Initialize forecast history from website inputs
        temp_history = [
            float(data["lag3"]),
            float(data["lag2"]),
            float(data["lag1"])
        ]

        predictions = []

        for _ in range(7):
            lag1 = temp_history[-1]
            lag2 = temp_history[-2]
            lag3 = temp_history[-3]

            features = np.array([[
                rainfall,
                temperature,
                radiation,
                soil,
                lag1,
                lag2,
                lag3
            ]])

            pred = float(model.predict(features)[0])
            predictions.append(pred)

            # Use this prediction as the newest lag for the next step
            temp_history.append(pred)

        return jsonify({"forecast": predictions})

    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input values: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# HISTORICAL DATA API
# ==========================================

@app.route("/api/historical-data", methods=["GET"])
def historical_data():

    try:

        # Load your actual dataset
        df = pd.read_csv(
            "data/Varthur_Feature_Engineered.csv",
            encoding="latin1"
        )

        # Clean column names exactly like trainmodel.py
        df.columns = (
            df.columns
            .str.strip()
            .str.replace(" ", "_")
            .str.replace(r"\(|\)", "", regex=True)
        )

        # Convert Date
        df["Date"] = pd.to_datetime(
            df["Date"],
            errors="coerce"
        )

        # Remove invalid dates
        df = df.dropna(subset=["Date"])

        # Sort by date
        df = df.sort_values("Date")

        # Select the columns we need for the graphs
        columns = [
            "Date",
            "GW_Level_m",
            "Rainfall_mm",
            "Avg_Temp_C",
            "Root_Zone_Soil_Wetness",
            "Solar_Radiation_MJ_m2"
        ]

        df = df[columns]

        # Rename columns for React
        df = df.rename(columns={
            "Date": "date",
            "GW_Level_m": "groundwater",
            "Rainfall_mm": "rainfall",
            "Avg_Temp_C": "temperature",
            "Root_Zone_Soil_Wetness": "soil",
            "Solar_Radiation_MJ_m2": "radiation"
        })

        # Convert NaN values to None
        df = df.where(pd.notnull(df), None)

        # Convert dataframe to JSON
        data = df.to_dict(orient="records")

        return jsonify(data)

    except Exception as e:

        print("Historical data error:", e)

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
