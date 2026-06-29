import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";

import {
  ref,
  query,
  limitToLast,
  onValue
} from "firebase/database";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Alerts from "../components/Alerts";
import WaterChart from "../components/WaterChart";
import Login from "../components/Login";

function Dashboard() {
    const calculatePrediction = (history) => {
    if (history.length < 3) return null;

    const last3 = history.slice(-3);

    const avg = (key) =>
      last3.reduce((sum, item) => sum + item[key], 0) / 3;

    return {
      ph: avg("ph"),
      turbidity: avg("turbidity"),
      temperature: avg("temperature"),
      tds: avg("tds")
    };
  };
    const detectAnomalies = (history) => {
    if (history.length < 5) return [];

    const keys = ["ph", "turbidity", "temperature", "tds"];

    let results = [];

    keys.forEach((key) => {
      const values = history.map((d) => d[key]);

      const mean =
        values.reduce((a, b) => a + b, 0) / values.length;

      const std = Math.sqrt(
        values.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) /
        values.length
      );

      const latest = history[history.length - 1];

      const z = Math.abs((latest[key] - mean) / std);

      if (z > 2) {
        results.push({
          sensor: key,
          value: latest[key],
          severity: z > 3 ? "HIGH" : "MEDIUM",
          score: z.toFixed(2)
        });
      }
    });
    
    return results;
  };
  


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
  const alertCount = useMemo(() => {
    let count = 0;

    if (data.ph < 6.5 || data.ph > 8.5) count++;
    if (data.turbidity > 5) count++;
    if (data.tds > 500) count++;
    if (data.temperature < 20 || data.temperature > 30) count++;

    return count;
  }, [data]);

  // =========================================
  // CHART HISTORY
  // =========================================
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState({
    ph: 0,
    turbidity: 0,
    temperature: 0,
    tds: 0
  });

  const [anomalies, setAnomalies] = useState([]);

  // =========================================
  // FIREBASE REALTIME LISTENER
  // =========================================
  useEffect(() => {

    // ✅ ONLY GET LAST 10 RECORDS
    const waterRef = query(
      ref(db, "waterData"),
      limitToLast(10)
    );

    // ✅ REALTIME LISTENER
    const unsubscribe = onValue(waterRef, (snapshot) => {

      const val = snapshot.val();

      if (!val) {
        console.log("⚠ No Firebase Data");
        return;
      }

      // ✅ CONVERT OBJECT → ARRAY
      const dataArray = Object.values(val);

      // ✅ GET LATEST DATA
      const latest = dataArray[dataArray.length - 1];

      // =========================================
      // UPDATE LIVE SENSOR DATA
      // =========================================
      setData({
        ph: Number(latest.ph ?? 0),
        turbidity: Number(latest.turbidity ?? 0),
        temperature: Number(latest.temperature ?? 0),
        tds: Number(latest.tds ?? 0)
      });

      // =========================================
      // UPDATE HISTORY
      // =========================================
      const formattedHistory = dataArray.map((item, index) => ({
        id: index,
        time: new Date().toLocaleTimeString(),

        ph: Number(item.ph ?? 0),
        turbidity: Number(item.turbidity ?? 0),
        temperature: Number(item.temperature ?? 0),
        tds: Number(item.tds ?? 0)
      }));

      setHistory(formattedHistory);
      const pred = calculatePrediction(formattedHistory);
      setPrediction(pred || {
        ph: 0,
        turbidity: 0,
        temperature: 0,
        tds: 0
      });

      setAnomalies(detectAnomalies(formattedHistory));

    });

    // ✅ CLEANUP
    return () => unsubscribe();

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

    
      <div
        style={{
          display: "flex",
          width: "100vw",
          minHeight: "100vh",
          overflowX: "hidden",
          backgroundImage: "url('/dashboard-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
      


      {/* ================================= SIDEBAR */}
      <Sidebar
        setPage={setPage}
        setSelectedSensor={setSelectedSensor}
        darkMode={darkMode}
      />

      {/* ================================= MAIN CONTENT */}
      <div style={{
        flex: 1,
        minWidth: 0,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "20px"
      }}>
              

        {/* ================================= NAVBAR */}
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setPage={setPage}
          alertCount={alertCount}
        />

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
                gap: "20px",
                marginTop: "20px",
                width: "100%"
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  screenWidth < 900
                    ? "1fr"
                    : "2fr 1fr",

                gap: "20px",
                marginTop: "20px",
                alignItems: "start"
              }}
            >

              {/* ================================= CHART */}
              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "20px",
                  border: borderColor,

                  boxShadow: "0 0 20px rgba(56,189,248,0.08)",

                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                  overflow: "hidden"
                }}
              >
                <WaterChart history={history} />
              </div>
              {/* ================================= PREDICTION CARD */}
              <div style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "20px",
                background: cardBackground,
                border: borderColor
              }}>
                <h2 style={{ color: "#a855f7", marginBottom: "15px" }}>
                  🔮 Prediction (Next Values)
                </h2>

                <div style={{
                  display: "grid",
                  gridTemplateColumns:
                  screenWidth < 768
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                }}>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>pH</h3>
                    <p style={textStyle(darkMode)}>{prediction.ph.toFixed(2)}</p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>Turbidity</h3>
                    <p style={textStyle(darkMode)}>{prediction.turbidity.toFixed(2)}</p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>Temperature</h3>
                    <p style={textStyle(darkMode)}>{prediction.temperature.toFixed(2)} °C</p>
                  </div>

                  <div style={boxStyle(darkMode)}>
                    <h3 style={titleStyle(darkMode)}>TDS</h3>
                    <p style={textStyle(darkMode)}>{prediction.tds.toFixed(2)} ppm</p>
                  </div>

                </div>
              </div>
              {/* ================================= ANOMALY CARD */}
              <div style={{
                height: "100%",
                boxSizing: "border-box",
                padding: "20px",
                borderRadius: "20px",
                background: "rgba(255,0,0,0.08)",
                border: "1px solid rgba(255,0,0,0.2)"
              }}>
                <h2 style={{ color: "#ef4444", marginBottom: "15px" }}>
                  🚨 Anomaly Detection
                </h2>

                {anomalies.length === 0 ? (
                  <p style={textStyle(darkMode)}>No anomalies detected</p>
                ) : (
                  anomalies.map((a, i) => (
                    <div key={i} style={{
                      padding: "15px",
                      marginBottom: "10px",
                      borderRadius: "12px",
                      background:
                        a.severity === "HIGH"
                          ? "rgba(255,0,0,0.15)"
                          : "rgba(255,165,0,0.15)",
                      border:
                        a.severity === "HIGH"
                          ? "1px solid red"
                          : "1px solid orange"
                    }}>

                      <h3 style={{
                        color: a.severity === "HIGH" ? "red" : "orange"
                      }}>
                        {a.sensor.toUpperCase()} - {a.severity}
                      </h3>

                      <p style={textStyle(darkMode)}>
                        Value: {a.value} | Score: {a.score}
                      </p>

                    </div>
                  ))
                )}
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

                  <p style={textStyle(darkMode)}>
                    💧 What is pH Level in Water?
                  </p>
                  <p style={textStyle(darkMode)}>
                    pH level is a measurement that indicates how acidic or alkaline water is. It is measured on a scale from 0 to 14, where pH 7 represents neutral (pure water), values below 7 indicate acidic water, and values above 7 indicate alkaline or basic water.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🚰 Safe Drinking Water Range
                  </p>
                  <p style={textStyle(darkMode)}>
                    For safe drinking purposes, the ideal pH range of water is between 6.5 and 8.5. Water within this range is generally safe for human consumption. If the pH is below 6.5, the water is too acidic and may cause corrosion in pipes and potential health concerns. If the pH is above 8.5, the water becomes too alkaline, which may affect taste and lead to mineral buildup.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🌊 Why pH is Important?
                  </p>
                  <p style={textStyle(darkMode)}>
                    The pH level is important because it helps determine overall water quality and safety. It ensures that the water is suitable for drinking, prevents damage to pipes and equipment, and helps protect human health by maintaining a balanced and safe water condition.
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

                  <p style={textStyle(darkMode)}>
                    💧 What is Turbidity in Water?
                  </p>
                  <p style={textStyle(darkMode)}>
                    Turbidity refers to the cloudiness or clarity of water caused by suspended particles such as dirt, silt, algae, and organic matter. It is a key indicator of water cleanliness and quality.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🚰 Ideal Turbidity Range
                  </p>
                  <p style={textStyle(darkMode)}>
                    For safe drinking water, the ideal turbidity level should be below 1 NTU (Nephelometric Turbidity Unit), indicating excellent water clarity and quality. A turbidity level between 1 and 5 NTU is generally considered acceptable, although the water may appear slightly cloudy. Water with turbidity above 5 NTU is considered poor quality and may be unsafe for drinking, as it can contain suspended particles that reduce water clarity and may carry harmful microorganisms or contaminants.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🌊 Why Turbidity is Important?
                  </p>
                  <p style={textStyle(darkMode)}>
                      Turbidity affects how clear and safe water is. High turbidity can hide harmful microorganisms, reduce disinfection effectiveness, and affect taste and appearance, so low turbidity is essential for safe human drinking water.
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
                  <p style={textStyle(darkMode)}>
                    🌡️ What is Water Temperature?
                  </p>
                  <p style={textStyle(darkMode)}>
                    Water temperature refers to how hot or cold water is, and it is an important factor in determining water quality and comfort for human use. It is usually measured in degrees Celsius (°C), where moderate temperatures are considered most suitable for drinking water.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🚰 Ideal Water Temperature Range
                  </p>
                  <p style={textStyle(darkMode)}>
                    For human consumption, the ideal water temperature is generally between 10°C and 20°C. Water within this range is refreshing, safe, and comfortable to drink. Very hot water may be unsafe and unpleasant, while very cold water may cause discomfort for some people.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🌊 Why Water Temperature is Important?
                  </p>
                  <p style={textStyle(darkMode)}>
                    Water temperature affects taste, safety, and usability. It helps ensure comfortable drinking conditions, prevents rapid bacterial growth, and supports overall water quality monitoring for human health.
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
                  <p style={textStyle(darkMode)}>
                    💧 What is TDS (Total Dissolved Solids)?
                  </p>
                  <p style={textStyle(darkMode)}>
                    TDS refers to the total amount of dissolved substances such as minerals, salts, and organic matter present in water. It is an important indicator of water purity and taste.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🚰 Ideal TDS Range
                  </p>
                  <p style={textStyle(darkMode)}>
                    For drinking water, the ideal TDS (Total Dissolved Solids) level is generally categorized as below 300 mg/L for excellent quality water, 300–600 mg/L for good quality, 600–900 mg/L for acceptable quality, and above 900 mg/L is considered poor quality, as higher TDS levels may affect taste, indicate excessive dissolved minerals or possible contamination, and reduce overall water quality and safety for human consumption.
                  </p>
                  <p style={textStyle(darkMode)}>
                    🌊 Why TDS is Important?
                  </p>
                  <p style={textStyle(darkMode)}>
                    TDS helps determine water taste and safety. High TDS may indicate contamination or heavy mineral content, while balanced TDS ensures safe, good-tasting, and healthy drinking water.
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