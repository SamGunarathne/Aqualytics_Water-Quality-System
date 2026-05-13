import { useMemo } from "react";

function Alerts({ data, darkMode }) {

  // 🔥 compute active alerts cleanly
  const alerts = useMemo(() => {
    const list = [];

    if (data.ph < 6.5) {
      list.push({ type: "danger", msg: "Low pH detected", level: "CRITICAL" });
    }

    if (data.ph > 8.5) {
      list.push({ type: "danger", msg: "High pH detected", level: "CRITICAL" });
    }

    if (data.turbidity > 5) {
      list.push({ type: "warning", msg: "High Turbidity", level: "WARNING" });
    }

    if (data.tds > 500) {
      list.push({ type: "warning", msg: "High TDS level", level: "WARNING" });
    }

    if (data.temperature < 20 || data.temperature > 30) {
      list.push({ type: "danger", msg: "Temperature out of safe range", level: "CRITICAL" });
    }

    if (list.length === 0) {
      list.push({ type: "safe", msg: "All systems normal", level: "OK" });
    }

    return list;
  }, [data]);

  return (
    <div
      style={{
        ...styles.panel,
        background: darkMode ? "rgba(2,6,23,0.9)" : "#ffffff",
        border: darkMode ? "1px solid #1e293b" : "1px solid #cbd5e1",
        color: darkMode ? "#e2e8f0" : "#0f172a",
        transition: "0.3s"
      }}
    >

      <h4
        style={{
          ...styles.title,
          color: darkMode ? "#38bdf8" : "#0284c7"
        }}
      >
        ⚠ System Alerts
      </h4>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            ...styles.alertBox,

            background:
              a.type === "danger"
                ? darkMode
                  ? "rgba(220,38,38,0.15)"
                  : "#fee2e2"
                : a.type === "warning"
                ? darkMode
                  ? "rgba(234,179,8,0.15)"
                  : "#fef3c7"
                : darkMode
                ? "rgba(34,197,94,0.15)"
                : "#dcfce7",

            borderLeft:
              a.type === "danger"
                ? "4px solid #ef4444"
                : a.type === "warning"
                ? "4px solid #eab308"
                : "4px solid #22c55e",

            boxShadow: darkMode
              ? "0 0 10px rgba(0,0,0,0.2)"
              : "0 0 10px rgba(0,0,0,0.05)"
          }}
        >

          <span style={styles.level}>{a.level}</span>

          <p
            style={{
              ...styles.msg,
              color: darkMode ? "#e2e8f0" : "#0f172a"
            }}
          >
            {a.msg}
          </p>

        </div>
      ))}

    </div>
  );
}

const styles = {

  panel: {
    borderRadius: "14px",
    padding: "18px",
    transition: "0.3s"
  },

  title: {
    marginBottom: "12px",
    letterSpacing: "1px"
  },

  alertBox: {
    padding: "20px 30px",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "0.3s"
  },

  msg: {
    fontSize: "14px",
    margin: 0
  },

  level: {
    fontSize: "12px",
    fontWeight: "bold",
    opacity: 0.8
  }
};

export default Alerts;