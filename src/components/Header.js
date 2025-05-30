import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/forgot-password") return null;

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  const goHome = () => {
    const role = localStorage.getItem("role");
    if (role === "admin") navigate("/admin-home");
    else navigate("/user-home");
  };

  return (
    <div style={{
      width: "100%",
      background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
      minHeight: 58,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      boxShadow: "0 2px 16px #0001",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        flex: 1,
        fontWeight: 800,
        color: "#fff",
        fontSize: 25,
        marginLeft: 32,
        letterSpacing: 1,
        fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
      }}>
        TM-JBP
      </div>
      <button
        onClick={goHome}
        style={{
          background: "#fff",
          color: "#1976d2",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: 16,
          padding: "9px 24px",
          marginRight: 16,
          cursor: "pointer",
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
          boxShadow: "0 1px 4px #1976d220"
        }}>
        Home
      </button>
      <button
        onClick={() => navigate("/profile")}
        style={{
          background: "#fff",
          color: "#1976d2",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: 16,
          padding: "9px 24px",
          marginRight: 16,
          cursor: "pointer",
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
          boxShadow: "0 1px 4px #1976d220"
        }}>
        Profile
      </button>
      <button
        onClick={() => navigate("/about")}
        style={{
          background: "#fff",
          color: "#1976d2",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: 16,
          padding: "9px 24px",
          marginRight: 16,
          cursor: "pointer",
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
          boxShadow: "0 1px 4px #1976d220"
        }}>
        About
      </button>
      <button
        onClick={handleLogout}
        style={{
          background: "#e53935",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: 16,
          padding: "9px 24px",
          marginRight: 32,
          cursor: "pointer",
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
          boxShadow: "0 1px 4px #e5393520"
        }}>
        Logout
      </button>
    </div>
  );
}
