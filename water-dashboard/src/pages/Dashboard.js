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

      // object → array
      const dataArray = Object.values(val);

      // latest value
      const latest = dataArray[dataArray.length - 1];

      console.log("🔥 LIVE UPDATE:", latest);

      // update cards
      setData({
        ph: Number(latest.ph ?? 0),
        turbidity: Number(latest.turbidity ?? 0),
        temperature: Number(latest.temperature ?? 0),
        tds: Number(latest.tds ?? 0)
      });

      // skip first load
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      // update chart
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
  // MAIN UI
  // ===============================
  return (

    <div
      style={{
        display: "flex",
        background: "#020817",
        minHeight: "100vh"
      }}
    >

      {/* ================= SIDEBAR ================= */}
      <Sidebar setPage={setPage} />

      {/* ================= MAIN CONTENT ================= */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowX: "hidden"
        }}
      >

        {/* ================= NAVBAR ================= */}
        <Navbar />

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
                  background: "#0f172a",
                  borderRadius: "20px",
                  padding: "20px",
                  border: "1px solid #1e293b",
                  boxShadow: "0 0 20px rgba(56,189,248,0.08)"
                }}
              >
                <WaterChart history={history} />
              </div>

              {/* ================= ALERTS ================= */}

              <div
                style={{
                  background: "#0f172a",
                  borderRadius: "20px",
                  padding: "20px",
                  border: "1px solid #1e293b",
                  boxShadow: "0 0 20px rgba(255,0,0,0.08)"
                }}
              >
                <Alerts data={data} />
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
                color: "#38bdf8",
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
              <div style={boxStyle}>
                <h2 style={titleStyle}>pH Level</h2>

                <p style={textStyle}>
                  Current Value: {data.ph}
                </p>

                <p style={textStyle}>
                  Safe Range: 6.5 - 8.5
                </p>
                <p style={textStyle}>
                  💧 pH level in water is a measurement that shows how acidic or alkaline the water is, using a scale from 0 to 14 where 7 is neutral (pure water), values below 7 are acidic, and values above 7 are alkaline; for safe drinking water, the ideal pH range is 6.5 to 8.5 because water within this range is generally safe for health, while water below 6.5 may be too acidic and cause pipe corrosion and possible health issues, and water above 8.5 may be too alkaline affecting taste and causing mineral buildup, making pH an important factor in monitoring water quality, ensuring safety, and protecting both human health and water systems.</p>
              </div>

              {/* Turbidity */}
              <div style={boxStyle}>
                <h2 style={titleStyle}>Turbidity</h2>

                <p style={textStyle}>
                  Current Value: {data.turbidity} NTU
                </p>

                <p style={textStyle}>
                  High turbidity means dirty water.
                </p>
                <p style={textStyle}>
                  💧Ideal Turbidity Level for Human Use is generally below 1 NTU (Nephelometric Turbidity Unit) for drinking water, as this indicates very clear water that is safe, clean, and suitable for human consumption; water with low turbidity means it contains very few suspended particles and is less likely to carry harmful microorganisms, while turbidity above 5 NTU is usually considered unsafe or poor quality because it can reduce disinfection effectiveness, affect taste and appearance, and indicate possible contamination, so maintaining low turbidity is essential for ensuring safe, healthy, and good-quality drinking water for humans.
                </p>
              </div>

              {/* Temperature */}
              <div style={boxStyle}>
                <h2 style={titleStyle}>Temperature</h2>

                <p style={textStyle}>
                  Current Value: {data.temperature} °C
                </p>
                <p style={textStyle}>
                  Safe Temperature range : 10°C - 20°C
                </p>
                <p style={textStyle}>
                  🌡️Ideal Water Temperature for Human Use is generally between 10°C and 20°C, as this range is considered most suitable for drinking and daily use because it provides a refreshing taste, is comfortable for the human body, and does not promote rapid bacterial growth; water that is too hot may be unsafe or unpleasant to drink, while very cold water can cause discomfort for some people, so maintaining a moderate temperature ensures better hydration, improved safety, and overall healthier water consumption for humans.
                </p>
              </div>

              {/* TDS */}
              <div style={boxStyle}>
                <h2 style={titleStyle}>TDS</h2>

                <p style={textStyle}>
                  Current Value: {data.tds} ppm
                </p>
                <p style={textStyle}>
                  Safe TDS range: 300ppm - 600ppm
                </p>
                <p style={textStyle}>
                  💧Total Dissolved Solids (TDS) in water refers to the total amount of dissolved substances such as minerals, salts, and organic matter present in water, and it is an important indicator of water quality because it directly affects taste and safety; for human consumption, the ideal TDS level is generally below 300 mg/L (excellent) to 300–600 mg/L (good), while up to 900 mg/L is still acceptable in some cases, but higher levels may make the water taste salty or bitter and could indicate poor quality or contamination, so monitoring TDS helps ensure the water is healthy, safe, and suitable for drinking and daily human use.
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
                background: "#0f172a",
                padding: "25px",
                borderRadius: "20px",
                border: "1px solid #7f1d1d"
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
                color: "#38bdf8",
                marginBottom: "20px"
              }}
            >
              ⚙ System Settings
            </h1>

            <div
              style={{
                background: "#0f172a",
                padding: "25px",
                borderRadius: "20px",
                border: "1px solid #1e293b"
              }}
            >

              <p style={settingText}>
                🔧 Device Configuration
              </p>

              <p style={settingText}>
                📡 Sensor Calibration
              </p>

              <p style={settingText}>
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

const boxStyle = {
  background: "#0f172a",
  padding: "25px",
  borderRadius: "20px",
  border: "1px solid #1e293b",
  boxShadow: "0 0 20px rgba(56,189,248,0.05)"
};

const titleStyle = {
  color: "#38bdf8",
  marginBottom: "15px"
};

const textStyle = {
  color: "#cbd5e1",
  marginBottom: "10px",
  fontSize: "15px"
};

const settingText = {
  color: "#cbd5e1",
  marginBottom: "15px",
  fontSize: "16px"
};

export default Dashboard;