// src/components/About.js

import React from "react";

export default function About() {
  return (
    <div style={{
      maxWidth: 700,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 16px #0001",
      padding: 32,
      fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
      lineHeight: 1.6,
      color: "#333"
    }}>
      <h1 style={{ color: "#1976d2", fontWeight: 700, marginBottom: 20 }}>About TM-JBP</h1>
      <p>
        Welcome to <strong>TM-JBP</strong> — a comprehensive machine maintenance and competency monitoring platform designed and developed by <strong>Shrees Sahu</strong>.
      </p>
      <p>
        This website aims to streamline maintenance schedules, track service engineer attendance, and monitor competency parameters efficiently for users and administrators alike.
      </p>
      <p>
        Built with modern web technologies including React and Firebase, TM-JBP ensures a responsive, user-friendly experience across devices.
      </p>
      <p>
        <strong>Developer:</strong> Shrees Sahu<br />
        <strong>Contact:</strong> shrees.sahu9@gmail.com
      </p>
      <p style={{ fontStyle: "italic", marginTop: 40 }}>
        © 2025 TM-JBP by Shrees Sahu. All rights reserved.
      </p>
    </div>
  );
}
