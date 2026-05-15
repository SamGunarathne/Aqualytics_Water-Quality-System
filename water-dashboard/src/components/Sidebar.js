import { Bold } from "lucide-react";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaWater,
  FaBell,
  FaCog
} from "react-icons/fa";

function Sidebar({ setPage, setSelectedSensor, darkMode }) {

  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Water Data", icon: <FaWater /> },
    { name: "Alerts", icon: <FaBell /> },
    { name: "Settings", icon: <FaCog /> }
  ];

  const handleMenuClick = (name) => {
  setActive(name);

  if (name === "Dashboard") {
    setPage("dashboard");
    setSelectedSensor("");
  }

  if (name === "Water Data") {
    setPage("water");
    setSelectedSensor("");
  }

  if (name === "Alerts") {
    setPage("alerts");
    setSelectedSensor("");
  }

  if (name === "Settings") {
    setPage("settings");
    setSelectedSensor("");
  }
};

  return (
    <div
      style={{
        ...styles.sidebar,

        // 🔥 FIXED BACKGROUND 
        background: darkMode
          ? "linear-gradient(180deg, #020617, #0b1224)"
          : "url('/Sidebar-bg.PNG')",

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        position: "relative",
        overflow: "hidden",

        borderRight: darkMode
          ? "1px solid #1e293b"
          : "1px solid #cbd5e1"
      }}
    >

      {/* 🔥 OVERLAY (READABILITY FIX) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: darkMode
            ? "rgba(0,0,0,0)"
            : "rgba(255,255,255,0.65)",
          backdropFilter: "blur(2px)",
          zIndex: 0
        }}
      />

      {/* CONTENT */}
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* TOP */}
        <div>

          <h2 style={{
            ...styles.logo,
            color: darkMode ? "#38bdf8" : "#0284c7"
          }}>
            AQUALYTICS
          </h2>

          <ul style={styles.menu}>
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => handleMenuClick(item.name)}
                style={{
                  ...styles.item,

                  color: darkMode ? "#94a3b8" : "#334155",

                  background:
                    active === item.name
                      ? darkMode
                        ? "rgba(56,189,248,0.15)"
                        : "rgba(2,132,199,0.12)"
                      : "transparent",

                  borderLeft:
                    active === item.name
                      ? "3px solid #38bdf8"
                      : "3px solid transparent",

                  transform:
                    active === item.name
                      ? "translateX(6px)"
                      : "translateX(0px)",

                  boxShadow:
                    active === item.name && darkMode
                      ? "0 0 15px rgba(56,189,248,0.25)"
                      : "none"
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>

        </div>

        {/* FOOTER */}
        <div style={{
          ...styles.footer,
          borderTop: darkMode
            ? "1px solid #1e293b"
            : "1px solid #cbd5e1",
          color: darkMode ? "#64748b" : "#475569"
        }}>
          <p>🟢 System Online</p>
          <small>v1.0.0</small>
        </div>

      </div>
    </div>
  );
}

const styles = {

  sidebar: {
    width: "250px",
    height: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "5px 0 25px rgba(0,0,0,0.25)",
    transition: "0.3s ease"
  },

  logo: {
    letterSpacing: "2px",
    marginBottom: "30px",
    fontWeight: "bold"
  },

  menu: {
    listStyle: "none",
    padding: 0
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    marginBottom: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.25s ease"
  },

  icon: {
    fontSize: "20px"
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    paddingTop: "10px"
  }
};

export default Sidebar;