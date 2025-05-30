import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMessage() {
      const docSnap = await getDoc(doc(db, "globalMessage", "latest"));
      if (docSnap.exists()) {
        setMessage(docSnap.data().text);
      }
    }
    async function fetchUserName() {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setUserName(docSnap.data().name || "User");
      } else {
        setUserName("User");
      }
    }
    fetchMessage();
    fetchUserName();
  }, []);

  return (
    <div style={{
      maxWidth: 540,
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
          Welcome, {userName}!
        </h2>
      </div>

      <div style={{ padding: 28 }}>
        {message && (
          <div style={{
            background: "#fffbe6",
            border: "1px solid #ffd700",
            color: "#b8860b",
            padding: 12,
            borderRadius: 6,
            marginBottom: 20,
            fontWeight: 500
          }}>
            <strong>Admin Message:</strong> {message}
          </div>
        )}

        <div style={{
          display: "flex",
          gap: 18,
          marginBottom: 32,
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <button
            style={btnStyleBlue}
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>
          <button
            style={btnStyleGreen}
            onClick={() => navigate("/competency")}
          >
            Competency Monitoring
          </button>
          <button
            style={btnStyleOrange}
            onClick={() => navigate("/road-learning")}
          >
            Road Learning
          </button>
          <button
            style={btnStyleTeal}
            onClick={() => navigate("/machine-maintenance")}
          >
            Machine Maintenance
          </button>
        </div>

        <div style={{
          textAlign: "center",
          color: "#888",
          fontSize: 16
        }}>
          Welcome to your dashboard.  
          Use the buttons above to manage your details and learning!
        </div>
      </div>
    </div>
  );
}

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
const btnStyleGreen = {
  background: "#388e3c",
  color: "#fff",
  padding: "12px 22px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
const btnStyleOrange = {
  background: "#ff9800",
  color: "#fff",
  padding: "12px 22px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
const btnStyleTeal = {
  background: "#009688",
  color: "#fff",
  padding: "12px 22px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
