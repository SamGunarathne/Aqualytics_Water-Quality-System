import { useEffect, useState } from "react";

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

  // =========================================
  // MOBILE RESPONSIVE HEIGHT
  // =========================================
  const [chartHeight, setChartHeight] = useState(350);

  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth < 768) {
        setChartHeight(250);
      } else {
        setChartHeight(350);
      }

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  // =========================================
  // CHART DATA
  // =========================================
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
        label: "Temperature",
        data: history.map((d) => d.temperature),

        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",

        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,

        yAxisID: "y1"
      },

      {
        label: "TDS",
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

  // =========================================
  // CHART OPTIONS
  // =========================================
  const options = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false
    },

    animation: {
      duration: 700
    },

    plugins: {

      legend: {
        position: "top",

        labels: {
          color: "#94a3b8",

          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },

      title: {
        display: true,

        text: "SCADA Live Water Monitoring",

        color: "#38bdf8",

        font: {
          size: window.innerWidth < 768 ? 12 : 16
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

        ticks: {
          color: "#94a3b8",

          maxTicksLimit:
            window.innerWidth < 768 ? 5 : 10
        },

        grid: {
          color: "rgba(148,163,184,0.08)"
        }

      },

      y: {

        type: "linear",
        position: "left",

        ticks: {
          color: "#38bdf8"
        },

        grid: {
          color: "rgba(56,189,248,0.08)"
        }

      },

      y1: {

        type: "linear",
        position: "right",

        ticks: {
          color: "#22c55e"
        },

        grid: {
          drawOnChartArea: false
        }

      }

    }

  };

  // =========================================
  // UI
  // =========================================
  return (

    <div
      style={{
        width: "100%",
        height: `${chartHeight}px`,
        position: "relative"
      }}
    >

      <Line
        data={data}
        options={options}
      />

    </div>

  );
}

export default WaterChart;