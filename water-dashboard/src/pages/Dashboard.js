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
        minHeight: "100vh",

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
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                window.innerWidth < 900
                  ? "1fr"
                  : "2fr 1fr",
                gap: "20px",
                marginTop: "20px"
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