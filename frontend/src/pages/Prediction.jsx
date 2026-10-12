import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Prediction() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rainfall: "",
    temperature: "",
    soil: "",
    radiation: "",

    // Previous groundwater observations
    lag1: "",
    lag2: "",
    lag3: "",
  });

  // Single prediction
  const [prediction, setPrediction] = useState(null);
  const [status, setStatus] = useState("");

  // 7-day forecast
  const [forecast, setForecast] = useState([]);

  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------
  // Handle input
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------
  // Validate inputs
  // -----------------------------
  const getInputData = () => {
    return {
      rainfall: Number(formData.rainfall),
      temperature: Number(formData.temperature),
      soil: Number(formData.soil),
      radiation: Number(formData.radiation),

      // Actual previous groundwater levels
      lag1: Number(formData.lag1),
      lag2: Number(formData.lag2),
      lag3: Number(formData.lag3),
    };
  };

  // -----------------------------
  // SINGLE PREDICTION
  // /predict
  // -----------------------------
  const handlePrediction = async () => {
    setError("");
    setPrediction(null);
    setStatus("");
    setLoadingPrediction(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        getInputData()
      );

      setPrediction(response.data.prediction);
      setStatus(response.data.status);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate prediction. Make sure Flask is running."
      );
    } finally {
      setLoadingPrediction(false);
    }
  };

  // -----------------------------
  // 7-DAY FORECAST
  // /predict7
  // -----------------------------
  const handleForecast = async () => {
    setError("");
    setForecast([]);
    setLoadingForecast(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict7",
        getInputData()
      );

      setForecast(response.data.forecast);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate 7-day forecast. Make sure Flask is running."
      );
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="prediction-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">💧</span>
          <span>AquaForecast</span>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

      </nav>


      {/* =========================
          MAIN
      ========================= */}

      <main className="prediction-container">

        {/* Header */}

        <div className="prediction-header">

          <div className="badge">
            <span className="status-dot"></span>
            GROUNDWATER FORECAST
          </div>

          <h1>
            Predict Groundwater
            <br />
            <span>Levels</span>
          </h1>

          <p>
            Enter the environmental conditions and the observed
            groundwater levels from the previous three days to
            generate predictions for Varthur, Bengaluru.
          </p>

        </div>


        {/* =========================
            FORM CARD
        ========================= */}

        <div className="prediction-form-card">

          <div className="form-header">

            <div>
              <h2>Environmental Conditions</h2>

              <p>
                Provide the current environmental data.
              </p>
            </div>

            <div className="location-tag">
              📍 Varthur
            </div>

          </div>


          {/* =========================
              ENVIRONMENTAL INPUTS
          ========================= */}

          <div className="form-grid">

            {/* Rainfall */}

            <div className="form-group">

              <label>
                Rainfall <span>(mm)</span>
              </label>

              <input
                type="number"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
                placeholder="e.g. 25.5"
                step="0.1"
              />

              <small>
                Expected rainfall
              </small>

            </div>


            {/* Temperature */}

            <div className="form-group">

              <label>
                Temperature <span>(°C)</span>
              </label>

              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="e.g. 26.4"
                step="0.1"
              />

              <small>
                Average temperature
              </small>

            </div>


            {/* Soil */}

            <div className="form-group">

              <label>
                Soil Moisture
              </label>

              <input
                type="number"
                name="soil"
                value={formData.soil}
                onChange={handleChange}
                placeholder="e.g. 0.31"
                step="0.01"
              />

              <small>
                Root-zone soil wetness
              </small>

            </div>


            {/* Radiation */}

            <div className="form-group">

              <label>
                Solar Radiation
              </label>

              <input
                type="number"
                name="radiation"
                value={formData.radiation}
                onChange={handleChange}
                placeholder="e.g. 18.5"
                step="0.1"
              />

              <small>
                Solar radiation value
              </small>

            </div>

          </div>


          {/* =========================
              PREVIOUS GROUNDWATER LEVELS
          ========================= */}

          <div className="form-header" style={{ marginTop: "30px" }}>

            <div>
              <h2>Previous Groundwater Levels</h2>

              <p>
                Enter the observed groundwater levels from the
                previous three days.
              </p>
            </div>

          </div>


          <div className="form-grid">

            {/* Lag 1 */}

            <div className="form-group">

              <label>
                Previous Day <span>(Lag 1, m)</span>
              </label>

              <input
                type="number"
                name="lag1"
                value={formData.lag1}
                onChange={handleChange}
                placeholder="e.g. -31.42"
                step="0.01"
              />

              <small>
                Groundwater level on the previous day
              </small>

            </div>


            {/* Lag 2 */}

            <div className="form-group">

              <label>
                2 Days Ago <span>(Lag 2, m)</span>
              </label>

              <input
                type="number"
                name="lag2"
                value={formData.lag2}
                onChange={handleChange}
                placeholder="e.g. -31.50"
                step="0.01"
              />

              <small>
                Groundwater level two days ago
              </small>

            </div>


            {/* Lag 3 */}

            <div className="form-group">

              <label>
                3 Days Ago <span>(Lag 3, m)</span>
              </label>

              <input
                type="number"
                name="lag3"
                value={formData.lag3}
                onChange={handleChange}
                placeholder="e.g. -31.60"
                step="0.01"
              />

              <small>
                Groundwater level three days ago
              </small>

            </div>

          </div>


          {/* =========================
              TWO PREDICTION OPTIONS
          ========================= */}

          <div className="prediction-options">

            {/* SINGLE PREDICTION */}

            <div className="prediction-option">

              <div className="option-icon">
                🎯
              </div>

              <div className="option-content">

                <h3>
                  Groundwater Prediction
                </h3>

                <p>
                  Predict the groundwater level based on
                  environmental conditions and recent
                  groundwater observations.
                </p>

              </div>

              <button
                className="predict-single-button"
                onClick={handlePrediction}
                disabled={loadingPrediction}
              >
                {loadingPrediction
                  ? "Predicting..."
                  : "Predict Now →"}
              </button>

            </div>


            {/* 7 DAY FORECAST */}

            <div className="prediction-option">

              <div className="option-icon">
                📊
              </div>

              <div className="option-content">

                <h3>
                  7-Day Forecast
                </h3>

                <p>
                  Generate groundwater predictions for
                  the next seven days using recent observed
                  groundwater levels.
                </p>

              </div>

              <button
                className="predict-7-button"
                onClick={handleForecast}
                disabled={loadingForecast}
              >
                {loadingForecast
                  ? "Forecasting..."
                  : "7-Day Forecast →"}
              </button>

            </div>

          </div>


          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}


          {/* =========================
              SINGLE PREDICTION RESULT
          ========================= */}

          {prediction !== null && (

            <div className="single-result">

              <div className="result-label">
                PREDICTION RESULT
              </div>

              <h2>
                Groundwater Level
              </h2>

              <div className="prediction-value">
                {prediction.toFixed(2)}
                <span> m</span>
              </div>

              <div className="status-badge">
                {status}
              </div>

            </div>

          )}


          {/* =========================
              7 DAY RESULT
          ========================= */}

          {forecast.length > 0 && (

            <div className="forecast-results">

              <div className="results-header">

                <div>

                  <span className="results-label">
                    FORECAST RESULT
                  </span>

                  <h2>
                    7-Day Groundwater Forecast
                  </h2>

                </div>

                <div className="results-location">
                  📍 Varthur
                </div>

              </div>


              {/* Seven values */}

              <div className="forecast-grid">

                {forecast.map((value, index) => (

                  <div
                    className="forecast-day"
                    key={index}
                  >

                    <span>
                      DAY {index + 1}
                    </span>

                    <strong>
                      {value.toFixed(2)}
                    </strong>

                    <small>
                      m
                    </small>

                  </div>

                ))}

              </div>


              {/* Chart */}

              <div className="forecast-chart">

                <div className="chart-title">
                  Predicted Groundwater Trend
                </div>

                <div className="chart-bars">

                  {forecast.map((value, index) => {

                    const min = Math.min(...forecast);
                    const max = Math.max(...forecast);

                    const range = max - min || 1;

                    const height =
                      30 +
                      ((value - min) / range) * 70;

                    return (

                      <div
                        className="chart-column"
                        key={index}
                      >

                        <div
                          className="chart-bar"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${value.toFixed(2)} m`}
                        />

                        <span>
                          D{index + 1}
                        </span>

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Prediction;