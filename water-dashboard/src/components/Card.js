function Card({ title, value, unit }) {

  // 🔥 simple status logic (you can customize later)
  const getStatus = () => {
    if (title === "pH") {
      if (value < 6.5 || value > 8.5) return "danger";
      return "safe";
    }

    if (title === "Turbidity") {
      if (value > 5) return "warning";
      return "safe";
    }

    return "normal";
  };

  const status = getStatus();

  return (
    <div style={{ ...styles.card, ...styles[status] }}>
      
      {/* status dot */}
      <div style={{ ...styles.dot, ...styles.dotStatus[status] }}></div>

      <h4 style={styles.title}>{title}</h4>

      <h2 style={styles.value}>
        {value} <span style={styles.unit}>{unit}</span>
      </h2>

      <p style={styles.statusText}>{status.toUpperCase()}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(145deg, #020617, #0b1224)",
    color: "white",
    padding: "18px",
    borderRadius: "14px",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "0.3s",
    border: "1px solid #1e293b",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    cursor: "pointer"
  },

  /* hover effect */
  safe: {
    boxShadow: "0 0 15px rgba(34,197,94,0.2)"
  },

  warning: {
    boxShadow: "0 0 15px rgba(234,179,8,0.2)"
  },

  danger: {
    boxShadow: "0 0 20px rgba(239,68,68,0.3)"
  },

  title: {
    color: "#94a3b8",
    fontSize: "13px",
    letterSpacing: "1px"
  },

  value: {
    color: "#38bdf8",
    fontSize: "28px",
    marginTop: "8px"
  },

  unit: {
    fontSize: "14px",
    color: "#94a3b8"
  },

  statusText: {
    fontSize: "11px",
    marginTop: "10px",
    opacity: 0.7,
    letterSpacing: "1px"
  },

  /* status dot */
  dot: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  },

  dotStatus: {
    safe: {
      background: "#22c55e",
      boxShadow: "0 0 10px #22c55e"
    },
    warning: {
      background: "#eab308",
      boxShadow: "0 0 10px #eab308"
    },
    danger: {
      background: "#ef4444",
      boxShadow: "0 0 10px #ef4444"
    }
  }
};

export default Card;