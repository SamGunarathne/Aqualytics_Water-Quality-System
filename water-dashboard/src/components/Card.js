import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from "chart.js";
import { Droplets, Thermometer, Waves, Beaker } from "lucide-react";


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
      const getIcon = () => {
      switch (title) {
        case "pH":
          return <Beaker size={24} color="#22c55e" />;
        case "Turbidity":
          return <Waves size={24} color="#22c55e" />;
        case "Temperature":
          return <Thermometer size={24} color="#22c55e" />;
        case "TDS":
          return <Droplets size={24} color="#22c55e" />;
        default:
          return <Droplets size={24} color="#22c55e" />;
      }
    };

    const getRange = () => {
      switch (title) {
        case "pH":
          return "6.5 - 8.5";
        case "Turbidity":
          return "0 - 5";
        case "Temperature":
          return "20 - 30°C";
        case "TDS":
          return "300 - 600 ppm";
        default:
          return "";
      }
    };

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

          <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }}
    >
      {/* Left */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "18px",
            background: "#dcfce7",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "15px"
          }}
        >
          {getIcon()}
        </div>

        <h4
          style={{
            margin: 0,
            color: darkMode ? "#cbd5e1" : "#475569"
          }}
        >
          {title}
        </h4>

        <h2
          style={{
            margin: "6px 0",
            color: "#16a34a",
            fontSize: "34px"
          }}
        >
          {value}
          <span
            style={{
              fontSize: "16px",
              marginLeft: "6px"
            }}
          >
            {unit}
          </span>
        </h2>

        <p
          style={{
            color:
              status === "safe"
                ? "#22c55e"
                : status === "warning"
                ? "#f59e0b"
                : "#ef4444",
            fontWeight: "600",
            margin: "8px 0"
          }}
        >
          ● {status === "safe"
            ? "Good"
            : status === "warning"
            ? "Warning"
            : "Danger"}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#64748b"
          }}
        >
          {getRange()}
        </p>

        <small
          style={{
            color: "#64748b"
          }}
        >
          Safe Range
        </small>
      </div>

      {/* Right Chart */}
      <div
        style={{
          width: "110px",
          height: "70px",
          marginTop: "20px"
        }}
      >
        {history.length > 1 && (
          <Line
            data={chartData}
            options={chartOptions}
          />
        )}
      </div>
    </div>

    </div>
  );
}

const styles = {
    card: {
    padding: "22px",
    borderRadius: "22px",
    width: "100%",
    cursor: "pointer",
    transition: "0.3s",
    minHeight: "20px"
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