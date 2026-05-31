import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";

import {ref,query,limitToLast,onValue} from "firebase/database";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Alerts from "../components/Alerts";
import WaterChart from "../components/WaterChart";

function Dashboard() {

  // =========================================
  // PAGE STATES
  // =========================================
  const [page, setPage] = useState("dashboard");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
    useEffect(() => {

      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      return () =>
        window.removeEventListener("resize", handleResize);

    }, []);

  // =========================================
  // THEME MODE
  // =========================================
  const [darkMode, setDarkMode] = useState(true);

  // =========================================
  // LIVE SENSOR DATA
  // =========================================
  const [data, setData] = useState({
    ph: 0,
    turbidity: 0,
    temperature: 0,
    tds: 0
  });

  // =========================================
  // CHART HISTORY
  // =========================================
    const [history, setHistory] = useState([]);

    const [prediction, setPrediction] = useState({
      predictedPH: 0,
      predictedTurbidity: 0,
      predictedTemperature: 0,
      predictedTDS: 0
    });

    const [anomalies, setAnomalies] = useState([]);

    const [aiAlert, setAiAlert] = useState("");
    const alertSound = useRef(null);

    useEffect(() => {

      alertSound.current = new Audio("/alert.mp3");

    }, []);

  // =========================================
  // FIREBASE REALTIME LISTENER
  // =========================================
  useEffect(() => {

    // ================= WATER DATA =================
    const waterRef = query(
      ref(db, "waterData"),
      limitToLast(10)
    );

    // ================= PREDICTION DATA =================
    const predictionRef = ref(db, "predictionData");

    // ================= ANOMALY DATA =================
    const anomalyRef = ref(db, "anomalyData");

    // =========================================
    // LIVE WATER DATA
    // =========================================
    const unsubscribeWater = onValue(
      waterRef,
      (snapshot) => {

        const val = snapshot.val();

        if (!val) return;

        const dataArray = Object.values(val);

        const latest =
          dataArray[dataArray.length - 1];

        const current = {
          ph: Number(latest.ph ?? 0),
          turbidity: Number(latest.turbidity ?? 0),
          temperature: Number(latest.temperature ?? 0),
          tds: Number(latest.tds ?? 0)
        };

        // LIVE SENSOR VALUES
        setData(current);

        // CHART HISTORY
        const formattedHistory = dataArray.map(
          (item, index) => ({
            id: index,

            ph: Number(item.ph ?? 0),

            turbidity: Number(
              item.turbidity ?? 0
            ),

            temperature: Number(
              item.temperature ?? 0
            ),

            tds: Number(item.tds ?? 0)
          })
        );

        setHistory(formattedHistory);

      }
    );

    // =========================================
    // ML PREDICTION
    // =========================================
    const unsubscribePrediction = onValue(
      predictionRef,
      (snapshot) => {

        const val = snapshot.val();

        if (!val) return;

        setPrediction({
          predictedPH:
            Number(val.predictedPH ?? 0),

          predictedTurbidity:
            Number(val.predictedTurbidity ?? 0),

          predictedTemperature:
            Number(
              val.predictedTemperature ?? 0
            ),

          predictedTDS:
            Number(val.predictedTDS ?? 0)
        });

      }
    );

    // =========================================
    // AI ANOMALY ENGINE
    // =========================================
    const unsubscribeAnomaly = onValue(
      anomalyRef,
      (snapshot) => {

        const val = snapshot.val();

        if (!val) return;

        const anomalyArray =
          Object.values(val);

        setAnomalies(anomalyArray);

        const latest =
          anomalyArray[
            anomalyArray.length - 1
          ];

        if (latest) {

          setAiAlert(
            latest.message || ""
          );

          // PLAY ALERT SOUND
          if (
            latest.severity === "HIGH"
          ) {

            if (alertSound.current) {

              alertSound.current.currentTime = 0;

              alertSound.current
                .play()
                .catch(() => {});
            }
          }
        }

      }
    );

    // =========================================
    // CLEANUP
    // =========================================
    return () => {

      unsubscribeWater();

      unsubscribePrediction();

      unsubscribeAnomaly();

    };

  }, []);

  
  // =========================================
  // MEMOIZED SENSOR HISTORIES
  // =========================================
  const sensorHistory = useMemo(() => ({
    ph: history.map((d) => d.ph),
    turbidity: history.map((d) => d.turbidity),
    temperature: history.map((d) => d.temperature),
    tds: history.map((d) => d.tds)
  }), [history]);

  // =========================================
  // THEME COLORS
  // =========================================
  const cardBackground = darkMode ? "#0f172a" : "#ffffff";

  const borderColor = darkMode
    ? "1px solid #1e293b"
    : "1px solid #cbd5e1";

  const titleColor = darkMode
    ? "#38bdf8"
    : "#0f172a";

  // =========================================
  // MAIN UI
  // =========================================
  return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: "url('/dashboard-bg.png') center/cover no-repeat"
      }}
    >

      {/* ================================= SIDEBAR */}
      <Sidebar
        setPage={setPage}
        setSelectedSensor={setSelectedSensor}
        darkMode={darkMode}
      />

      {/* ================================= MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowX: "auto",
          minWidth: 0
        }}
      >

        {/* ================================= NAVBAR */}
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* ================================= AI ALERT */}
        {aiAlert && (
          <div style={{
            background: "rgba(255,0,0,0.15)",
            border: "1px solid red",
            color: "red",
            padding: "15px",
            borderRadius: "12px",
            marginTop: "15px",
            boxShadow: "0 0 20px red"
          }}>
            🤖 {aiAlert}
          </div>
        )}

        {/* ====================================================== */}
        {/* ================= DASHBOARD PAGE ===================== */}
        {/* ====================================================== */}

        {page === "dashboard" && (
          <>

            {/* ================================= SENSOR CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "50px",
                marginTop: "20px",
                width: "97%"
              }}
            >

              {/* pH */}
              <Card
                title="pH"
                value={data.ph}
                darkMode={darkMode}
                history={sensorHistory.ph}
                onClick={() => {
                  setPage("water");
                  setSelectedSensor("ph");
                }}
              />

              {/* Turbidity */}
              <Card
                title="Turbidity"
                value={data.turbidity}
                unit="NTU"
                darkMode={darkMode}
                history={sensorHistory.turbidity}
                onClick={() => {
                  setPage("water");
                  setSelectedSensor("turbidity");
                }}
              />

              {/* Temperature */}
              <Card
                title="Temperature"
                value={data.temperature}
                unit="°C"
                darkMode={darkMode}
                history={sensorHistory.temperature}
                onClick={() => {
                  setPage("water");
                  setSelectedSensor("temperature");
                }}
              />

              {/* TDS */}
              <Card
                title="TDS"
                value={data.tds}
                unit="ppm"
                darkMode={darkMode}
                history={sensorHistory.tds}
                onClick={() => {
                  setPage("water");
                  setSelectedSensor("tds");
                }}
              />

            </div>

            {/* ================================= CHART + ALERTS */}
            {/* ================= ML PREDICTION PANEL ================= */}

              <div
                style={{
                  marginTop: "20px",
                  background: darkMode
                    ? "#0f172a"
                    : "#ffffff",

                  border: borderColor,

                  borderRadius: "20px",

                  padding: "25px",

                  boxShadow:
                    "0 0 20px rgba(168,85,247,0.15)"
                }}
              >

                <h2
                  style={{
                    color: "#a855f7",
                    marginBottom: "20px"
                  }}
                >
                  🔮 AI ML Forecast
                </h2>

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      screenWidth < 768
                        ? "1fr"
                        : "repeat(4, 1fr)",

                    gap: "20px"
                  }}
                >

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>
                      Predicted pH
                    </h3>

                    <p style={textStyle(darkMode)}>
                      {prediction.predictedPH}
                    </p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>
                      Predicted Turbidity
                    </h3>

                    <p style={textStyle(darkMode)}>
                      {prediction.predictedTurbidity}
                    </p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>
                      Predicted Temperature
                    </h3>

                    <p style={textStyle(darkMode)}>
                      {prediction.predictedTemperature} °C
                    </p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>
                      Predicted TDS
                    </h3>

                    <p style={textStyle(darkMode)}>
                      {prediction.predictedTDS} ppm
                    </p>
                  </div>

                </div>

              </div>

              {/* ================= AI ANOMALY PANEL ================= */}

              <div
                style={{
                  marginTop: "20px",

                  background:
                    "rgba(255,0,0,0.08)",

                  border:
                    "1px solid rgba(255,0,0,0.2)",

                  borderRadius: "20px",

                  padding: "25px"
                }}
              >

                <h2
                  style={{
                    color: "#ef4444",
                    marginBottom: "20px"
                  }}
                >
                  🚨 AI Anomaly Engine
                </h2>

                {anomalies.length === 0 ? (

                  <p style={textStyle(darkMode)}>
                    No anomalies detected
                  </p>

                ) : (

                  anomalies.map((item, index) => (

                    <div
                      key={index}

                      style={{
                        marginBottom: "15px",

                        padding: "15px",

                        borderRadius: "12px",

                        background:
                          item.severity === "HIGH"
                            ? "rgba(255,0,0,0.15)"
                            : "rgba(255,165,0,0.15)",

                        border:
                          item.severity === "HIGH"
                            ? "1px solid red"
                            : "1px solid orange"
                      }}
                    >

                      <h3
                        style={{
                          color:
                            item.severity === "HIGH"
                              ? "#ef4444"
                              : "#f59e0b"
                        }}
                      >
                        {item.severity}
                      </h3>

                      <p style={textStyle(darkMode)}>
                        {item.message}
                      </p>

                    </div>

                  ))
                )}

              </div>

              {/* ================================= CHART */}
              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "20px",
                  border: borderColor,

                  boxShadow: "0 0 20px rgba(56,189,248,0.08)",

                  width: "94%",
                  minWidth: 0,
                  overflow: "hidden"
                }}
              >
                <WaterChart history={history} />
              </div>

              {/* ================================= ALERTS */}
              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "20px",
                  border: borderColor,

                  boxShadow:
                    "0 0 20px rgba(255,0,0,0.08)"
                }}
              >
                <Alerts
                  data={data}
                  darkMode={darkMode}
                />
              </div>

            

          </>
        )}

        {/* ====================================================== */}
        {/* ================= WATER DATA PAGE ==================== */}
        {/* ====================================================== */}

        {page === "water" && (

          <div style={{ marginTop: "20px" }}>

            {/* BACK BUTTON */}
            <button
              onClick={() => {
                setPage("dashboard");
                setSelectedSensor("");
              }}
              style={{
                padding: "10px 16px",
                marginBottom: "15px",

                borderRadius: "10px",
                border: "none",
                cursor: "pointer",

                background:
                  darkMode ? "#38bdf8" : "#0284c7",

                color: "white",
                fontWeight: "bold"
              }}
            >
              Back
            </button>

            {/* TITLE */}
            <h1
              style={{
                color: titleColor,
                marginBottom: "20px"
              }}
            >
              💧 Water Data Information
            </h1>

            {/* SENSOR INFO GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",

                gap: "20px"
              }}
            >

              {/* pH */}
              {(selectedSensor === "" ||
                selectedSensor === "ph") && (

                <div style={boxStyle(darkMode)}>

                  <h2 style={titleStyle(darkMode)}>
                    pH Level
                  </h2>

                  <p style={textStyle(darkMode)}>
                    Current Value: {data.ph}
                  </p>

                  <p style={textStyle(darkMode)}>
                    Safe Range: 6.5 - 8.5
                  </p>

                </div>
              )}

              {/* Turbidity */}
              {(selectedSensor === "" ||
                selectedSensor === "turbidity") && (

                <div style={boxStyle(darkMode)}>

                  <h2 style={titleStyle(darkMode)}>
                    Turbidity
                  </h2>

                  <p style={textStyle(darkMode)}>
                    Current Value: {data.turbidity} NTU
                  </p>

                  <p style={textStyle(darkMode)}>
                    High turbidity means dirty water.
                  </p>

                </div>
              )}

              {/* Temperature */}
              {(selectedSensor === "" ||
                selectedSensor === "temperature") && (

                <div style={boxStyle(darkMode)}>

                  <h2 style={titleStyle(darkMode)}>
                    Temperature
                  </h2>

                  <p style={textStyle(darkMode)}>
                    Current Value:
                    {" "}
                    {data.temperature} °C
                  </p>

                  <p style={textStyle(darkMode)}>
                    Safe Range: 20°C - 30°C
                  </p>

                </div>
              )}

              {/* TDS */}
              {(selectedSensor === "" ||
                selectedSensor === "tds") && (

                <div style={boxStyle(darkMode)}>

                  <h2 style={titleStyle(darkMode)}>
                    TDS
                  </h2>

                  <p style={textStyle(darkMode)}>
                    Current Value:
                    {" "}
                    {data.tds} ppm
                  </p>

                  <p style={textStyle(darkMode)}>
                    Safe Range: 300ppm - 600ppm
                  </p>

                </div>
              )}

            </div>

          </div>

        )}

        {/* ====================================================== */}
        {/* ================= ALERT PAGE ========================= */}
        {/* ====================================================== */}

        {page === "alerts" && (

          <div style={{ marginTop: "20px" }}>

            <h1
              style={{
                color: "#f87171",
                marginBottom: "20px"
              }}
            >
              🚨 Alert Monitoring
            </h1>

            <div
              style={{
                background: cardBackground,
                padding: "25px",
                borderRadius: "20px",
                border: borderColor
              }}
            >
              <Alerts
                data={data}
                darkMode={darkMode}
              />
            </div>

          </div>

        )}

        {/* ====================================================== */}
        {/* ================= SETTINGS PAGE ====================== */}
        {/* ====================================================== */}

        {page === "settings" && (

          <div style={{ marginTop: "20px" }}>

            <h1
              style={{
                color: titleColor,
                marginBottom: "20px"
              }}
            >
              ⚙ System Settings
            </h1>

            <div
              style={{
                background: cardBackground,
                padding: "25px",
                borderRadius: "20px",
                border: borderColor
              }}
            >

              <p style={textStyle(darkMode)}>
                🔧 Device Configuration
              </p>

              <p style={textStyle(darkMode)}>
                📡 Sensor Calibration
              </p>

              <p style={textStyle(darkMode)}>
                🔔 Notification Settings
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

// ======================================================
// REUSABLE STYLES
// ======================================================

const boxStyle = (darkMode) => ({
  background: darkMode
    ? "#0f172a"
    : "#ffffff",

  padding: "25px",

  borderRadius: "20px",

  border: darkMode
    ? "1px solid #1e293b"
    : "1px solid #cbd5e1",

  boxShadow: darkMode
    ? "0 0 20px rgba(56,189,248,0.05)"
    : "0 0 20px rgba(0,0,0,0.05)"
});

const titleStyle = (darkMode) => ({
  color: darkMode
    ? "#38bdf8"
    : "#0f172a",

  marginBottom: "15px"
});

const textStyle = (darkMode) => ({
  color: darkMode
    ? "#cbd5e1"
    : "#334155",

  marginBottom: "10px",
  fontSize: "15px"
});

export default Dashboard;