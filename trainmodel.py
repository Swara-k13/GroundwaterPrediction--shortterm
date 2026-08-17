import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
import json

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor  

# Create directories if they don't exist
os.makedirs("model", exist_ok=True)

# ================================
# 1. LOAD DATA
# ================================
df = pd.read_csv(
    "data/Varthur_Feature_Engineered.csv",
    encoding="latin1"
)

# ================================
# 2. CLEAN COLUMN NAMES
# ================================
df.columns = df.columns.str.strip().str.replace(" ", "_").str.replace(r"\(|\)", "", regex=True)

# ================================
# 3. PRE-PROCESSING & DATA TYPES
# ================================
df["Date"] = pd.to_datetime(df["Date"], errors='coerce')
df = df.dropna(subset=["Date"])
df = df.sort_values("Date")

cols_to_fix = df.columns.drop("Date")
df[cols_to_fix] = df[cols_to_fix].apply(pd.to_numeric, errors='coerce')

df = df.ffill().bfill()

# ================================
# 4. FEATURE ENGINEERING
# ================================
df["year"] = df["Date"].dt.year
df["month"] = df["Date"].dt.month
df["day"] = df["Date"].dt.day
df["day_of_week"] = df["Date"].dt.dayofweek

df = df.dropna()

# ================================
# 5. SPLIT DATA (TIME-SERIES AWARE)
# ================================
y = df["GW_Level_m"]

X = df[[
    "Rainfall_mm",
    "Avg_Temp_C",
    "Solar_Radiation_MJ_m2",
    "Root_Zone_Soil_Wetness",
    "Lag_1",
    "Lag_2",
    "Lag_3"
]]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# ================================
# 6. MODEL TRAINING
# ================================

# Random Forest
rf_model = RandomForestRegressor(
    n_estimators=300,
    max_depth=12,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)

# XGBoost
xgb_model = XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

xgb_model.fit(X_train, y_train)

# ================================
# 7. EVALUATION
# ================================

def evaluate(y_true, y_pred, name):

    r2 = r2_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))

    print(f"\n--- {name} Performance ---")
    print(f"R2 Score: {r2:.4f}")
    print(f"MAE:      {mae:.4f}")
    print(f"RMSE:     {rmse:.4f}")

    return r2, mae, rmse, y_pred

# Predictions
rf_r2, rf_mae, rf_rmse, rf_pred = evaluate(
    y_test,
    rf_model.predict(X_test),
    "Random Forest"
)

xgb_r2, xgb_mae, xgb_rmse, xgb_pred = evaluate(
    y_test,
    xgb_model.predict(X_test),
    "XGBoost"
)

# ================================
# 7.1 MODEL COMPARISON GRAPH
# ================================

labels = ["R²", "MAE", "RMSE"]

rf_values = [rf_r2, rf_mae, rf_rmse]
xgb_values = [xgb_r2, xgb_mae, xgb_rmse]

x = np.arange(len(labels))
width = 0.35

plt.figure(figsize=(8,5))

plt.bar(x - width/2, rf_values, width, label="Random Forest")
plt.bar(x + width/2, xgb_values, width, label="XGBoost")

plt.xticks(x, labels)

plt.ylabel("Score")

plt.title("Model Comparison: Random Forest vs XGBoost")

plt.legend()

plt.savefig("comparison_graph.png")

plt.show()

# ================================
# 8. SELECT BEST MODEL
# ================================

if xgb_r2 > rf_r2:
    best_model = xgb_model
    best_pred = xgb_pred
    best_name = "XGBoost"
else:
    best_model = rf_model
    best_pred = rf_pred
    best_name = "Random Forest"

print(f"\nBest Model Selected: {best_name}")

# ================================
# 9. ACTUAL VS PREDICTED GRAPH
# ================================

plt.figure(figsize=(10,5))

plt.plot(y_test.values, label="Actual", alpha=0.6)

plt.plot(
    best_pred,
    label=f"Predicted ({best_name})",
    linestyle='--'
)

plt.xlabel("Test Samples")

plt.ylabel("Groundwater Level")

plt.title("Actual vs Predicted Groundwater Levels")

plt.legend()

plt.savefig("actual_vs_predicted.png")

plt.show()

# ================================
# 10. FEATURE IMPORTANCE GRAPH
# ================================

importance = pd.Series(
    best_model.feature_importances_,
    index=X.columns
)

plt.figure(figsize=(8,5))

importance.sort_values().plot(
    kind='barh',
    title=f"{best_name} Feature Importance"
)

plt.xlabel("Importance Score")

plt.savefig("feature_importance.png")

plt.show()

# ================================
# 11. SAVE BEST MODEL
# ================================

with open("model/model.pkl", "wb") as f:
    pickle.dump(best_model, f)

print("\nModel saved successfully!")

# ================================
# 12. SAVE ANALYTICS DATA
# ================================

analytics_data = {
    "model_name": best_name,

    "model_performance": {
        "random_forest": {
            "r2": float(rf_r2),
            "mae": float(rf_mae),
            "rmse": float(rf_rmse)
        },
        "xgboost": {
            "r2": float(xgb_r2),
            "mae": float(xgb_mae),
            "rmse": float(xgb_rmse)
        }
    },

    "feature_importance": [
        {
            "feature": str(feature),
            "importance": float(value)
        }
        for feature, value in importance.items()
    ],

    "actual_vs_predicted": [
        {
            "index": int(i),
            "actual": float(actual),
            "predicted": float(predicted)
        }
        for i, (actual, predicted)
        in enumerate(zip(y_test.values, best_pred))
    ]
}

with open("model/analytics.json", "w") as f:
    json.dump(analytics_data, f, indent=4)

print("Analytics data saved successfully!")