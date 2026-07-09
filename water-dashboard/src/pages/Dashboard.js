import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
import SensorDetails from "./SensorDetails";
import WaterData from "../components/Water Data";


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
  const handleLogout = () => {
    signOut(auth);
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
  // ===============================
// EXPORT WATER DATA TO EXCEL
// ===============================

const exportExcel = () => {

  if(history.length === 0){
    alert("No water data available");
    return;
  }


  const excelData = history.map((item)=>({

    Time: item.time,

    pH: item.ph,

    Turbidity_NTU: item.turbidity,

    Temperature_C: item.temperature,

    TDS_ppm: item.tds,

  }));


  const worksheet = XLSX.utils.json_to_sheet(excelData);


  const workbook = XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Water Data"
  );


  const excelBuffer = XLSX.write(
    workbook,
    {
      bookType:"xlsx",
      type:"array"
    }
  );


  const file = new Blob(
    [excelBuffer],
    {
      type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  );


  saveAs(
    file,
    "Water_Quality_Report.xlsx"
  );

};
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
      console.log(`[${new Date().toLocaleTimeString()}] 🟢 Connected to Firebase. Latest update:`, latest);

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
        handleLogout={handleLogout}
        exportExcel={exportExcel}
        />

      {/* ================================= MAIN CONTENT */}
     <div 
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: page === "water" ? "1px 20px" : "20px"
        }}
        >
              

        {/* ================================= NAVBAR */}
        {page !== "water" && (

        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setPage={setPage}
          alertCount={alertCount}
          anomalyCount={anomalies.length}
        />

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
                gap: "20px",
                marginTop: "20px",
                width: "100%"
              }}
            >

              {/* pH */}
              <Card
                title="pH"
                value={data.ph}
                 prediction={prediction.ph}
                darkMode={darkMode}
                history={sensorHistory.ph}
                onClick={() => {
                  setPage("sensorDetails");
                  setSelectedSensor("ph");
                }}
                
              />
              
              
  

              {/* Turbidity */}
              <Card
                title="Turbidity"
                value={data.turbidity}
                prediction={prediction.turbidity}
                unit="NTU"
                darkMode={darkMode}
                history={sensorHistory.turbidity}
                onClick={() => {
                  setPage("sensorDetails");
                  setSelectedSensor("turbidity");
                }}
              />

              {/* Temperature */}
              <Card
                title="Temperature"
                value={data.temperature}
                prediction={prediction.temperature}
                unit="°C"
                darkMode={darkMode}
                history={sensorHistory.temperature}
                onClick={() => {
                  setPage("sensorDetails");
                  setSelectedSensor("temperature");
                }}
              />

              {/* TDS */}
              <Card
                title="TDS"
                value={data.tds}
                prediction={prediction.tds}
                unit="ppm"
                darkMode={darkMode}
                history={sensorHistory.tds}
                onClick={() => {
                  setPage("sensorDetails");
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
                
              }}
            >
             

              {/* ================================= CHART */}
              <div
                style={{
                  background: cardBackground,
                  borderRadius: "20px",
                  padding: "15px",
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
        {/* ================= SENSOR DETAILS PAGE =============== */}
        {/* ====================================================== */}

        {page === "sensorDetails" && (

          <div style={{
            marginTop:"10px"
          }}>

          <SensorDetails
          selectedSensor={selectedSensor}
          data={data}
          prediction={prediction}
          anomalies={anomalies}
          history={history}
          darkMode={darkMode}
          setPage={setPage}
          setSelectedSensor={setSelectedSensor}
          />

          </div>

          )}

         

        {/* ====================================================== */}
        {/* ================= WATER DATA PAGE ==================== */}
        {/* ====================================================== */}
        {page === "water" && (

          <WaterData
          data={data}
          anomalies={anomalies}
          darkMode={darkMode}
          />

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