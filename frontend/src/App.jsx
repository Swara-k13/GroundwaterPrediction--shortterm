import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import "./App.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">💧</span>
          <span>AquaForecast</span>
        </div>

        <div className="nav-links">

  <a href="#about">
    About
  </a>

  <a href="#technology">
    Technology
  </a>

  <a href="#impact">
    Why It Matters
  </a>

  <button
    onClick={() => navigate("/analytics")}
  >
    Analytics
  </button>

</div>
      </nav>


      {/* Hero Section */}
      <main className="hero">

        {/* LEFT SIDE */}
        <section className="hero-left">

          <div className="badge">
            <span className="status-dot"></span>
            AI-POWERED WATER INTELLIGENCE
          </div>

          <h1>
            Predict.
            <br />
            <span>Understand.</span>
            <br />
            Protect.
          </h1>

          <h2>
            AI-Powered Groundwater Forecasting
          </h2>

          <p className="description">
            Predict short-term groundwater level changes using rainfall,
            climate conditions, soil moisture, solar radiation, and
            historical groundwater trends.
          </p>


          {/* Information Cards */}
          <div className="info-grid">

            <div className="info-card">
              <div className="info-icon"></div>

              <div>
                <span>Study Area</span>
                <strong>Varthur, Bengaluru</strong>
              </div>
            </div>


            <div className="info-card">
              <div className="info-icon">🤖</div>

              <div>
                <span>ML Model</span>
                <strong>XGBoost Regression</strong>
              </div>
            </div>


            <div className="info-card">
              <div className="info-icon"></div>

              <div>
                <span>Forecast</span>
                <strong>Short-Term Prediction</strong>
              </div>
            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}
        <section className="hero-right">

          <div className="prediction-card">

            <div className="card-top">

              <div className="water-icon">
                
              </div>

              <div className="live-status">
                <span></span>
                SYSTEM READY
              </div>

            </div>


            <p className="card-label">
              GROUNDWATER FORECAST
            </p>


            <h3>
              Predict the future
              <br />
              of groundwater.
            </h3>


            <p className="card-description">
              Generate a data-driven 7-day groundwater forecast
              based on environmental conditions.
            </p>


            <div className="location-box">

              <div>
                <span>LOCATION</span>
                <strong>Varthur, Bengaluru</strong>
              </div>

              <div>
                <span>FORECAST</span>
                <strong>7 Days</strong>
              </div>

            </div>


            {/* PREDICTION BUTTON */}
            <button
              className="predict-button"
              onClick={() => navigate("/predict")}
            >
              Start Prediction
              <span>→</span>
            </button>


            <div className="model-status">
              <span className="green-dot"></span>
              Machine Learning Model Active
            </div>

          </div>

        </section>

      </main>


      {/* Bottom Information */}
      <section className="bottom-section">

        <div className="bottom-item">
          <span>01</span>

          <div>
            <h4>Climate Data</h4>
            <p>Rainfall & environmental conditions</p>
          </div>
        </div>


        <div className="bottom-item">
          <span>02</span>

          <div>
            <h4>Machine Learning</h4>
            <p>XGBoost-based prediction</p>
          </div>
        </div>


        <div className="bottom-item">
          <span>03</span>

          <div>
            <h4>Forecast</h4>
            <p>Short-term groundwater insights</p>
          </div>
        </div>

      </section>

    </div>
  );
}


/* ==============================
   ROUTES
============================== */

function App() {
  return (
    <BrowserRouter>

     <Routes>

  <Route 
    path="/" 
    element={<Landing />} 
  />

  <Route 
    path="/predict" 
    element={<Prediction />} 
  />

  <Route 
    path="/analytics" 
    element={<Analytics />} 
  />

</Routes>

    </BrowserRouter>
  );
}


export default App;