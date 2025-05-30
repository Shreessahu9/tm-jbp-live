import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";

const SCHEDULES = [50, 100, 200, 1000, 2000, 8000];

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export default function UserMachinePage() {
  const [machine, setMachine] = useState(null);
  const [engineHourInput, setEngineHourInput] = useState({
    engineHour: "",
    machineSiding: "",
    coachSiding: ""
  });
  const [saving, setSaving] = useState(false);
  const [userMachines, setUserMachines] = useState([]);

  // Fetch user's assigned machines
  useEffect(() => {
    async function fetchMachine() {
      const user = auth.currentUser;
      if (!user) return;
      // get user doc
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const assignedMachineId = userSnap.data().assignedMachine;
      if (!assignedMachineId) return;
      setUserMachines([assignedMachineId]);
      // get machine doc
      const machineSnap = await getDoc(doc(db, "machines", assignedMachineId));
      if (machineSnap.exists()) setMachine({ id: assignedMachineId, ...machineSnap.data() });
    }
    fetchMachine();
  }, []);

  // Engine Hour Entry
  const handleEngineHourChange = e => {
    setEngineHourInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEngineHourSave = async () => {
    if (!machine) return;
    setSaving(true);
    // Update machine doc
    const newEntry = {
      date: new Date().toISOString().slice(0, 10),
      engineHour: Number(engineHourInput.engineHour),
      machineSiding: engineHourInput.machineSiding,
      coachSiding: engineHourInput.coachSiding
    };
    await updateDoc(doc(db, "machines", machine.id), {
      latestEngineHour: Number(engineHourInput.engineHour),
      latestMachineSiding: engineHourInput.machineSiding,
      latestCoachSiding: engineHourInput.coachSiding,
      engineHourHistory: arrayUnion(newEntry)
    });
    // Refresh data
    const machineSnap = await getDoc(doc(db, "machines", machine.id));
    setMachine({ id: machine.id, ...machineSnap.data() });
    setEngineHourInput({ engineHour: "", machineSiding: "", coachSiding: "" });
    setSaving(false);
    alert("Engine hour updated!");
  };

  if (!machine) return <div>Loading...</div>;

  // Engine Hour History (latest first)
  const engineHourHistory = (machine.engineHourHistory || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  // Schedule Maintenance Valid/Due Calculation
  const latestEngineHour = Number(machine.latestEngineHour) || 0;
  const scheduleStatus = SCHEDULES.map(sch => {
    const schData = machine.scheduleMaintenance?.[sch] || {};
    const schEngineHour = Number(schData.engineHour) || 0;
    const valid = schEngineHour && latestEngineHour < (schEngineHour + sch);
    return {
      sch,
      date: schData.date || "",
      engineHour: schData.engineHour || "",
      valid
    };
  });

  // Last and 2nd Last Service Engineer Attendance
  const machineService = (machine.serviceEngineer || []).filter(e => e.type === "machine");
  const engineService = (machine.serviceEngineer || []).filter(e => e.type === "engine");

  return (
    <div style={{
      maxWidth: 700,
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
        <h2 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
          Machine: {machine.name}
        </h2>
      </div>

      {/* Section 1: Engine Hours */}
      <div style={{ padding: 28 }}>
        <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Engine Hours Entry</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          <input type="number" name="engineHour" placeholder="Latest Engine Hour" value={engineHourInput.engineHour} onChange={handleEngineHourChange} style={inputStyle} />
          <input type="text" name="machineSiding" placeholder="Machine Siding" value={engineHourInput.machineSiding} onChange={handleEngineHourChange} style={inputStyle} />
          <input type="text" name="coachSiding" placeholder="Coach Siding" value={engineHourInput.coachSiding} onChange={handleEngineHourChange} style={inputStyle} />
          <button onClick={handleEngineHourSave} disabled={saving} style={btnStyleBlue}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 8 }}>Update History</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafbfc" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Machine Siding</th>
                <th style={thStyle}>Coach Siding</th>
              </tr>
            </thead>
            <tbody>
              {engineHourHistory.map((entry, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{formatDate(entry.date)}</td>
                  <td style={tdStyle}>{entry.engineHour}</td>
                  <td style={tdStyle}>{entry.machineSiding}</td>
                  <td style={tdStyle}>{entry.coachSiding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Schedule Maintenance */}
      <div style={{ padding: 28, borderTop: "1px solid #eee" }}>
        <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Schedule Maintenance</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafbfc" }}>
          <thead>
            <tr>
              <th style={thStyle}>Schedule</th>
              <th style={thStyle}>Schedule Date</th>
              <th style={thStyle}>Engine Hour</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduleStatus.map(row => (
              <tr key={row.sch}>
                <td style={tdStyle}>{row.sch} Hrs</td>
                <td style={tdStyle}>{formatDate(row.date)}</td>
                <td style={tdStyle}>{row.engineHour}</td>
                <td style={{
                  ...tdStyle,
                  background: row.valid ? "#e8f5e9" : "#ffebee",
                  color: row.valid ? "#388e3c" : "#c62828",
                  fontWeight: 600
                }}>
                  {row.valid ? "Valid" : "Due"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Last and 2nd Last Service Engineer Attendance */}
        <div style={{ marginTop: 28 }}>
          <h4>Last Service Engineer Attendance (Machine)</h4>
          {machineService[0] ? (
            <div>
              <b>Date:</b> {formatDate(machineService[0].date)} | <b>Engine Hour:</b> {machineService[0].engineHour} | <b>Siding:</b> {machineService[0].siding}
            </div>
          ) : <div style={{ color: "#bbb" }}>No data</div>}
          <h4 style={{ marginTop: 16 }}>2nd Last Service Engineer Attendance (Machine)</h4>
          {machineService[1] ? (
            <div>
              <b>Date:</b> {formatDate(machineService[1].date)} | <b>Engine Hour:</b> {machineService[1].engineHour} | <b>Siding:</b> {machineService[1].siding}
            </div>
          ) : <div style={{ color: "#bbb" }}>No data</div>}

          <h4 style={{ marginTop: 28 }}>Last Service Engineer Attendance (Engine)</h4>
          {engineService[0] ? (
            <div>
              <b>Date:</b> {formatDate(engineService[0].date)} | <b>Engine Hour:</b> {engineService[0].engineHour} | <b>Siding:</b> {engineService[0].siding}
            </div>
          ) : <div style={{ color: "#bbb" }}>No data</div>}
          <h4 style={{ marginTop: 16 }}>2nd Last Service Engineer Attendance (Engine)</h4>
          {engineService[1] ? (
            <div>
              <b>Date:</b> {formatDate(engineService[1].date)} | <b>Engine Hour:</b> {engineService[1].engineHour} | <b>Siding:</b> {engineService[1].siding}
            </div>
          ) : <div style={{ color: "#bbb" }}>No data</div>}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "9px 12px",
  border: "1px solid #bbb",
  borderRadius: 4,
  fontSize: 15,
  minWidth: 120
};
const btnStyleBlue = {
  background: "#1976d2",
  color: "#fff",
  padding: "12px 22px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
const thStyle = {
  padding: "10px 6px",
  fontWeight: 700,
  fontSize: 15,
  color: "#1976d2",
  borderBottom: "2px solid #e3f2fd",
  textAlign: "left"
};
const tdStyle = {
  padding: "8px 6px",
  fontSize: 14,
  color: "#222",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff"
};


