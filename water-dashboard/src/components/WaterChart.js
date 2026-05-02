import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function WaterChart({ history }) {

  const data = {
    labels: history.map((d) => d.time),

    datasets: [
      {
        label: "pH",
        data: history.map((d) => d.ph),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: "y"
      },
      {
        label: "Turbidity",
        data: history.map((d) => d.turbidity),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.2)",
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: "y"
      },
      {
        label: "Temperature (°C)",
        data: history.map((d) => d.temperature),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: "y1"
      },
      {
        label: "TDS (ppm)",
        data: history.map((d) => d.tds),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: "y1"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false
    },

    animation: {
      duration: 800,
      easing: "easeOutQuart"
    },

    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          boxWidth: 12
        }
      },

      title: {
        display: true,
        text: "SCADA Live Water Monitoring",
        color: "#38bdf8",
        font: {
          size: 16
        }
      },

      tooltip: {
        backgroundColor: "#020617",
        borderColor: "#38bdf8",
        borderWidth: 1,
        titleColor: "#38bdf8",
        bodyColor: "#e2e8f0"
      }
    },

    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: {
          color: "rgba(148,163,184,0.1)"
        }
      },

      y: {
        type: "linear",
        position: "left",
        ticks: { color: "#38bdf8" },
        grid: {
          color: "rgba(56,189,248,0.1)"
        },
        title: {
          display: true,
          text: "pH / Turbidity",
          color: "#38bdf8"
        }
      },

      y1: {
        type: "linear",
        position: "right",
        ticks: { color: "#22c55e" },
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: "Temp / TDS",
          color: "#22c55e"
        }
      }
    }
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default WaterChart;