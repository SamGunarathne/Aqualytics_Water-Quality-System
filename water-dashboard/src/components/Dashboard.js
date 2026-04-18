import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onChildAdded } from "firebase/database";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

const Dashboard = () => {
  const [labels, setLabels] = useState([]);
  const [phData, setPhData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [tdsData, setTdsData] = useState([]);
  const [turbData, setTurbData] = useState([]);

  const [latest, setLatest] = useState({});

  useEffect(() => {
    const dataRef = ref(db, "waterData");

    onChildAdded(dataRef, (snapshot) => {
      const data = snapshot.val();

      const time = new Date(data.timestamp).toLocaleTimeString();

      setLabels((prev) => [...prev.slice(-9), time]);
      setPhData((prev) => [...prev.slice(-9), data.ph]);
      setTempData((prev) => [...prev.slice(-9), data.temperature]);
      setTdsData((prev) => [...prev.slice(-9), data.tds]);
      setTurbData((prev) => [...prev.slice(-9), data.turbidity]);

      setLatest(data);
    });
  }, []);

  const createChart = (label, data) => ({
    labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        tension: 0.3,
      },
    ],
  });

  return (
    <div style={{ padding: "20px" }}>
      
      {/* 🔷 Latest Values */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Latest Readings</h3>
        <p>pH: {latest.ph}</p>
        <p>Temperature: {latest.temperature} °C</p>
        <p>TDS: {latest.tds} ppm</p>
        <p>Turbidity: {latest.turbidity} NTU</p>
      </div>

      {/* 🔷 Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        <div>
          <h4>pH Level</h4>
          <Line data={createChart("pH", phData)} />
        </div>

        <div>
          <h4>Temperature</h4>
          <Line data={createChart("Temperature", tempData)} />
        </div>

        <div>
          <h4>TDS</h4>
          <Line data={createChart("TDS", tdsData)} />
        </div>

        <div>
          <h4>Turbidity</h4>
          <Line data={createChart("Turbidity", turbData)} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;