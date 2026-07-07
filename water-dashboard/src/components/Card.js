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
  prediction,
  unit,
  darkMode,
  history = [],
  onClick
}){

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
          return <Droplets size={22} color="#3b82f6" />;

        case "Turbidity":
          return <Waves size={22} color="#16a34a" />;

        case "Temperature":
          return <Thermometer size={22} color="#f59e0b" />;

        case "TDS":
          return <Beaker size={22} color="#a855f7" />;
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
       
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 95px",
            gap: "10px",
            alignItems: "center"
          }}
        >
          {/* LEFT */}
          <div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#eef6ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8
              }}
            >
              {getIcon()}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 600
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: "#2563eb",
                marginTop: 5
              }}
            >
              {value}
              <span
                style={{
                  fontSize: 13,
                  marginLeft: 5,
                  color: "#64748b"
                }}
              >
                {unit}
              </span>
            </div>
            <p
            style={{
              marginTop: "6px",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "600",
              color: darkMode ? "#cbd5e1" : "#475569"
            }}
          >
            Predicted: {prediction?.toFixed(2)} {unit}
          </p>
          </div>

          {/* MINI CHART */}
          <div
            style={{
              width: 90,
              height: 55
            }}
          >
            {history.length > 1 && (
              <Line
                data={chartData}
                options={chartOptions}
              />
            )}
          </div>

          {/* STATUS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  status === "safe"
                    ? "#22c55e"
                    : status === "warning"
                    ? "#f59e0b"
                    : "#ef4444"
              }}
            />

            <span
              style={{
                color:
                  status === "safe"
                    ? "#22c55e"
                    : status === "warning"
                    ? "#f59e0b"
                    : "#ef4444",
                fontWeight: 600,
                fontSize: 12
              }}
            >
              {status === "safe"
                ? "Normal"
                : status === "warning"
                ? "Warning"
                : "Danger"}
            </span>
          </div>

          {/* SAFE RANGE */}
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginTop: -8
            }}
          >
            <div>{getRange()}</div>
            <div>Safe Range</div>
          </div>
        </div>
      </div>
    

          <div
      
    >
      

      
    </div>

    </div>
  );
}

const styles = {
  card: {
  width: "100%",
  minHeight: "150px",
  borderRadius: "18px",
  padding: "18px",
  cursor: "pointer",
  transition: "0.3s"
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