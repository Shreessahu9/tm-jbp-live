import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function BroadcastMessage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;
    await setDoc(doc(db, "globalMessage", "latest"), {
      text: message,
      timestamp: serverTimestamp()
    });
    setStatus("Message sent to all users!");
    setMessage("");
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <div style={{
      maxWidth: 520,
      margin: "48px auto",
      background: "#f5f8fd",
      borderRadius: 16,
      boxShadow: "0 2px 16px #1976d220",
      padding: 0,
      overflow: "hidden"
    }}>
      <div style={{
        background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
        padding: "28px 0 18px 0",
        textAlign: "center",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
      }}>
        <h2 style={{
          color: "#fff",
          margin: 0,
          fontWeight: 800,
          letterSpacing: 1,
          fontSize: 26,
          fontFamily: "'Open Sans', Arial, Helvetica, sans-serif"
        }}>
          Broadcast Message
        </h2>
        <div style={{ color: "#e3f2fd", fontSize: 15, marginTop: 5 }}>
          Send an important message to all supervisors
        </div>
      </div>
      <div style={{ padding: 32 }}>
        <textarea
          rows={5}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 8,
            border: "1.5px solid #b0bec5",
            fontSize: 16,
            fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
            marginBottom: 20,
            background: "#fff",
            boxSizing: "border-box",
            resize: "vertical"
          }}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            width: "100%",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 17,
            border: "none",
            borderRadius: 7,
            padding: "13px 0",
            cursor: message.trim() ? "pointer" : "not-allowed",
            boxShadow: "0 1px 6px #1976d220",
            transition: "background 0.2s"
          }}>
          Send Message
        </button>
        {status && (
          <div style={{
            color: "#388e3c",
            marginTop: 18,
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center",
            letterSpacing: 0.5
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
