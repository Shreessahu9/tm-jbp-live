import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('अगर यह ईमेल हमारे सिस्टम में है, तो आपको रिसेट लिंक भेज दिया गया है।');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10 }}>Send Reset Link</button>
      </form>
      <button
        style={{ marginTop: 12, background: "none", border: "none", color: "#1976d2", cursor: "pointer" }}
        onClick={() => navigate('/')}
      >
        Back to Login
      </button>
    </div>
  );
}
