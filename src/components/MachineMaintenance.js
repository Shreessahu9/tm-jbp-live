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

export default function MachineMaintenance() {
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engineHourInput, setEngineHourInput] = useState({
    engineHour: "",
    machineSiding: "",
    coachSiding: ""
  });
  const [saving, setSaving] = useState(false);
  const [scheduleInput, setScheduleInput] = useState({});
  const [serviceInput, setServiceInput] = useState({
    type: "machine",
    date: "",
    engineHour: "",
    siding: ""
  });
  const [errors, setErrors] = useState({});
  const [serviceErrors, setServiceErrors] = useState({});

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const assignedMachineId = userSnap.data().assignedMachine;
      if (!assignedMachineId) {
        setLoading(false);
        return;
      }
      const machineSnap = await getDoc(doc(db, "machines", assignedMachineId));
      if (machineSnap.exists()) {
        setMachine({ id: assignedMachineId, ...machineSnap.data() });
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Engine Hour Update
  const handleEngineHourChange = e => {
    setEngineHourInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEngineHour = () => {
    const err = {};
    if (!engineHourInput.engineHour) err.engineHour = "Required";
    if (!engineHourInput.machineSiding.trim()) err.machineSiding = "Required";
    if (!engineHourInput.coachSiding.trim()) err.coachSiding = "Required";
    return err;
  };

  const handleEngineHourSave = async () => {
    const err = validateEngineHour();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setSaving(true);
    const now = new Date().toISOString().slice(0, 10);
    const newEntry = {
      date: now,
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
    // Refresh
    const machineSnap = await getDoc(doc(db, "machines", machine.id));
    setMachine({ id: machine.id, ...machineSnap.data() });
    setEngineHourInput({ engineHour: "", machineSiding: "", coachSiding: "" });
    setErrors({});
    setSaving(false);
  };

  // Schedule Maintenance Update
  const handleScheduleChange = (hrs, key, value) => {
    setScheduleInput(prev => ({
      ...prev,
      [hrs]: { ...prev[hrs], [key]: value }
    }));
  };

  const handleScheduleSave = async hrs => {
    const input = scheduleInput[hrs];
    if (!input?.date || !input?.engineHour) {
      alert("Both fields required!");
      return;
    }
    setSaving(true);
    const updated = {
      ...machine.scheduleMaintenance,
      [hrs]: { date: input.date, engineHour: Number(input.engineHour) }
    };
    await updateDoc(doc(db, "machines", machine.id), {
      scheduleMaintenance: updated
    });
    // Refresh
    const machineSnap = await getDoc(doc(db, "machines", machine.id));
    setMachine({ id: machine.id, ...machineSnap.data() });
    setScheduleInput(prev => ({ ...prev, [hrs]: { date: "", engineHour: "" } }));
    setSaving(false);
  };

  // Service Engineer Attendance Entry
  const handleServiceInputChange = e => {
    setServiceInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateServiceInput = () => {
    const err = {};
    if (!serviceInput.type) err.type = "Required";
    if (!serviceInput.date) err.date = "Required";
    if (!serviceInput.engineHour) err.engineHour = "Required";
    if (!serviceInput.siding.trim()) err.siding = "Required";
    return err;
  };

  const handleServiceSave = async () => {
    const err = validateServiceInput();
    setServiceErrors(err);
    if (Object.keys(err).length > 0) return;
    setSaving(true);
    const newEntry = {
      type: serviceInput.type,
      date: serviceInput.date,
      engineHour: Number(serviceInput.engineHour),
      siding: serviceInput.siding
    };
    await updateDoc(doc(db, "machines", machine.id), {
      serviceEngineerHistory: arrayUnion(newEntry)
    });
    // Refresh
    const machineSnap = await getDoc(doc(db, "machines", machine.id));
    setMachine({ id: machine.id, ...machineSnap.data() });
    setServiceInput({ type: "machine", date: "", engineHour: "", siding: "" });
    setServiceErrors({});
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!machine) return <div>No assigned machine found.</div>;

  // Latest engine hour entry
  const sortedHistory = (machine.engineHourHistory || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestEntry = sortedHistory[0];

  // Service engineer attendance (latest only)
  const serviceHistory = (machine.serviceEngineerHistory || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestMachine = serviceHistory.find(e => e.type === "machine");
  const latestEngine = serviceHistory.find(e => e.type === "engine");

  return (
    <div style={{
      maxWidth: 750,
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
          Machine Maintenance - {machine.name}
        </h2>
      </div>
      <div style={{ padding: 28 }}>
        {/* Section 1: Engine Hours */}
        <h3 style={{ color: "#1976d2", marginBottom: 10 }}>Engine Hours</h3>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            type="text"
            name="engineHour"
            value={engineHourInput.engineHour}
            onChange={handleEngineHourChange}
            placeholder="Latest Engine Hour"
            style={{ ...inputStyle, MozAppearance: "textfield" }}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
          <input
            type="text"
            name="machineSiding"
            value={engineHourInput.machineSiding}
            onChange={handleEngineHourChange}
            placeholder="Machine Siding"
            style={inputStyle}
          />
          <input
            type="text"
            name="coachSiding"
            value={engineHourInput.coachSiding}
            onChange={handleEngineHourChange}
            placeholder="Coach Siding"
            style={inputStyle}
          />
          <button onClick={handleEngineHourSave} disabled={saving} style={btnStyleBlue}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div style={{ color: "#e53935", fontSize: 13, marginBottom: 6 }}>
          {Object.values(errors).map(e => <div key={e}>{e}</div>)}
        </div>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "10px 0 4px 0" }}>Latest Entry</h4>
          {latestEntry ? (
            <div style={entryCardStyle}>
              <b>Date:</b> {formatDate(latestEntry.date)} &nbsp;
              <b>Engine Hour:</b> {latestEntry.engineHour} &nbsp;
              <b>Machine Siding:</b> {latestEntry.machineSiding} &nbsp;
              <b>Coach Siding:</b> {latestEntry.coachSiding}
            </div>
          ) : <div style={{ color: "#bbb" }}>No entry yet.</div>}
        </div>

        {/* Section 2: Schedule Maintenance */}
        <h3 style={{ color: "#1976d2", margin: "28px 0 10px 0" }}>Schedule Maintenance</h3>
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
                <th style={thStyle}>Schedule</th>
                <th style={thStyle}>Schedule Date</th>
                <th style={thStyle}>Engine Hour</th>
                <th style={thStyle}>Expiry Engine Hour</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Update</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULES.map(hrs => {
                const record = machine.scheduleMaintenance?.[hrs] || {};
                const scheduleDate = record.date || "";
                const scheduleEngineHour = record.engineHour || "";
                const expiryHour = scheduleEngineHour ? Number(scheduleEngineHour) + hrs : "";
                const latestEngineHour = machine.latestEngineHour || 0;
                const valid = scheduleEngineHour && latestEngineHour <= expiryHour;
                return (
                  <tr key={hrs}>
                    <td style={tdStyle}>{hrs} HRS</td>
                    <td style={tdStyle}>{formatDate(scheduleDate)}</td>
                    <td style={tdStyle}>{scheduleEngineHour || "--"}</td>
                    <td style={tdStyle}>{expiryHour || "--"}</td>
                    <td style={{
                      ...tdStyle,
                      background: scheduleEngineHour ? (valid ? "#e8f5e9" : "#ffebee") : "#eee",
                      color: scheduleEngineHour ? (valid ? "#388e3c" : "#c62828") : "#888",
                      fontWeight: 600
                    }}>
                      {scheduleEngineHour ? (valid ? "Valid" : "Due") : "--"}
                    </td>
                    <td style={tdStyle}>
                      <input type="date" value={scheduleInput[hrs]?.date || ""} onChange={e => handleScheduleChange(hrs, "date", e.target.value)} style={{ ...inputStyle, width: 120 }} />
                      <input type="number" value={scheduleInput[hrs]?.engineHour || ""} onChange={e => handleScheduleChange(hrs, "engineHour", e.target.value)} placeholder="E.Hrs." style={{ ...inputStyle, width: 80, marginLeft: 6 }} />
                      <button onClick={() => handleScheduleSave(hrs)} disabled={saving} style={{ ...btnStyleBlue, marginLeft: 6, padding: "6px 10px", fontSize: 13 }}>Save</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 3: Service Engineer Attendance */}
        <h3 style={{ color: "#1976d2", margin: "28px 0 10px 0" }}>Service Engineer Attendance</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <select name="type" value={serviceInput.type} onChange={handleServiceInputChange} style={inputStyle}>
            <option value="machine">Machine</option>
            <option value="engine">Engine</option>
          </select>
          <input type="date" name="date" value={serviceInput.date} onChange={handleServiceInputChange} style={inputStyle} />
          <input
            type="text"
            name="engineHour"
            value={serviceInput.engineHour}
            onChange={handleServiceInputChange}
            placeholder="Engine Hour"
            style={{ ...inputStyle, MozAppearance: "textfield" }}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
          <input type="text" name="siding" value={serviceInput.siding} onChange={handleServiceInputChange} placeholder="Siding" style={inputStyle} />
          <button onClick={handleServiceSave} disabled={saving} style={btnStyleGreen}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div style={{ color: "#e53935", fontSize: 13, marginBottom: 6 }}>
          {Object.values(serviceErrors).map(e => <div key={e}>{e}</div>)}
        </div>

        {/* Display Only Latest Service Engineer Attendance */}
        <div style={{ marginTop: 22 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Latest Service Engineer Attendance</h4>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <b>Machine:</b>
              {latestMachine ? (
                <div style={entryCardStyle}>
                  <b>Date:</b> {formatDate(latestMachine.date)}<br />
                  <b>Engine Hour:</b> {latestMachine.engineHour}<br />
                  <b>Siding:</b> {latestMachine.siding}
                </div>
              ) : <div style={{ color: "#bbb" }}>--</div>}
            </div>
            <div>
              <b>Engine:</b>
              {latestEngine ? (
                <div style={entryCardStyle}>
                  <b>Date:</b> {formatDate(latestEngine.date)}<br />
                  <b>Engine Hour:</b> {latestEngine.engineHour}<br />
                  <b>Siding:</b> {latestEngine.siding}
                </div>
              ) : <div style={{ color: "#bbb" }}>--</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  padding: "9px 10px",
  border: "1px solid #bbb",
  borderRadius: 4,
  fontSize: 15
};
const btnStyleBlue = {
  background: "#1976d2",
  color: "#fff",
  padding: "10px 18px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
const btnStyleGreen = {
  background: "#388e3c",
  color: "#fff",
  padding: "10px 18px",
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
  textAlign: "center"
};
const tdStyle = {
  padding: "8px 6px",
  fontSize: 14,
  color: "#222",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  textAlign: "center"
};
const entryCardStyle = {
  background: "#f5faff",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 6,
  color: "#1976d2",
  fontWeight: 600,
  fontSize: 15,
  display: "inline-block"
};
