import { useState } from "react";
import {
  FaTachometerAlt,
  FaWater,
  FaBell,
  FaCog
} from "react-icons/fa";

function Sidebar({ setPage, darkMode }) {

  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Water Data", icon: <FaWater /> },
    { name: "Alerts", icon: <FaBell /> },
    { name: "Settings", icon: <FaCog /> }
  ];

  // 🔥 HANDLE PAGE SWITCH
  const handleMenuClick = (name) => {
    setActive(name);

    if (name === "Dashboard") setPage("dashboard");
    if (name === "Water Data") setPage("water");
    if (name === "Alerts") setPage("alerts");
    if (name === "Settings") setPage("settings");
  };

  return (
    <div style={{
      ...styles.sidebar,
      background: darkMode
        ? "linear-gradient(180deg, #020617, #0b1224)"
        : "linear-gradient(180deg, #ffffff, #f1f5f9)",
      borderRight: darkMode
        ? "1px solid #1e293b"
        : "1px solid #cbd5e1"
    }}>

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
                    ? (darkMode
                        ? "rgba(56,189,248,0.15)"
                        : "rgba(2,132,199,0.12)")
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
  );
}

const styles = {

  sidebar: {
    width: "250px",
    height: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "5px 0 25px rgba(0,0,0,0.5)",
    transition: "0.3s"
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
    fontSize: "16px"
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    paddingTop: "10px"
  }
};

export default Sidebar;