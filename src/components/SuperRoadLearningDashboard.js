import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Section names and keys
const SECTIONS = [
  { key: "JBP_ET", label: "JBP-ET" },
  { key: "JBP_KTE", label: "JBP-KTE" },
  { key: "KTE_STA", label: "KTE-STA" },
  { key: "STA_MKP", label: "STA-MKP" },
  { key: "STA_REWA", label: "STA-REWA" },
  { key: "KTE_SGRL", label: "KTE-SGRL" },
  { key: "KTE_BINA", label: "KTE-BINA" },
  { key: "JBP_MKP", label: "JBP-MKP" }
];

function addMonths(dateStr, months) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
function isValid(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) >= new Date();
}
function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export default function SuperRoadLearningDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  function downloadCSV() {
    const headers = [
      "Name",
      ...SECTIONS.flatMap(sec => [sec.label + " Start", sec.label + " Expiry", sec.label + " Status"])
    ];
    const rows = users.map(u => [
      u.name || "--",
      ...SECTIONS.flatMap(sec => {
        const start = u.roadLearning?.[sec.key]?.date || "";
        const expiry = start ? addMonths(start, 3) : "";
        const valid = start && isValid(expiry);
        return [
          formatDate(start),
          formatDate(expiry),
          start ? (valid ? "Valid" : "Due") : "--"
        ];
      })
    ]);
    let csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "road_learning_dashboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      maxWidth: 1400,
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
          Road Learning Dashboard
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          All Users' LRD Status
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
                <th style={thStyle}>Name</th>
                {SECTIONS.map(sec => (
                  <th key={sec.key} style={thStyle} colSpan={2}>{sec.label}</th>
                ))}
              </tr>
              <tr style={{ background: "#f5faff" }}>
                <th style={thStyle}></th>
                {SECTIONS.map(sec => (
                  <React.Fragment key={sec.key}>
                    <th style={thStyle}>Start</th>
                    <th style={thStyle}>Expiry</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={tdStyle}>{u.name || "--"}</td>
                  {SECTIONS.map(sec => {
                    const start = u.roadLearning?.[sec.key]?.date || "";
                    const expiry = start ? addMonths(start, 3) : "";
                    const valid = start && isValid(expiry);
                    return (
                      <React.Fragment key={sec.key}>
                        <td style={tdStyle}>{formatDate(start)}</td>
                        <td style={{
                          ...tdStyle,
                          background: start ? (valid ? "#e8f5e9" : "#ffebee") : "#eee",
                          color: start ? (valid ? "#388e3c" : "#c62828") : "#888",
                          fontWeight: 600
                        }}>
                          {formatDate(expiry)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
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
