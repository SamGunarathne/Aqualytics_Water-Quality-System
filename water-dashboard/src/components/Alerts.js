import { useMemo } from "react";

function Alerts({ data }) {

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

    if (data.temperature > 20) {
      list.push({ type: "danger", msg: "High temperature level", level: "CRITICAL" });
    }

    if (data.temperature < 30) {
      list.push({ type: "danger", msg: "High temperature level", level: "CRITICAL" });
    }

    if (list.length === 0) {
      list.push({ type: "safe", msg: "All systems normal", level: "OK" });
    }

    return list;
  }, [data]);

  return (
    <div style={styles.panel}>
      <h4 style={styles.title}>⚠ System Alerts</h4>

      {alerts.map((a, i) => (
        <div key={i} style={{ ...styles.alertBox, ...styles[a.type] }}>
          <span style={styles.level}>{a.level}</span>
          <p style={styles.msg}>{a.msg}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  panel: {
    background: "rgba(2,6,23,0.9)",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "18px",
    color: "#e2e8f0",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)"
  },

  title: {
    marginBottom: "12px",
    color: "#38bdf8",
    letterSpacing: "1px"
  },

  alertBox: {
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "0.3s",
    borderLeft: "4px solid transparent"
  },

  msg: {
    fontSize: "14px"
  },

  level: {
    fontSize: "12px",
    fontWeight: "bold",
    opacity: 0.8
  },

  /* 🔴 danger alert */
  danger: {
    background: "rgba(220,38,38,0.15)",
    borderLeft: "4px solid #ef4444",
    boxShadow: "0 0 10px rgba(239,68,68,0.2)"
  },

  /* 🟡 warning alert */
  warning: {
    background: "rgba(234,179,8,0.15)",
    borderLeft: "4px solid #eab308",
    boxShadow: "0 0 10px rgba(234,179,8,0.2)"
  },

  /* 🟢 safe status */
  safe: {
    background: "rgba(34,197,94,0.15)",
    borderLeft: "4px solid #22c55e",
    boxShadow: "0 0 10px rgba(34,197,94,0.2)"
  }
};

export default Alerts;