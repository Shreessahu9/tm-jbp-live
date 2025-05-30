import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";

export default function AdminHome() {
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    async function fetchName() {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setAdminName(userDoc.data().name || user.email || "Admin");
        } else {
          setAdminName(user.email || "Admin");
        }
      }
    }
    fetchName();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Welcome, {adminName}!</h2>
      <p>यह Superuser का Home Page है।</p>

      <div style={{ marginTop: 16, marginBottom: 32 }}>
        <Link to="/profile">
          <button style={btnStyleProfile}>
            My Profile
          </button>
        </Link>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Link to="/dashboard1">
          <button style={btnStyleBlue}>
            Assign Machine
          </button>
        </Link>
        <Link to="/super-competency">
          <button style={btnStyleGreen}>
            Competency Monitoring
          </button>
        </Link>
        <Link to="/broadcast">
          <button style={btnStyleOrange}>
            Broadcast Message
          </button>
        </Link>
        <Link to="/superuser-profiles">
          <button style={btnStylePurple}>
            Profile Dashboard
          </button>
        </Link>
        <Link to="/super-road-learning">
          <button style={btnStyleTeal}>
            Road Learning Dashboard
          </button>
        </Link>
        <Link to="/super-schedule-dashboard">
          <button style={btnStyleBrown}>
            Schedule Dashboard
          </button>
        </Link>
        <Link to="/super-service-engineer">
          <button style={btnStyleRed}>
            Service Engineer Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

const btnStyleProfile = {
  background: "#fff",
  color: "#1976d2",
  padding: "12px 32px",
  border: "2px solid #1976d2",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 16,
  marginBottom: 8,
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleBlue = {
  background: "#1976d2",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleGreen = {
  background: "#388e3c",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleOrange = {
  background: "#ff9800",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStylePurple = {
  background: "#7c4dff",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleTeal = {
  background: "#009688",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleBrown = {
  background: "#795548",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
const btnStyleRed = {
  background: "#e53935",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
};
