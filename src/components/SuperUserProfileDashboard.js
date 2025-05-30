import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export default function SuperUserProfileDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  function downloadCSV() {
    const headers = [
      "Name", "Mobile No", "PF No", "HRMS ID", "Date of Birth", "Date of Joining", "Date of Retirement", "Assigned Machine", "Email"
    ];
    const rows = users.map(u => [
      u.name || "--",
      u.mobileNo || "--",
      u.pfNo || "--",
      u.hrmsId || "--",
      formatDate(u.dob),
      formatDate(u.dateOfJoining),
      formatDate(u.dateOfRetirement),
      u.assignedMachine || "--",
      u.email || "--"
    ]);
    let csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_profiles.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      maxWidth: 1200,
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
          All User Profiles
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          Superadmin Dashboard
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
                <th style={thStyle}>Mobile No</th>
                <th style={thStyle}>PF No</th>
                <th style={thStyle}>HRMS ID</th>
                <th style={thStyle}>Date of Birth</th>
                <th style={thStyle}>Date of Joining</th>
                <th style={thStyle}>Date of Retirement</th>
                <th style={thStyle}>Assigned Machine</th>
                <th style={thStyle}>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={tdStyle}>{u.name || "--"}</td>
                  <td style={tdStyle}>{u.mobileNo || "--"}</td>
                  <td style={tdStyle}>{u.pfNo || "--"}</td>
                  <td style={tdStyle}>{u.hrmsId || "--"}</td>
                  <td style={tdStyle}>{formatDate(u.dob)}</td>
                  <td style={tdStyle}>{formatDate(u.dateOfJoining)}</td>
                  <td style={tdStyle}>{formatDate(u.dateOfRetirement)}</td>
                  <td style={{
                    ...tdStyle,
                    background: "#e3f2fd",
                    color: "#1976d2",
                    fontWeight: 600
                  }}>{u.assignedMachine || "--"}</td>
                  <td style={tdStyle}>{u.email || "--"}</td>
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
  textAlign: "left",
  whiteSpace: "nowrap"
};
const tdStyle = {
  padding: "8px 6px",
  fontSize: 14,
  color: "#222",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  whiteSpace: "nowrap"
};
