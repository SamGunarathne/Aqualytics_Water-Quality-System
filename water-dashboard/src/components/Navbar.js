import { useEffect, useState } from "react";

function Navbar() {
  const [time, setTime] = useState("");

  // 🔥 live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.nav}>
      
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <h3 style={styles.title}>AQUALYTICS</h3>
        <span style={styles.subtitle}>Water Monitoring System</span>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        
        {/* status */}
        <div style={styles.status}>
          <span style={styles.dot}></span>
          <span>LIVE</span>
        </div>

        {/* time */}
        <span style={styles.time}>{time}</span>
      </div>

    </div>
  );
}

const styles = {
  nav: {
    background: "rgba(2,6,23,0.85)",
    backdropFilter: "blur(12px)",
    color: "white",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    boxShadow: "0 2px 10px rgba(0,0,0,0.4)"
  },

  left: {
    display: "flex",
    flexDirection: "column"
  },

  title: {
    color: "#38bdf8",
    letterSpacing: "2px"
  },

  subtitle: {
    fontSize: "12px",
    color: "#94a3b8"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  /* 🔥 LIVE STATUS */
  status: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#22c55e"
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 10px #22c55e",
    animation: "pulse 1.5s infinite"
  },

  time: {
    fontSize: "13px",
    color: "#94a3b8"
  }
};

export default Navbar;