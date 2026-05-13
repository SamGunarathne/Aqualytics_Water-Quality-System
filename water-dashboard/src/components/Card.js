function Card({ title, value, unit, darkMode }) {

  // 🔥 status logic
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

  return (
    <div
      style={{
        ...styles.card,

        background: darkMode
          ? "linear-gradient(145deg, #020617, #0b1224)"
          : "#ffffff",

        color: darkMode ? "white" : "#0f172a",

        border: darkMode
          ? "1px solid #1e293b"
          : "1px solid #cbd5e1",

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

      {/* 🔴 STATUS DOT */}
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
      ></div>

      {/* TITLE */}
      <h4
        style={{
          ...styles.title,
          color: darkMode ? "#94a3b8" : "#475569"
        }}
      >
        {title}
      </h4>

      {/* VALUE */}
      <h2
        style={{
          ...styles.value,
          color: darkMode ? "#38bdf8" : "#0284c7"
        }}
      >
        {value}{" "}
        <span
          style={{
            ...styles.unit,
            color: darkMode ? "#94a3b8" : "#475569"
          }}
        >
          {unit}
        </span>
      </h2>

      {/* STATUS TEXT */}
      <p
        style={{
          ...styles.statusText,
          color: darkMode ? "#cbd5e1" : "#334155"
        }}
      >
        {status.toUpperCase()}
      </p>

    </div>
  );
}

const styles = {

  card: {
    padding: "40px",
    borderRadius: "14px",
    width: "80%",
    position: "relative",
    overflow: "hidden",
    transition: "0.3s",
    cursor: "pointer"
  },

  title: {
    fontSize: "20px",
    letterSpacing: "1px",
    margin: 0
  },

  value: {
    fontSize: "28px",
    marginTop: "8px",
    marginBottom: "0"
  },

  unit: {
    fontSize: "14px"
  },

  statusText: {
    fontSize: "11px",
    marginTop: "10px",
    opacity: 0.8,
    letterSpacing: "1px"
  },

  dot: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  }
};

export default Card;