import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    dateOfJoining: "",
    dateOfRetirement: "",
    mobileNo: "",
    pfNo: "",
    hrmsId: "",
    assignedMachine: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchProfile() {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setProfile({
          name: docSnap.data().name || "",
          dob: docSnap.data().dob || "",
          dateOfJoining: docSnap.data().dateOfJoining || "",
          dateOfRetirement: docSnap.data().dateOfRetirement || "",
          mobileNo: docSnap.data().mobileNo || "",
          pfNo: docSnap.data().pfNo || "",
          hrmsId: docSnap.data().hrmsId || "",
          assignedMachine: docSnap.data().assignedMachine || "",
          email: docSnap.data().email || user.email || ""
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Validation: All fields required (except assignedMachine)
  const validate = () => {
    const err = {};
    if (!profile.name.trim()) err.name = "Name is required";
    if (!profile.dob) err.dob = "Date of Birth is required";
    if (!profile.dateOfJoining) err.dateOfJoining = "Date of Joining is required";
    if (!profile.dateOfRetirement) err.dateOfRetirement = "Date of Retirement is required";
    if (!profile.mobileNo.trim()) err.mobileNo = "Mobile No is required";
    if (!/^\d{10}$/.test(profile.mobileNo.trim())) err.mobileNo = "Enter valid 10 digit number";
    if (!profile.pfNo.trim()) err.pfNo = "PF No is required";
    if (!profile.hrmsId.trim()) err.hrmsId = "HRMS ID is required";
    // assignedMachine required नहीं है (user नहीं भर सकता)
    return err;
  };

  const handleChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      name: profile.name,
      dob: profile.dob,
      dateOfJoining: profile.dateOfJoining,
      dateOfRetirement: profile.dateOfRetirement,
      mobileNo: profile.mobileNo,
      pfNo: profile.pfNo,
      hrmsId: profile.hrmsId
      // assignedMachine update नहीं करना
    });
    setSaving(false);
    alert("Profile updated!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{
      maxWidth: 560,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 16px #0001",
      padding: 0,
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        padding: "36px 0 24px 0",
        textAlign: "center"
      }}>
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
          alt="profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "4px solid #fff",
            marginBottom: 8,
            objectFit: "cover",
            boxShadow: "0 2px 8px #1976d260"
          }}
        />
        <h2 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>{profile.name || "Your Name"}</h2>
        <div style={{ color: "#e3f2fd", fontSize: 15 }}>{profile.email}</div>
      </div>

      {/* Profile Form */}
      <div style={{ padding: 24 }}>
        <ProfileField label="Name" name="name" value={profile.name} onChange={handleChange} error={errors.name} />
        <ProfileField label="Mobile No" name="mobileNo" value={profile.mobileNo} onChange={handleChange} error={errors.mobileNo} type="text" maxLength={10} />
        <ProfileField label="PF No" name="pfNo" value={profile.pfNo} onChange={handleChange} error={errors.pfNo} type="text" />
        <ProfileField label="HRMS ID" name="hrmsId" value={profile.hrmsId} onChange={handleChange} error={errors.hrmsId} type="text" />
        <ProfileField label="Date of Birth" name="dob" value={profile.dob} onChange={handleChange} error={errors.dob} type="date" />
        <ProfileField label="Date of Joining" name="dateOfJoining" value={profile.dateOfJoining} onChange={handleChange} error={errors.dateOfJoining} type="date" />
        <ProfileField label="Date of Retirement" name="dateOfRetirement" value={profile.dateOfRetirement} onChange={handleChange} error={errors.dateOfRetirement} type="date" />

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

        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Assigned Machine</h3>
          {profile.assignedMachine ?
            <div style={{
              padding: "12px 18px",
              background: "#e3f2fd",
              color: "#1976d2",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              display: "inline-block"
            }}>
              {profile.assignedMachine}
            </div>
            :
            <div style={{ color: "#bbb" }}>No machine assigned</div>
          }
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, name, value, onChange, error, type = "text", ...rest }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: error ? "1.5px solid #e53935" : "1px solid #bbb",
          borderRadius: 4,
          fontSize: 15,
          marginTop: 4,
          boxSizing: "border-box"
        }}
        {...rest}
        required
      />
      {error && <div style={{ color: "#e53935", fontSize: 13, marginTop: 2 }}>{error}</div>}
    </div>
  );
}
