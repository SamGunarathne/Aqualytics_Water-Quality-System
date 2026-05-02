import { useState } from "react";
import { FaTachometerAlt, FaWater, FaBell, FaCog } from "react-icons/fa";

function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Water Data", icon: <FaWater /> },
    { name: "Alerts", icon: <FaBell /> },
    { name: "Settings", icon: <FaCog /> }
  ];

  return (
    <div style={styles.sidebar}>
      
      {/* 🔷 LOGO */}
      <div>
        <h2 style={styles.logo}>AQUALYTICS</h2>

        {/* 🔷 MENU */}
        <ul style={styles.menu}>
          {menuItems.map((item) => (
            <li
              key={item.name}
              onClick={() => setActive(item.name)}
              style={{
                ...styles.item,
                ...(active === item.name ? styles.active : {})
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔷 FOOTER */}
      <div style={styles.footer}>
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
    background: "linear-gradient(180deg, #020617, #0b1224)",
    borderRight: "1px solid #1e293b",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "5px 0 25px rgba(0,0,0,0.5)"
  },

  logo: {
    color: "#38bdf8",
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
    transition: "all 0.25s ease",
    color: "#94a3b8"
  },

  /* 🔥 ACTIVE ITEM */
  active: {
    background: "rgba(56,189,248,0.15)",
    color: "#38bdf8",
    transform: "translateX(6px)",
    boxShadow: "0 0 15px rgba(56,189,248,0.25)",
    borderLeft: "3px solid #38bdf8"
  },

  /* 🔥 ICON */
  icon: {
    fontSize: "16px"
  },

  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "12px",
    borderTop: "1px solid #1e293b",
    paddingTop: "10px"
  }
};

export default Sidebar;