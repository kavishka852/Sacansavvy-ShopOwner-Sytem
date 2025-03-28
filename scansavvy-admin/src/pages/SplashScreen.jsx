import React, { useEffect, useState } from 'react';
import '../css/SplashScreen.css';
import { Navigate, useNavigate } from 'react-router-dom';
import AppLogo from '../assets/Applogo.png'; // Import the logo

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          // Navigate to login page when progress reaches 100%
          navigate('/login');
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      {/* Floating Shapes */}
      <div className="floating-shape top-left" />
      <div className="floating-shape bottom-right" />

      {/* Main Content */}
      <div className="center-content">
        {/* Add the logo image with inline styles */}
        <img 
          src={AppLogo} 
          alt="ScanSavvy Logo" 
          style={{
            width: '120px',
            height: 'auto',
            marginBottom: '20px'
          }} 
        />
        <h1 className="main-title">ScanSavvy</h1>
        <p className="subtitle">Where Virtual Meets Real Shopping</p>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-text">{progress}% Loaded</p>
      </div>
    </div>
  );
};

export default SplashScreen;