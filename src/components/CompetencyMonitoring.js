import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function addYears(dateStr, years) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}
function addMonths(dateStr, months) {
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
  return new Date(expiryDate) >= new Date();
}

export default function CompetencyMonitoring() {
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    assignedMachine: "",
    pmeDate: "",
    irtmmDate: "",
    gsrDate: "",
    blockCompetencyDate: "",
    liCounsellingDate: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setProfile(prev => ({ ...prev, ...docSnap.data() }));
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // PME Expiry Logic
  let pmeExpiry = "";
  let pmeStatus = "Due";
  if (profile.pmeDate && profile.dob) {
    const age = getAge(profile.dob);
    if (age < 45) pmeExpiry = addYears(profile.pmeDate, 4);
    else if (age < 55) pmeExpiry = addYears(profile.pmeDate, 2);
    else pmeExpiry = addYears(profile.pmeDate, 1);
    pmeStatus = isValid(pmeExpiry) ? "Valid" : "Due";
  }

  // IRTMM
  let irtmmExpiry = profile.irtmmDate ? addYears(profile.irtmmDate, 3) : "";
  let irtmmStatus = irtmmExpiry && isValid(irtmmExpiry) ? "Valid" : "Due";

  // G&SR
  let gsrExpiry = profile.gsrDate ? addYears(profile.gsrDate, 3) : "";
  let gsrStatus = gsrExpiry && isValid(gsrExpiry) ? "Valid" : "Due";

  // Block Competency
  let blockExpiry = profile.blockCompetencyDate ? addYears(profile.blockCompetencyDate, 1) : "";
  let blockStatus = blockExpiry && isValid(blockExpiry) ? "Valid" : "Due";

  // LI Counselling
  let liExpiry = profile.liCounsellingDate ? addMonths(profile.liCounsellingDate, 3) : "";
  let liStatus = liExpiry && isValid(liExpiry) ? "Valid" : "Due";

  // Machine Competency
  let machineCompetencyValid =
    pmeStatus === "Valid" && irtmmStatus === "Valid" && gsrStatus === "Valid";

  const handleChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      pmeDate: profile.pmeDate,
      irtmmDate: profile.irtmmDate,
      gsrDate: profile.gsrDate,
      blockCompetencyDate: profile.blockCompetencyDate,
      liCounsellingDate: profile.liCounsellingDate
    });
    setSaving(false);
    alert("Competency details updated!");
  };

  return (
    <div style={{
      maxWidth: 650,
      margin: "40px auto",
      background: "#f5f8fd",
      borderRadius: 18,
      boxShadow: "0 2px 16px #1976d220",
      padding: 0,
      overflow: "hidden"
    }}>
      <div style={{
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        padding: "30px 0 20px 0",
        textAlign: "center",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18
      }}>
        <h2 style={{ color: "#fff", margin: 0, fontWeight: 800, letterSpacing: 1, fontSize: 28 }}>
          Competency Monitoring
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 17, marginTop: 5 }}>
          PME, IRTMM, G&SR, Block Competency, LI Counselling
        </div>
      </div>
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#1976d2" }}>
            {profile.name}
          </div>
          <div style={{ color: "#888", fontSize: 15 }}>
            Assigned Machine: <b>{profile.assignedMachine || "--"}</b>
          </div>
        </div>
        <Section
          label="PME"
          date={profile.pmeDate}
          onChange={handleChange}
          name="pmeDate"
          expiry={pmeExpiry}
          status={pmeStatus}
        />
        <Section
          label="IRTMM"
          date={profile.irtmmDate}
          onChange={handleChange}
          name="irtmmDate"
          expiry={irtmmExpiry}
          status={irtmmStatus}
        />
        <Section
          label="G & SR"
          date={profile.gsrDate}
          onChange={handleChange}
          name="gsrDate"
          expiry={gsrExpiry}
          status={gsrStatus}
        />
        <Section
          label="Block Competency"
          date={profile.blockCompetencyDate}
          onChange={handleChange}
          name="blockCompetencyDate"
          expiry={blockExpiry}
          status={blockStatus}
        />
        <Section
          label="LI Counselling"
          date={profile.liCounsellingDate}
          onChange={handleChange}
          name="liCounsellingDate"
          expiry={liExpiry}
          status={liStatus}
        />

        <div style={{
          margin: "40px 0 18px 0",
          padding: "22px 16px",
          background: machineCompetencyValid ? "#e8f5e9" : "#fff3e0",
          color: machineCompetencyValid ? "#388e3c" : "#e65100",
          borderRadius: 12,
          fontWeight: 700,
          textAlign: "center",
          fontSize: 20,
          letterSpacing: 1.1,
          boxShadow: "0 1px 6px #1976d210"
        }}>
          Machine Competency: {machineCompetencyValid ? "Valid" : "Due"}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 17,
            border: "none",
            borderRadius: 7,
            padding: "14px 0",
            marginTop: 8,
            cursor: "pointer",
            boxShadow: "0 1px 6px #1976d220",
            letterSpacing: 1
          }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function Section({ label, date, onChange, name, expiry, status }) {
  return (
    <div style={{
      marginBottom: 22,
      padding: "18px 20px",
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 1px 6px #1976d210",
      display: "flex",
      alignItems: "center",
      gap: 22,
      flexWrap: "wrap"
    }}>
      <div style={{ flex: 1, minWidth: 130 }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#1976d2" }}>{label}</span>
        <input
          type="date"
          name={name}
          value={date || ""}
          onChange={onChange}
          style={{
            marginLeft: 18,
            padding: 8,
            borderRadius: 5,
            border: "1.5px solid #b0bec5",
            fontSize: 15,
            background: "#f7fafc",
            fontWeight: 500
          }}
        />
      </div>
      <div style={{ minWidth: 120, textAlign: "center" }}>
        <span style={{
          display: "inline-block",
          background: "#e3f2fd",
          color: "#1976d2",
          padding: "4px 12px",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 15,
          marginBottom: 3
        }}>Expiry</span>
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          color: "#1976d2"
        }}>{expiry || "--"}</div>
      </div>
      <div style={{
        minWidth: 80,
        textAlign: "center"
      }}>
        <span style={{
          display: "inline-block",
          background: status === "Valid" ? "#e8f5e9" : "#ffebee",
          color: status === "Valid" ? "#388e3c" : "#e65100",
          padding: "6px 18px",
          borderRadius: 7,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 1
        }}>
          {status}
        </span>
      </div>
    </div>
  );
}
