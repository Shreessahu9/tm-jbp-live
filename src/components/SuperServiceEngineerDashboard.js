// src/components/SuperServiceEngineerDashboard.js

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export default function SuperServiceEngineerDashboard() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "machines"), (snap) => {
      setMachines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  function getLatest(entries, type) {
    if (!entries) return [null, null];
    const filtered = entries.filter(e => e.type === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return [filtered[0] || null, filtered[1] || null];
  }

  function downloadCSV() {
    const headers = [
      "Machine Name",
      "Latest Machine Service Date", "Engine Hour", "Siding",
      "2nd Latest Machine Service Date", "Engine Hour", "Siding",
      "Latest Engine Service Date", "Engine Hour", "Siding",
      "2nd Latest Engine Service Date", "Engine Hour", "Siding"
    ];
    const rows = machines.map(m => {
      const [latestMach, secondMach] = getLatest(m.serviceEngineerHistory, "machine");
      const [latestEng, secondEng] = getLatest(m.serviceEngineerHistory, "engine");
      return [
        m.name || m.id,
        formatDate(latestMach?.date), latestMach?.engineHour || "--", latestMach?.siding || "--",
        formatDate(secondMach?.date), secondMach?.engineHour || "--", secondMach?.siding || "--",
        formatDate(latestEng?.date), latestEng?.engineHour || "--", latestEng?.siding || "--",
        formatDate(secondEng?.date), secondEng?.engineHour || "--", secondEng?.siding || "--"
      ];
    });
    let csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "service_engineer_dashboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      maxWidth: 1300,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 16px #0001",
      padding: 0,
      overflow: "hidden"
    }}>
      <div style={{
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        padding: "28px 0 18px 0",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: 1 }}>
          Service Engineer Attendance Dashboard
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          Latest and Previous Service Entries (Machine & Engine)
        </div>
      </div>
      <div style={{ padding: 28 }}>
        <button
          onClick={downloadCSV}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            fontSize: 15,
            marginBottom: 18,
            cursor: "pointer"
          }}>
          Download Excel
        </button>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fafbfc",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 4px #1976d210"
          }}>
            <thead>
              <tr style={{ background: "#e3f2fd" }}>
                <th style={thStyle}>Machine Name</th>
                <th style={thStyle} colSpan={3}>Latest Machine Service</th>
                <th style={thStyle} colSpan={3}>2nd Latest Machine Service</th>
                <th style={thStyle} colSpan={3}>Latest Engine Service</th>
                <th style={thStyle} colSpan={3}>2nd Latest Engine Service</th>
              </tr>
              <tr style={{ background: "#f5faff" }}>
                <th style={thStyle}></th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Siding</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Siding</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Siding</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Siding</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => {
                const [latestMach, secondMach] = getLatest(m.serviceEngineerHistory, "machine");
                const [latestEng, secondEng] = getLatest(m.serviceEngineerHistory, "engine");
                return (
                  <tr key={m.id}>
                    <td style={tdStyle}>{m.name || m.id}</td>
                    {/* Latest Machine */}
                    <td style={tdStyle}>{formatDate(latestMach?.date)}</td>
                    <td style={tdStyle}>{latestMach?.engineHour || "--"}</td>
                    <td style={tdStyle}>{latestMach?.siding || "--"}</td>
                    {/* 2nd Latest Machine */}
                    <td style={tdStyle}>{formatDate(secondMach?.date)}</td>
                    <td style={tdStyle}>{secondMach?.engineHour || "--"}</td>
                    <td style={tdStyle}>{secondMach?.siding || "--"}</td>
                    {/* Latest Engine */}
                    <td style={tdStyle}>{formatDate(latestEng?.date)}</td>
                    <td style={tdStyle}>{latestEng?.engineHour || "--"}</td>
                    <td style={tdStyle}>{latestEng?.siding || "--"}</td>
                    {/* 2nd Latest Engine */}
                    <td style={tdStyle}>{formatDate(secondEng?.date)}</td>
                    <td style={tdStyle}>{secondEng?.engineHour || "--"}</td>
                    <td style={tdStyle}>{secondEng?.siding || "--"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px 6px",
  fontWeight: 700,
  fontSize: 15,
  color: "#1976d2",
  borderBottom: "2px solid #e3f2fd",
  textAlign: "center",
  whiteSpace: "nowrap"
};
const tdStyle = {
  padding: "8px 6px",
  fontSize: 14,
  color: "#222",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  textAlign: "center",
  whiteSpace: "nowrap"
};
