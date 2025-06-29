import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import api from '../../service/api';

const AdminRoute = () => {
  const [username, setUsername] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/settings/admin/verify-passkey", { username, passkey });
      if (res.data.success) {
        setIsAdmin(true);
        setError("");
        sessionStorage.setItem('isAdminVerified', 'true');
      } else {
        setError(res.data.error || "Invalid credentials. Please try again.");
        setIsAdmin(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Please try again.");
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <div className="admin-passkey-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Admin Passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>{loading ? "Checking..." : "Submit"}</button>
        {error && <div className="error-message">{error}</div>}
      </form>

      <p
        className="forgot-passkey"
        onClick={() => navigate("/settings")}
      >
        Need to reset passkey? Go to Settings
      </p>

      <style>{`
        .admin-passkey-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 30px 25px;
          background: #1C1C1E;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(40, 178, 149, 0.15);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
        }
        .admin-passkey-container h2 {
          margin-bottom: 20px;
          color: #D6F84C;
          font-weight: 700;
          font-size: 24px;
        }
        .admin-passkey-container input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #28B295;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          background: #232325;
          color: #E3E3E0;
          margin-bottom: 12px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }
        .admin-passkey-container input:focus {
          border-color: #D6F84C;
          box-shadow: 0 0 8px rgba(214, 248, 76, 0.3);
        }
        .admin-passkey-container button {
          margin-top: 8px;
          width: 100%;
          padding: 12px 0;
          background: linear-gradient(135deg, #28B295, #2A9D8A);
          border: none;
          border-radius: 8px;
          color: #1C1C1E;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .admin-passkey-container button:hover {
          background: linear-gradient(135deg, #D6F84C, #C4E83C);
        }
        .admin-passkey-container .error-message {
          margin-top: 12px;
          color: #FF715B;
          font-weight: 600;
          font-size: 14px;
        }
        .forgot-passkey {
          margin-top: 16px;
          color: #28B295;
          font-size: 14px;
          cursor: pointer;
          text-decoration: underline;
        }
        .forgot-passkey:hover {
          color: #D6F84C;
        }
      `}</style>
    </div>
  );
};

export default AdminRoute;
