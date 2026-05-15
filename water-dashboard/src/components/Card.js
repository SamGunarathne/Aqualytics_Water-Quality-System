import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from "chart.js";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

function Card({
  title,
  value,
  unit,
  darkMode,
  history = [],
  onClick
}) {

  // ================= STATUS LOGIC =================
  const getStatus = () => {
    if (title === "pH") {
      if (value < 6.5 || value > 8.5) return "danger";
      return "safe";
    }

    if (title === "Turbidity") {
      if (value > 5) return "warning";
      return "safe";
    }

    if (title === "Temperature") {
      if (value < 20 || value > 30) return "danger";
      return "safe";
    }

    if (title === "TDS") {
      if (value < 300 || value > 600) return "warning";
      return "safe";
    }

    return "normal";
  };

  const status = getStatus();

  // ================= MINI CHART DATA =================
  const chartData = {
    labels: history.map((_, i) => i + 1),
    datasets: [
      {
        data: history,
        borderColor:
          status === "safe"
            ? "#22c55e"
            : status === "warning"
            ? "#eab308"
            : "#ef4444",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
  <div
    onClick={onClick}
    style={{
        ...styles.card,
        background: darkMode
          ? "linear-gradient(145deg, #020617, #0b1224)"
          : "#ffffff",
        color: darkMode ? "white" : "#0f172a",
        border: darkMode ? "1px solid #1e293b" : "1px solid #cbd5e1",
        boxShadow:
          status === "safe"
            ? darkMode
              ? "0 0 15px rgba(34,197,94,0.2)"
              : "0 0 10px rgba(34,197,94,0.15)"
            : status === "warning"
            ? darkMode
              ? "0 0 15px rgba(234,179,8,0.2)"
              : "0 0 10px rgba(234,179,8,0.15)"
            : darkMode
            ? "0 0 20px rgba(239,68,68,0.25)"
            : "0 0 12px rgba(239,68,68,0.15)"
      }}
      
        
    >

      {/* STATUS DOT */}
      <div
        style={{
          ...styles.dot,
          background:
            status === "safe"
              ? "#22c55e"
              : status === "warning"
              ? "#eab308"
              : "#ef4444",
          boxShadow:
            status === "safe"
              ? "0 0 10px #22c55e"
              : status === "warning"
              ? "0 0 10px #eab308"
              : "0 0 10px #ef4444"    
        }}
      />

      {/* TITLE */}
      <h4 style={{ ...styles.title, color: darkMode ? "#94a3b8" : "#475569" }}>
        {title}
      </h4>

      {/* VALUE */}
      <h2 style={{ ...styles.value, color: darkMode ? "#38bdf8" : "#0284c7" }}>
        {value} <span style={styles.unit}>{unit}</span>
      </h2>

      {/* 🔥 MINI CHART */}
      {history && history.length > 1 ? (
        <div style={{ height: "60px", width: "100%" }}>
        <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div style={{ fontSize: "12px", opacity: 0.5 }}>
          No chart data
        </div>
      )}

      {/* STATUS TEXT */}
      <p style={{ ...styles.statusText, color: darkMode ? "#cbd5e1" : "#334155" }}>
        {status.toUpperCase()}
      </p>

    </div>
  );
}

const styles = {
  card: {
    padding: "20px",
    borderRadius: "14px",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "0.3s",
    cursor: "pointer"
  },

  title: {
    fontSize: "16px",
    margin: 0
  },

  value: {
    fontSize: "26px",
    marginTop: "8px",
    marginBottom: "0"
  },

  unit: {
    fontSize: "14px"
  },

  statusText: {
    fontSize: "11px",
    marginTop: "8px",
    opacity: 0.8
  },

  dot: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  }
};

export default Card;