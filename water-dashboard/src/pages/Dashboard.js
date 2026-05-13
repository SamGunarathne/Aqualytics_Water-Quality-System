import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Alerts from "../components/Alerts";
import WaterChart from "../components/WaterChart";

function Dashboard() {

  // ===============================
  // PAGE SWITCH
  // ===============================
  const [page, setPage] = useState("dashboard");

  // ===============================
  // THEME MODE
  // ===============================
  const [darkMode, setDarkMode] = useState(true);

  // ===============================
  // LIVE SENSOR DATA
  // ===============================
  const [data, setData] = useState({
    ph: 0,
    turbidity: 0,
    temperature: 0,
    tds: 0
  });

  // ===============================
  // CHART HISTORY
  // ===============================
  const [history, setHistory] = useState([]);

  const isFirstLoad = useRef(true);

  // ===============================
  // FIREBASE LIVE DATA
  // ===============================
  useEffect(() => {

    const waterRef = ref(db, "waterData");

    const unsubscribe = onValue(waterRef, (snapshot) => {

      const val = snapshot.val();

      if (!val) {
        console.log("⚠️ No Firebase Data");
        return;
      }

      const dataArray = Object.values(val);

      const latest = dataArray[dataArray.length - 1];

      console.log("🔥 LIVE UPDATE:", latest);

      setData({
        ph: Number(latest.ph ?? 0),
        turbidity: Number(latest.turbidity ?? 0),
        temperature: Number(latest.temperature ?? 0),
        tds: Number(latest.tds ?? 0)
      });

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      setHistory((prev) => {

        const newPoint = {
          time: new Date().toLocaleTimeString(),
          ph: Number(latest.ph ?? 0),
          turbidity: Number(latest.turbidity ?? 0),
          temperature: Number(latest.temperature ?? 0),
          tds: Number(latest.tds ?? 0)
        };

        const updated = [...prev, newPoint];

        return updated.slice(-10);

      });

    });

    return () => unsubscribe();

  }, []);

  // ===============================
  // DYNAMIC STYLES
  // ===============================

  const mainBackground = darkMode ? "#020817" : "#f1f5f9";

  const cardBackground = darkMode ? "#0f172a" : "#ffffff";

  const borderColor = darkMode
    ? "1px solid #1e293b"
    : "1px solid #cbd5e1";

  const textColor = darkMode ? "#cbd5e1" : "#334155";

  const titleColor = darkMode ? "#38bdf8" : "#0f172a";

  // ===============================
  // MAIN UI
  // ===============================

  return (

    <div
      style={{
        display: "flex",
        background: mainBackground,
        minHeight: "100vh",
        transition: "0.3s"
      }}
    >

      {/* ================= SIDEBAR ================= */}
      <Sidebar
        setPage={setPage}
        darkMode={darkMode}
      />

      {/* ================= MAIN CONTENT ================= */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowX: "hidden"
        }}
      >

        {/* ================= NAVBAR ================= */}
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        

        {/* ================================================= */}
        {/* ================= DASHBOARD PAGE ================= */}
        {/* ================================================= */}

        {page === "dashboard" && (
          <>

            {/* ================= SENSOR CARDS ================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "50px",
                marginTop: "20px",
                width: "97%"
              }}
            >

              {/* CARD 1 */}
              <div
                style={{
                  width: "100%",
                  minWidth: "0"
                }}
              >
                <Card
                  title="pH"
                  value={data.ph}
                  darkMode={darkMode}
                />
              </div>

              {/* CARD 2 */}
              <div
                style={{
                  width: "100%",
                  minWidth: "0"
                }}
              >
                <Card
                  title="Turbidity"
                  value={data.turbidity}
                  unit="NTU"
                  darkMode={darkMode}
                />
              </div>

              {/* CARD 3 */}
              <div
                style={{
                  width: "100%",
                  minWidth: "0"
                }}
              >
                <Card
                  title="Temperature"
                  value={data.temperature}
                  unit="°C"
                  darkMode={darkMode}
                />
              </div>

              {/* CARD 4 */}
              <div
                style={{
                  width: "100%",
                  minWidth: "0"
                }}
              >
                <Card
                  title="TDS"
                  value={data.tds}
                  unit="ppm"
                  darkMode={darkMode}
                />
              </div>

            </div>

            {/* ================= CHART + ALERTS ================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
                marginTop: "20px"
              }}
            >

              {/* ================= CHART ================= */}

              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "20px",
                  border: borderColor,
                  boxShadow: "0 0 20px rgba(56,189,248,0.08)",
                  transition: "0.3s"
                }}
              >
                <WaterChart history={history} />
              </div>

              {/* ================= ALERTS ================= */}

              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "20px",
                  border: borderColor,
                  boxShadow: "0 0 20px rgba(255,0,0,0.08)",
                  transition: "0.3s"
                }}
              >
                <Alerts data={data} darkMode={darkMode} />
              </div>

            </div>

          </>
        )}

        {/* ================================================= */}
        {/* ================= WATER DATA PAGE =============== */}
        {/* ================================================= */}

        {page === "water" && (

          <div style={{ marginTop: "20px" }}>

            <h1
              style={{
                color: titleColor,
                marginBottom: "20px"
              }}
            >
              💧 Water Data Information
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px"
              }}
            >

              {/* pH */}
              <div style={boxStyle(darkMode)}>
                <h2 style={titleStyle(darkMode)}>pH Level</h2>

                <p style={textStyle(darkMode)}>
                  Current Value: {data.ph}
                </p>

                <p style={textStyle(darkMode)}>
                  Safe Range: 6.5 - 8.5
                </p>

              </div>

              {/* Turbidity */}
              <div style={boxStyle(darkMode)}>
                <h2 style={titleStyle(darkMode)}>Turbidity</h2>

                <p style={textStyle(darkMode)}>
                  Current Value: {data.turbidity} NTU
                </p>

                <p style={textStyle(darkMode)}>
                  High turbidity means dirty water.
                </p>

              </div>

              {/* Temperature */}
              <div style={boxStyle(darkMode)}>
                <h2 style={titleStyle(darkMode)}>Temperature</h2>

                <p style={textStyle(darkMode)}>
                  Current Value: {data.temperature} °C
                </p>

                <p style={textStyle(darkMode)}>
                  Safe Temperature range : 10°C - 20°C
                </p>

              </div>

              {/* TDS */}
              <div style={boxStyle(darkMode)}>
                <h2 style={titleStyle(darkMode)}>TDS</h2>

                <p style={textStyle(darkMode)}>
                  Current Value: {data.tds} ppm
                </p>

                <p style={textStyle(darkMode)}>
                  Safe TDS range: 300ppm - 600ppm
                </p>

              </div>

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* ================= ALERT PAGE ==================== */}
        {/* ================================================= */}

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
              <Alerts data={data} />
            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* ================= SETTINGS PAGE ================= */}
        {/* ================================================= */}

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

// ===============================
// REUSABLE STYLES
// ===============================

const boxStyle = (darkMode) => ({
  background: darkMode ? "#0f172a" : "#ffffff",
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
  color: darkMode ? "#38bdf8" : "#0f172a",
  marginBottom: "15px"
});

const textStyle = (darkMode) => ({
  color: darkMode ? "#cbd5e1" : "#334155",
  marginBottom: "10px",
  fontSize: "15px"
});

export default Dashboard;