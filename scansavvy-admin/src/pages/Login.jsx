//Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use for navigation after login
import "../css/Login.css";
import Onboarding from "./Onboarding";
import AppLogo from "../assets/Applogo.png"; // Import the logo

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/shopowner/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log(data);
      // In Login.jsx, modify the successful login handling:
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.owner)); // Change to data.owner
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (error) {
      setError("Failed to connect to the server");
    }
  };

  if (isLoggedIn) {
    return <Onboarding />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-gradient-line"></div>
        <div className="login-content">
          {/* Add logo at the top of the login form */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '20px' 
          }}>
            <img 
              src={AppLogo} 
              alt="ScanSavvy Logo" 
              style={{
                width: '100px',
                height: 'auto'
              }} 
            />
          </div>
          <h2 className="login-title">Shop Owner Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="login-input"
                required
              />
            </div>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="login-input"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;