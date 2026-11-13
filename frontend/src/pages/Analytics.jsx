
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import GroundwaterChart from "../components/GroundwaterChart";
import EnvironmentalInsights from "../components/EnvironmentalInsights.jsx";
import FeatureVariation from "../components/FeatureVariation";
import "../App.css";

function Analytics() {
  const navigate = useNavigate();

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Fetch historical groundwater data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/historical-data"
        );

        console.log("Historical data:", response.data);
        console.log(
          "Available columns:",
          Object.keys(response.data[0] || {})
        );
        console.log("First record:", response.data[0]);

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

  // Download Analytics PDF
  const downloadAnalyticsReport = async () => {
    try {
      setDownloadingReport(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/api/download-analytics-report",
        {},
        {
          responseType: "blob"
        }
      );

      const pdfBlob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "GroundPulse_Analytics_Report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Analytics PDF error:", err);

      alert(
        "Unable to download Analytics PDF. Please check whether Flask is running and the report route is configured."
      );

    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div className="analytics-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
          <span>GroundPulse</span>
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

          {/* ANALYTICS PDF DOWNLOAD BUTTON */}

          <button
            className="analytics-download-btn"
            onClick={downloadAnalyticsReport}
            disabled={downloadingReport}
          >
            {downloadingReport
              ? "Generating Report..."
              : "Download Analytics PDF"}
          </button>

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

        {/* ================= FEATURE VARIATION ================= */}

        {!loading &&
          !error &&
          historicalData.length > 0 && (

            <section className="analytics-card large">

              <FeatureVariation
                data={historicalData}
              />

            </section>

          )}

        {/* ================= ENVIRONMENTAL INSIGHTS ================= */}

        {!loading &&
          !error &&
          historicalData.length > 0 && (

            <EnvironmentalInsights
              data={historicalData}
            />

          )}

      </main>

    </div>
  );
}

export default Analytics;
