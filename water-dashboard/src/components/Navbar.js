import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Droplets,
  Sun,
  Moon
} from "lucide-react";

function Navbar({ darkMode, setDarkMode }) {

  const [dateTime, setDateTime] = useState("");

  // =========================================
  // LIVE DATE & TIME
  // =========================================
  useEffect(() => {

    const updateTime = () => {

      const now = new Date();

      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      setDateTime(
        now.toLocaleString("en-US", options)
      );

    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div
      style={{
        width: "100%",
        padding: "18px 10px",
        borderRadius: "24px",
        backdropFilter: "blur(15px)",
        background: darkMode
          ? "rgba(15,23,42,0.75)"
          : "rgba(255,255,255,0.75)",

        border: darkMode
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.06)",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        boxShadow: darkMode
          ? "0 8px 32px rgba(0,0,0,0.35)"
          : "0 8px 32px rgba(0,0,0,0.08)",

        transition: "0.3s"
      }}
    >

      {/* ================================= LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}
      >
        {/* LOGO */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "18px",

          overflow: "hidden",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          background: "transparent",


        }}
      >

        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "120%",
            height: "120%",
            objectFit: "contain"
          }}
        />

      </div>
        {/* TITLE */}
        <div>

          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: darkMode ? "white" : "#0f172a"
            }}
          >
            AQUALYTICS
          </h1>

          <p
            style={{
              margin: 0,
              marginTop: "4px",
              color: darkMode
                ? "#94a3b8"
                : "#475569",

              fontSize: "13px"
            }}
          >
            Smart Water Monitoring System
          </p>

        </div>

      </div>

      {/* ================================= CENTER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}
      >

        {/* SEARCH BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: darkMode
              ? "#1e293b"
              : "#f1f5f9",

            padding: "12px 18px",
            borderRadius: "14px",
            width: "260px"
          }}
        >

          <Search
            size={18}
            color={darkMode ? "#94a3b8" : "#475569"}
          />

          <input
            type="text"
            placeholder="Search..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              marginLeft: "10px",
              width: "100%",
              color: darkMode ? "white" : "#0f172a"
            }}
          />

        </div>
        {/* LIVE STATUS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",

            padding: "10px 18px",
            borderRadius: "14px",

            background: darkMode
            ? "rgba(34,197,94,0.15)"
            : "rgba(34,197,94,0.12)",

            border: "1px solid rgba(34,197,94,0.25)",

            backdropFilter: "blur(10px)",

            boxShadow:
              "0 0 15px rgba(34,197,94,0.15)"
        }}
>

        {/* GREEN PULSE DOT */}
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#22c55e",

            boxShadow:
              "0 0 10px rgba(34,197,94,0.8)",

            animation: "pulse 1.5s infinite"
          }}
        ></div>

  <span
    style={{
      color: darkMode ? "#bbf7d0" : "#166534",
      fontWeight: "700",
      fontSize: "13px",
      letterSpacing: "1px"
    }}
  >
    LIVE
  </span>

</div>

        {/* NOTIFICATION */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: darkMode
              ? "#1e293b"
              : "#f1f5f9",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            position: "relative",
            cursor: "pointer"
          }}
        >

          <Bell
            size={20}
            color={darkMode ? "white" : "#0f172a"}
          />

          {/* RED DOT */}
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ef4444",
              position: "absolute",
              top: "12px",
              right: "12px"
            }}
          ></span>

        </div>

        {/* DARK MODE BUTTON */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",

            background: darkMode
              ? "#1e293b"
              : "#f1f5f9",

            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >

          {darkMode ? (
            <Sun color="#facc15" size={20} />
          ) : (
            <Moon color="#0f172a" size={20} />
          )}

        </button>

        {/* ADMIN PROFILE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",

            background: darkMode
              ? "#1e293b"
              : "#f8fafc",

            padding: "10px 14px",
            borderRadius: "16px"
          }}
        >

          <img
            src="/profile.png"
            alt="admin"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "100px",
              objectFit: "cover"
            }}
          />

          <div>

            <h3
              style={{
                margin: 0,
                color: darkMode
                  ? "white"
                  : "#0f172a",

                fontSize: "15px"
              }}
            >
              Admin
            </h3>

            <p
              style={{
                margin: 0,
                marginTop: "3px",
                fontSize: "12px",

                color: darkMode
                  ? "#94a3b8"
                  : "#64748b"
              }}
            >
              {dateTime}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;