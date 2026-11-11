
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import Chatbot from "./components/Chatbot";
import "./App.css";

function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span>GroundPulse</span>
        </div>

        <div className="nav-links">

          <a href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("about");
            }}>
            About
          </a>

          <a href="#technology"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("technology");
            }}>
            Technology
          </a>

          <a href="#impact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("impact");
            }}>
            Why It Matters
          </a>

          <button
  className="analytics-button"
  onClick={() => navigate("/analytics")}
>
  Analytics
</button>

        </div>
      </nav>


      {/* HERO SECTION */}
      <main className="hero">

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

          <h2>AI-Powered Groundwater Forecasting</h2>

          <p className="description">
            Predict short-term groundwater level changes using rainfall,
            climate conditions, soil moisture, solar radiation, and
            historical groundwater trends.
          </p>

          <div className="info-grid">

            <div className="info-card">
              <div className="info-icon">📍</div>
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
              <div className="info-icon">📊</div>
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

              <div className="live-status">
                <span></span>
                SYSTEM READY
              </div>
            </div>

            <p className="card-label">GROUNDWATER FORECAST</p>

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

            <button
              className="predict-button"
              onClick={() => navigate("/predict")}
            >
              Start Prediction <span>→</span>
            </button>

            <div className="model-status">
              <span className="green-dot"></span>
              Machine Learning Model Active
            </div>

          </div>
        </section>
      </main>


      {/* BOTTOM INFORMATION */}
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


      {/* ABOUT SECTION */}
      <section id="about" className="content-section about-section">

        <div className="section-tag">01 — ABOUT THE PROJECT</div>

        <h2>
          Understanding groundwater.
          <br />
          <span>Predicting tomorrow.</span>
        </h2>

        <p className="section-description">
          GroundPulse is a machine learning-based groundwater
          forecasting system designed to predict short-term changes
          in groundwater levels. It combines historical groundwater
          measurements with rainfall and environmental parameters
          to identify patterns and generate data-driven predictions.
        </p>

        <div className="about-grid">

          <div className="about-card">
            <span>📍</span>
            <h3>Study Location</h3>
            <p>
              Varthur, Bengaluru — an urban region where
              understanding groundwater fluctuations is important.
            </p>
          </div>

          <div className="about-card">
            <span>🎯</span>
            <h3>Project Objective</h3>
            <p>
              Forecast groundwater level variations using
              historical and environmental data.
            </p>
          </div>

          <div className="about-card">
            <span>📈</span>
            <h3>Our Approach</h3>
            <p>
              Apply machine learning regression models to
              understand environmental patterns and predict
              groundwater trends.
            </p>
          </div>

        </div>

      </section>


      {/* TECHNOLOGY SECTION */}
      <section id="technology" className="content-section technology-section">

        <div className="section-tag">02 — TECHNOLOGY STACK</div>

        <h2>
          Data meets intelligence.
          <br />
          <span>Powered by technology.</span>
        </h2>

        <p className="section-description">
          A combination of data processing, machine learning,
          and web technologies powers the GroundPulse platform.
        </p>
        
<div className="tech-grid">

  <div className="tech-card">
    <h3>Python</h3>
    <p>
      Core programming language for data processing
      and model development.
    </p>
  </div>

  <div className="tech-card">
    <h3>Pandas & NumPy</h3>
    <p>
      Data cleaning, preprocessing, aggregation,
      and numerical operations.
    </p>
  </div>

  <div className="tech-card">
    <h3>Random Forest</h3>
    <p>
      Ensemble learning algorithm used for
      groundwater level prediction.
    </p>
  </div>

  <div className="tech-card">
    <h3>XGBoost</h3>
    <p>
      Gradient boosting algorithm used to improve
      prediction performance.
    </p>
  </div>

  <div className="tech-card">
    <h3>Scikit-learn</h3>
    <p>
      Machine learning model development,
      training, and evaluation.
    </p>
  </div>

  <div className="tech-card">
    <h3>Flask & React</h3>
    <p>
      Backend integration and interactive frontend
      for groundwater forecasting.
    </p>
  </div>

</div>
        <div className="data-box">
          <h3>Environmental Data Sources</h3>

          <div className="data-items">
            <div>
              <strong>Rainfall Data</strong>
              <p>Precipitation patterns and variations</p>
            </div>

            <div>
              <strong>Climate Data</strong>
              <p>Temperature and solar radiation</p>
            </div>

            <div>
              <strong>Soil Moisture</strong>
              <p>Soil moisture conditions</p>
            </div>

            <div>
              <strong>Groundwater Data</strong>
              <p>Historical groundwater level measurements</p>
            </div>
          </div>
        </div>

      </section>


      {/* IMPACT SECTION */}
      <section id="impact" className="content-section impact-section">

        <div className="section-tag">03 — WHY IT MATTERS</div>

        <h2>
          Every drop counts.
          <br />
          <span>Every prediction matters.</span>
        </h2>

        <p className="section-description">
          Groundwater is a vital natural resource, supporting
          households, agriculture, and ecosystems. Predicting
          groundwater fluctuations can help communities better
          understand water availability and prepare for potential
          shortages.
        </p>

        <div className="impact-grid">

          <div className="impact-card">
            <span>💧</span>
            <h3>Water Conservation</h3>
            <p>
              Encourages awareness of groundwater conditions
              and responsible water usage.
            </p>
          </div>

          <div className="impact-card">
            <span>🌱</span>
            <h3>Sustainable Planning</h3>
            <p>
              Supports informed decisions regarding water
              resource management.
            </p>
          </div>

          <div className="impact-card">
            <span>🔍</span>
            <h3>Early Insights</h3>
            <p>
              Provides short-term forecasts that can help
              identify potential groundwater level changes.
            </p>
          </div>

        </div>

        <div className="impact-cta">
          <h3>Ready to explore groundwater predictions?</h3>
          <p>Turn environmental data into meaningful insights.</p>

          <button
            className="predict-button"
            onClick={() => navigate("/predict")}
          >
            Explore Prediction <span>→</span>
          </button>
        </div>

      </section>


      {/* FOOTER */}
      <footer className="footer">
        <div className="logo">
           GroundPulse
        </div>

        <p>
          AI-Powered Groundwater Forecasting | Varthur, Bengaluru
        </p>

        <span>Predict. Understand. Protect.</span>
      </footer>

    </div>
  );
}


/* ROUTES */

function App() {
  return (
    <BrowserRouter>
        <Chatbot />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/predict" element={<Prediction />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
