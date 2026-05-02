import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Alerts from "../components/Alerts";
import WaterChart from "../components/WaterChart";

function Dashboard() {
  // ✅ live sensor state
  const [data, setData] = useState({
    ph: 0,
    turbidity: 0,
    temperature: 0,
    tds: 0
  });

  const [history, setHistory] = useState([]);

  // 🔥 prevents duplicate updates / memory issues
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const waterRef = ref(db, "waterData");

    const unsubscribe = onValue(waterRef, (snapshot) => {
      const val = snapshot.val();

      if (!val) {
        console.log("⚠️ No Firebase data at /water");
        return;
      }

      console.log("🔥 LIVE FIREBASE UPDATE:", val);

      // ✅ 1. Update cards (real-time)
      setData({
        ph: Number(val.ph ?? 0),
        turbidity: Number(val.turbidity ?? 0),
        temperature: Number(val.temperature ?? 0),
        tds: Number(val.tds ?? 0)
      });

      // ❗ skip first load for cleaner chart (optional but recommended)
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      // ✅ 2. Update chart history (LIVE STREAM)
      setHistory((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          ph: val.ph ?? 0,
          turbidity: val.turbidity ?? 0,
          temperature: val.temperature ?? 0,
          tds: val.tds ?? 0
        };

        const updated = [...prev, newPoint];

        // keep last 10 points (smooth UI)
        return updated.slice(-10);
      });
    });

    // cleanup
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, background: "#0f172a", minHeight: "100vh" }}>
        <Navbar />

        {/* 🔥 LIVE CARDS */}
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <Card title="pH" value={data.ph} />
          <Card title="Turbidity" value={data.turbidity} unit="NTU" />
          <Card title="Temperature" value={data.temperature} unit="°C" />
          <Card title="TDS" value={data.tds} unit="ppm" />
        </div>

        {/* 🔥 LIVE CHART + ALERTS */}
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <div style={{ flex: 2 }}>
            <WaterChart history={history} />
          </div>

          <div style={{ flex: 1 }}>
            <Alerts data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;