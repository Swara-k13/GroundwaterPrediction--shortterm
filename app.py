from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import numpy as np
import json
import pandas as pd
import os
from dotenv import load_dotenv
from groq import Groq
import traceback
load_dotenv()
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


# ==========================================
# GROUNDPULSE AI CHATBOT - GROQ API
# ==========================================

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        # Check API key
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            return jsonify({
                "error": "GROQ_API_KEY is missing. Check your .env file."
            }), 500

        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid request body"}), 400

        messages = data.get("messages", [])
        context = data.get("context", "")

        if not isinstance(messages, list) or not messages:
            return jsonify({
                "error": "Please provide a valid messages list."
            }), 400

        # Accept only user and assistant messages
        safe_messages = []

        for msg in messages[-10:]:
            if not isinstance(msg, dict):
                continue

            role = msg.get("role")
            content = msg.get("content")

            if role in ["user", "assistant"] and isinstance(content, str):
                safe_messages.append({
                    "role": role,
                    "content": content[:4000]
                })

        if not safe_messages:
            return jsonify({"error": "No valid messages provided."}), 400

        # Convert context to text if React sends an object
        if isinstance(context, (dict, list)):
            context = json.dumps(context)

        context = str(context)[:12000]

        system_prompt = f"""
        You are GroundPulse Assistant, an AI assistant for
        the GroundPulse groundwater forecasting application.

        Your location of focus is Varthur, Bengaluru, Karnataka.

        Your responsibilities:
        1. Explain groundwater levels and groundwater trends.
        2. Explain the role of rainfall in groundwater recharge.
        3. Explain temperature, soil moisture and solar radiation.
        4. Help users understand historical environmental data.
        5. Explain the predictions generated by GroundPulse.

        Use simple language and concise explanations.
        Be scientifically accurate.

        IMPORTANT:
        - Use the supplied dataset context when answering
          questions about actual measurements.
        - Do not invent numerical values or predictions.
        - If the context does not contain the requested
          information, clearly say so.
        - Distinguish general scientific explanations
          from observations in the dataset.

        Dataset context:
        {context}
        """

        # Connect to Groq
        groq_client = Groq(api_key=api_key)

        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                *safe_messages
            ],
            temperature=0.5,
            max_completion_tokens=700
        )

        reply = completion.choices[0].message.content

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print("\n========== GROQ CHATBOT ERROR ==========")
        traceback.print_exc()
        print("========================================\n")
        return jsonify({
             "error": str(e)
               }), 500


if __name__ == "__main__":
    app.run(debug=True)
