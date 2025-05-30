import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

export default function MachineAssignDashboard() {
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Real-time users and machines fetch
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

  // Assignment Logic: Only one machine per user
  const handleAssign = async () => {
    if (!selectedUser || !selectedMachine) return;
    setAssigning(true);

    const userRef = doc(db, "users", selectedUser.id);
    const userSnap = await getDoc(userRef);
    const prevMachineId = userSnap.data().assignedMachine;

    // 1. Update user's assignedMachine
    await updateDoc(userRef, { assignedMachine: selectedMachine });

    // 2. Add user to new machine's assignedUsers
    const newMachineRef = doc(db, "machines", selectedMachine);
    await updateDoc(newMachineRef, { assignedUsers: arrayUnion(selectedUser.id) });

    // 3. Remove user from previous machine's assignedUsers (if any)
    if (prevMachineId && prevMachineId !== selectedMachine) {
      const prevMachineRef = doc(db, "machines", prevMachineId);
      await updateDoc(prevMachineRef, { assignedUsers: arrayRemove(selectedUser.id) });
    }

    setAssigning(false);
    setSelectedUser(null);
    setSelectedMachine("");
    alert("Machine assigned!");
  };

  return (
    <div style={{
      maxWidth: 1000,
      margin: "40px auto",
      padding: 0,
      borderRadius: 16,
      boxShadow: "0 2px 16px #0001",
      background: "#fff",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        padding: "28px 0 18px 0",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: 1 }}>
          Machine Assign Dashboard
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          Assign one machine per user (real-time update)
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: 32 }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "#fafbfc",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 4px #1976d210"
        }}>
          <thead>
            <tr style={{ background: "#e3f2fd" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Assigned Machine</th>
              <th style={thStyle}>Select</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{
                  background: selectedUser?.id === u.id ? "#e3f2fd" : "#fff",
                  transition: "background 0.2s"
                }}
              >
                <td style={tdStyle}>{u.name || <span style={{ color: "#bbb" }}>No Name</span>}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  {u.assignedMachine
                    ? (machines.find(m => m.id === u.assignedMachine)?.name || u.assignedMachine)
                    : <span style={{ color: "#bbb" }}>None</span>}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setSelectedUser(u)}
                    style={{
                      background: selectedUser?.id === u.id ? "#1976d2" : "#eee",
                      color: selectedUser?.id === u.id ? "#fff" : "#222",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}>
                    {selectedUser?.id === u.id ? "Selected" : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Assign Machine UI */}
        <div style={{
          marginTop: 32,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: "#f5faff",
          padding: "18px 24px",
          borderRadius: 8,
          boxShadow: "0 1px 4px #1976d210"
        }}>
          <div style={{ flex: 1 }}>
            <b>Select Machine:</b>
            <select
              value={selectedMachine}
              onChange={e => setSelectedMachine(e.target.value)}
              style={{
                marginLeft: 12,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #bbb",
                fontSize: 15,
                minWidth: 180
              }}>
              <option value="">Select Machine</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name || m.id}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedUser || !selectedMachine || assigning}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "12px 32px",
              fontWeight: "bold",
              fontSize: 16,
              cursor: (!selectedUser || !selectedMachine || assigning) ? "not-allowed" : "pointer",
              opacity: (!selectedUser || !selectedMachine || assigning) ? 0.6 : 1,
              transition: "background 0.2s"
            }}>
            {assigning ? "Assigning..." : "Assign Machine"}
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px 10px",
  fontWeight: 700,
  fontSize: 16,
  color: "#1976d2",
  borderBottom: "2px solid #e3f2fd",
  textAlign: "left"
};

const tdStyle = {
  padding: "12px 10px",
  fontSize: 15,
  color: "#222",
  borderBottom: "1px solid #f0f0f0"
};
