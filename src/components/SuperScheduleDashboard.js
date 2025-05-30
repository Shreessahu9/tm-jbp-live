import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const SCHEDULES = [50, 100, 200, 1000, 2000, 8000];

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function isDue(machine, hrs) {
  const record = machine.scheduleMaintenance?.[hrs];
  if (!record?.engineHour) return false;
  const expiry = Number(record.engineHour) + hrs;
  return (machine.latestEngineHour || 0) > expiry;
}

export default function SuperScheduleDashboard() {
  const [machines, setMachines] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "machines"), (snap) => {
      setMachines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Filter logic for all schedules
  const filteredMachines = machines.filter(m => {
    if (filter === "All") return true;
    for (const hrs of SCHEDULES) {
      if (filter === `${hrs} Due` && isDue(m, hrs)) return true;
    }
    return false;
  });

  function downloadCSV() {
    const headers = [
      "Machine Name", "Latest Engine Hour", "Latest Siding",
      ...SCHEDULES.flatMap(hrs => [
        `${hrs} HRS Schedule Date`,
        `${hrs} HRS Engine Hour`
      ])
    ];
    const rows = filteredMachines.map(m => [
      m.name || m.id,
      m.latestEngineHour || "--",
      m.latestMachineSiding || "--",
      ...SCHEDULES.flatMap(hrs => [
        formatDate(m.scheduleMaintenance?.[hrs]?.date),
        m.scheduleMaintenance?.[hrs]?.engineHour || "--"
      ])
    ]);
    let csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule_dashboard.csv";
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
          Schedule Maintenance Dashboard
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          All Machines' Schedule Records
        </div>
      </div>
      <div style={{ padding: 28 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <b>Filter:</b>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #bbb" }}>
            <option value="All">All</option>
            {SCHEDULES.map(hrs => (
              <option key={hrs} value={`${hrs} Due`}>{hrs} HRS Due</option>
            ))}
          </select>
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
              {/* 2-line header */}
              <tr style={{ background: "#e3f2fd" }}>
                <th style={thStyle} rowSpan={2}>Machine Name</th>
                <th style={thStyle} rowSpan={2}>Latest Engine Hour</th>
                <th style={thStyle} rowSpan={2}>Latest Siding</th>
                {SCHEDULES.map(hrs => (
                  <th style={thStyle} key={hrs} colSpan={2}>{hrs} HRS</th>
                ))}
              </tr>
              <tr style={{ background: "#e3f2fd" }}>
                {SCHEDULES.map(hrs => (
                  <React.Fragment key={hrs}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>E.Hrs.</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map(m => (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.name || m.id}</td>
                  <td style={tdStyle}>{m.latestEngineHour || "--"}</td>
                  <td style={tdStyle}>{m.latestMachineSiding || "--"}</td>
                  {SCHEDULES.map(hrs => {
                    const record = m.scheduleMaintenance?.[hrs] || {};
                    const scheduleDate = record.date || "";
                    const scheduleEngineHour = record.engineHour || "";
                    const expiryHour = scheduleEngineHour ? Number(scheduleEngineHour) + hrs : "";
                    const latestEngineHour = m.latestEngineHour || 0;
                    const valid = scheduleEngineHour && latestEngineHour <= expiryHour;
                    const due = scheduleEngineHour && latestEngineHour > expiryHour;
                    const cellStyle = {
                      ...tdStyle,
                      background: due ? "#ffebee" : valid ? "#e8f5e9" : "#eee",
                      color: due ? "#c62828" : valid ? "#388e3c" : "#888",
                      fontWeight: 600
                    };
                    return (
                      <React.Fragment key={hrs}>
                        <td style={cellStyle}>{formatDate(scheduleDate)}</td>
                        <td style={cellStyle}>{scheduleEngineHour || "--"}</td>
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
