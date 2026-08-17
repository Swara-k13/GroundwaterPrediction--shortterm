import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import GroundwaterChart from "../components/GroundwaterChart";

import "../App.css";

function Analytics() {
  const navigate = useNavigate();

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/historical-data"
        );

        console.log("Historical data:", response.data);

        setHistoricalData(response.data);
      } catch (err) {
        console.error("Analytics error:", err);

        setError(
          "Unable to load groundwater data. Please make sure Flask is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <div className="analytics-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">💧</span>
          <span>AquaForecast</span>
        </div>

        <div className="analytics-nav">

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/predict")}>
            Predict
          </button>

        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="analytics-container">

        {/* HEADER */}

        <section className="analytics-header">

          <div className="badge">
            <span className="status-dot"></span>
            DATA & MODEL INSIGHTS
          </div>

          <h1>
            Groundwater
            <br />
            <span>Analytics</span>
          </h1>

          <p>
            Explore groundwater trends and environmental
            conditions for Varthur, Bengaluru.
          </p>

        </section>


        {/* ================= GRAPH CARD ================= */}

        <section className="analytics-card large">

          <div className="analytics-card-header">

            <div>
              <span className="chart-label">
                HISTORICAL TREND
              </span>

              <h2>
                Groundwater Level Over Time
              </h2>
            </div>

            <span className="chart-unit">
              metres
            </span>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="chart-loading">
              Loading groundwater data...
            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="chart-error">
              ⚠️ {error}
            </div>
          )}


          {/* GRAPH */}

          {!loading &&
            !error &&
            historicalData.length > 0 && (
              <GroundwaterChart
                data={historicalData}
              />
            )}


          {/* NO DATA */}

          {!loading &&
            !error &&
            historicalData.length === 0 && (
              <div className="chart-error">
                No groundwater data available.
              </div>
            )}

        </section>


        {/* ================= DATA SUMMARY ================= */}

        {!loading &&
          !error &&
          historicalData.length > 0 && (

            <div className="data-info">

              <div>
                <span>DATA POINTS</span>

                <strong>
                  {historicalData.length}
                </strong>
              </div>

              <div>
                <span>LOCATION</span>

                <strong>
                  Varthur, Bengaluru
                </strong>
              </div>

              <div>
                <span>VARIABLE</span>

                <strong>
                  Groundwater Level
                </strong>
              </div>

            </div>

          )}

      </main>

    </div>
  );
}

export default Analytics;