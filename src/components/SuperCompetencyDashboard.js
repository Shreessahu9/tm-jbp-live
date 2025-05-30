import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Date helpers
function addYears(dateStr, years) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}
function addMonths(dateStr, months) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
function getAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
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

export default function SuperCompetencyDashboard() {
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMachines = onSnapshot(collection(db, "machines"), (snap) => {
      setMachines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsubUsers();
      unsubMachines();
    };
  }, []);

  // Helper for machine name
  const getMachineName = (machineId) =>
    machines.find(m => m.id === machineId)?.name || machineId || "--";

  // Table Data Calculation
  const tableData = users.map(u => {
    const age = getAge(u.dob);

    // PME
    let pmeExpiry = "";
    if (u.pmeDate) {
      if (age < 45) pmeExpiry = addYears(u.pmeDate, 4);
      else if (age < 55) pmeExpiry = addYears(u.pmeDate, 2);
      else pmeExpiry = addYears(u.pmeDate, 1);
    }
    const pmeValid = !!pmeExpiry && isValid(pmeExpiry);

    // IRTMM
    let irtmmExpiry = u.irtmmDate ? addYears(u.irtmmDate, 3) : "";
    const irtmmValid = !!irtmmExpiry && isValid(irtmmExpiry);

    // G&SR
    let gsrExpiry = u.gsrDate ? addYears(u.gsrDate, 3) : "";
    const gsrValid = !!gsrExpiry && isValid(gsrExpiry);

    // Block Competency
    let blockExpiry = u.blockCompetencyDate ? addYears(u.blockCompetencyDate, 1) : "";
    const blockValid = !!blockExpiry && isValid(blockExpiry);

    // LI Counselling
    let liExpiry = u.liCounsellingDate ? addMonths(u.liCounsellingDate, 3) : "";
    const liValid = !!liExpiry && isValid(liExpiry);

    // Machine Competency
    const machineCompetencyValid = pmeValid && irtmmValid && gsrValid;

    return {
      id: u.id,
      name: u.name || "--",
      machine: getMachineName(u.assignedMachine),
      pmeStart: u.pmeDate || "",
      pmeExpiry,
      pmeValid,
      irtmmStart: u.irtmmDate || "",
      irtmmExpiry,
      irtmmValid,
      gsrStart: u.gsrDate || "",
      gsrExpiry,
      gsrValid,
      blockStart: u.blockCompetencyDate || "",
      blockExpiry,
      blockValid,
      liStart: u.liCounsellingDate || "",
      liExpiry,
      liValid,
      machineCompetencyValid
    };
  });

  // Filter logic
  const filteredData = tableData.filter(row => {
    if (filter === "All") return true;
    if (filter === "PME Due") return !row.pmeValid;
    if (filter === "IRTMM Due") return !row.irtmmValid;
    if (filter === "GSR Due") return !row.gsrValid;
    if (filter === "Block Due") return !row.blockValid;
    if (filter === "LI Due") return !row.liValid;
    if (filter === "Machine Competency Due") return !row.machineCompetencyValid;
    return true;
  });

  // Excel/CSV Download
  function downloadCSV() {
    const headers = [
      "Name", "Machine",
      "PME Start", "PME Expiry",
      "IRTMM Start", "IRTMM Expiry",
      "GSR Start", "GSR Expiry",
      "Block Start", "Block Expiry",
      "LI Start", "LI Expiry",
      "Machine Competency"
    ];
    const rows = filteredData.map(row => [
      row.name, row.machine,
      formatDate(row.pmeStart), formatDate(row.pmeExpiry),
      formatDate(row.irtmmStart), formatDate(row.irtmmExpiry),
      formatDate(row.gsrStart), formatDate(row.gsrExpiry),
      formatDate(row.blockStart), formatDate(row.blockExpiry),
      formatDate(row.liStart), formatDate(row.liExpiry),
      row.machineCompetencyValid ? "Valid" : "Due"
    ]);
    let csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competency_dashboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      maxWidth: 1400, // wider for desktop
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
          Competency Monitoring Dashboard
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          All Users' Competency Status
        </div>
      </div>
      <div style={{ padding: 28 }}>
        {/* Filters */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <b>Filter:</b>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #bbb" }}>
            <option value="All">All</option>
            <option value="PME Due">PME Due</option>
            <option value="IRTMM Due">IRTMM Due</option>
            <option value="GSR Due">G & SR Due</option>
            <option value="Block Due">Block Competency Due</option>
            <option value="LI Due">LI Counselling Due</option>
            <option value="Machine Competency Due">Machine Competency Due</option>
          </select>
          <button
            onClick={downloadCSV}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: "bold",
              fontSize: 15,
              cursor: "pointer"
            }}>
            Download Excel
          </button>
        </div>
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
                <th style={thStyle}>Machine</th>
                <th style={thStyle}>PME Start</th>
                <th style={thStyle}>PME Expiry</th>
                <th style={thStyle}>IRTMM Start</th>
                <th style={thStyle}>IRTMM Expiry</th>
                <th style={thStyle}>G & SR Start</th>
                <th style={thStyle}>G & SR Expiry</th>
                <th style={thStyle}>Block Start</th>
                <th style={thStyle}>Block Expiry</th>
                <th style={thStyle}>LI Start</th>
                <th style={thStyle}>LI Expiry</th>
                <th style={thStyle}>Machine Competency</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.name}</td>
                  <td style={tdStyle}>{row.machine}</td>
                  {/* PME */}
                  <td style={tdStyle}>{formatDate(row.pmeStart)}</td>
                  <td style={{
                    ...tdStyle,
                    background: row.pmeValid ? "#e8f5e9" : "#ffebee",
                    color: row.pmeValid ? "#388e3c" : "#c62828",
                    fontWeight: 600
                  }}>
                    {formatDate(row.pmeExpiry)}
                  </td>
                  {/* IRTMM */}
                  <td style={tdStyle}>{formatDate(row.irtmmStart)}</td>
                  <td style={{
                    ...tdStyle,
                    background: row.irtmmValid ? "#e8f5e9" : "#ffebee",
                    color: row.irtmmValid ? "#388e3c" : "#c62828",
                    fontWeight: 600
                  }}>
                    {formatDate(row.irtmmExpiry)}
                  </td>
                  {/* GSR */}
                  <td style={tdStyle}>{formatDate(row.gsrStart)}</td>
                  <td style={{
                    ...tdStyle,
                    background: row.gsrValid ? "#e8f5e9" : "#ffebee",
                    color: row.gsrValid ? "#388e3c" : "#c62828",
                    fontWeight: 600
                  }}>
                    {formatDate(row.gsrExpiry)}
                  </td>
                  {/* Block */}
                  <td style={tdStyle}>{formatDate(row.blockStart)}</td>
                  <td style={{
                    ...tdStyle,
                    background: row.blockValid ? "#e8f5e9" : "#ffebee",
                    color: row.blockValid ? "#388e3c" : "#c62828",
                    fontWeight: 600
                  }}>
                    {formatDate(row.blockExpiry)}
                  </td>
                  {/* LI */}
                  <td style={tdStyle}>{formatDate(row.liStart)}</td>
                  <td style={{
                    ...tdStyle,
                    background: row.liValid ? "#e8f5e9" : "#ffebee",
                    color: row.liValid ? "#388e3c" : "#c62828",
                    fontWeight: 600
                  }}>
                    {formatDate(row.liExpiry)}
                  </td>
                  {/* Machine Competency */}
                  <td style={{
                    ...tdStyle,
                    background: row.machineCompetencyValid ? "#e8f5e9" : "#fff3e0",
                    color: row.machineCompetencyValid ? "#388e3c" : "#e65100",
                    fontWeight: 700
                  }}>
                    {row.machineCompetencyValid ? "Valid" : "Due"}
                  </td>
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
