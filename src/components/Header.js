import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Mobile: Hamburger menu open/close
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        minHeight: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 16px #0001",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 16px"
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontWeight: 800,
          color: "#fff",
          fontSize: 25,
          letterSpacing: 1,
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
        }}
      >
        TM-JBP
      </div>

      {/* Desktop Menu */}
      <div className="header-buttons">
        <button onClick={goHome} className="header-btn">Home</button>
        <button onClick={() => navigate("/profile")} className="header-btn">Profile</button>
        <button onClick={() => navigate("/about")} className="header-btn">About</button>
        <button onClick={handleLogout} className="header-btn logout">Logout</button>
      </div>

      {/* Hamburger Icon (Mobile) */}
      <div className="hamburger" onClick={toggleMenu}>
        <div />
        <div />
        <div />
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button onClick={() => { goHome(); setMenuOpen(false); }} className="header-btn">Home</button>
          <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="header-btn">Profile</button>
          <button onClick={() => { navigate("/about"); setMenuOpen(false); }} className="header-btn">About</button>
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="header-btn logout">Logout</button>
        </div>
      )}

      {/* CSS for Responsive Header */}
      <style>{`
        .header-buttons {
          display: flex;
          gap: 12px;
        }
        .header-btn {
          background: #fff;
          color: #1976d2;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          padding: 9px 18px;
          cursor: pointer;
          font-family: 'Open Sans', Arial, Helvetica, sans-serif;
          box-shadow: 0 1px 4px #1976d220;
          margin-right: 0;
        }
        .header-btn.logout {
          background: #e53935;
          color: #fff;
          box-shadow: 0 1px 4px #e5393520;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          margin-left: 16px;
        }
        .hamburger div {
          width: 28px;
          height: 4px;
          background: #fff;
          border-radius: 2px;
        }
        .mobile-menu {
          position: absolute;
          top: 58px;
          right: 16px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 16px #0002;
          display: flex;
          flex-direction: column;
          z-index: 200;
          min-width: 140px;
          padding: 8px 0;
        }
        .mobile-menu .header-btn {
          background: none;
          color: #1976d2;
          border-radius: 0;
          box-shadow: none;
          text-align: left;
          padding: 12px 24px;
          font-size: 17px;
          border-bottom: 1px solid #eee;
        }
        .mobile-menu .header-btn:last-child {
          border-bottom: none;
        }
        .mobile-menu .logout {
          color: #e53935;
        }
        @media (max-width: 700px) {
          .header-buttons {
            display: none;
          }
          .hamburger {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
