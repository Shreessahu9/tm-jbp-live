import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

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

export default function RoadLearning() {
  const [roadLearning, setRoadLearning] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setRoadLearning(docSnap.data().roadLearning || {});
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setRoadLearning(prev => ({
      ...prev,
      [key]: { date: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      roadLearning
    });
    setSaving(false);
    alert("Road Learning updated!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{
      maxWidth: 600,
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
          Road Learning
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 16 }}>
          Enter LRD dates for sections. Validity: 3 months
        </div>
      </div>
      <div style={{ padding: 28 }}>
        {SECTIONS.map(sec => {
          const start = roadLearning[sec.key]?.date || "";
          const expiry = start ? addMonths(start, 3) : "";
          const valid = start && isValid(expiry);
          return (
            <div key={sec.key} style={{
              marginBottom: 18,
              padding: "14px 16px",
              background: "#fafbfc",
              borderRadius: 8,
              boxShadow: "0 1px 4px #1976d210",
              display: "flex",
              alignItems: "center",
              gap: 18
            }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <b>{sec.label}</b>
                <input
                  type="date"
                  value={start}
                  onChange={e => handleChange(sec.key, e.target.value)}
                  style={{
                    marginLeft: 16,
                    padding: 7,
                    borderRadius: 4,
                    border: "1px solid #bbb",
                    fontSize: 15
                  }}
                />
              </div>
              <div style={{
                minWidth: 110,
                textAlign: "center",
                background: start ? (valid ? "#e8f5e9" : "#ffebee") : "#eee",
                color: start ? (valid ? "#388e3c" : "#c62828") : "#888",
                borderRadius: 6,
                padding: "7px 0",
                fontWeight: 600,
                fontSize: 15
              }}>
                {start ? formatDate(expiry) : "--"}
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                  {start ? (valid ? "Valid" : "Due") : ""}
                </div>
              </div>
            </div>
          );
        })}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            border: "none",
            borderRadius: 6,
            padding: "12px 0",
            marginTop: 8,
            cursor: "pointer",
            transition: "background 0.2s"
          }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

