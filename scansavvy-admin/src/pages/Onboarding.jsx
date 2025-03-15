// OnboardingDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Settings, Users, BarChart3, Bell } from 'lucide-react';
import '../css/Onboarding.css';

const OnboardingDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate(); 
  const steps = [
    {
      title: "Welcome to Your Dashboard",
      description: "Get ready to explore powerful admin tools and insights.",
      icon: BarChart3,
      features: [
        { title: "Analytics Dashboard", description: "Track your key metrics" },
        { title: "User Management", description: "Manage team access and roles" },
        { title: "System Settings", description: "Configure your workspace" }
      ]
    },
    {
      title: "Configure Your Profile",
      description: "Customize your workspace settings and preferences.",
      icon: Settings,
      features: [
        { title: "Personal Info", description: "Update your details" },
        { title: "Notifications", description: "Set your alert preferences" },
        { title: "Theme Settings", description: "Choose your color scheme" }
      ]
    },
    {
      title: "Team Setup",
      description: "Invite your team members and set their permissions.",
      icon: Users,
      features: [
        { title: "Team Invites", description: "Add new team members" },
        { title: "Role Management", description: "Define access levels" },
        { title: "Collaboration", description: "Set up team spaces" }
      ]
    },
    {
      title: "You're All Set!",
      description: "Your workspace is ready to use.",
      icon: Check,
      features: [
        { title: "Get Started", description: "Jump into your dashboard" },
        { title: "Help Center", description: "Access support resources" },
        { title: "Quick Tips", description: "Learn platform basics" }
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }else {
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Setup Wizard</h1>
          <div className="header-actions">
            <button className="notification-button">
              <Bell />
            </button>
            <div className="user-avatar">
              <span>JD</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={index} className="progress-step">
                <div className={`step-circle ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}>
                  {currentStep > index + 1 ? (
                    <Check />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="progress-line">
                    <div 
                      className="progress-line-fill"
                      style={{
                        width: currentStep > index + 1 ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="content-card">
          <div className="content-wrapper">
            <div className="step-header">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "step-icon"
              })}
              <h2>{steps[currentStep - 1].title}</h2>
              <p>{steps[currentStep - 1].description}</p>
            </div>

            <div className="features-grid">
              {steps[currentStep - 1].features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button 
                onClick={handlePrevious}
                className={`button previous ${currentStep === 1 ? 'disabled' : ''}`}
                disabled={currentStep === 1}
              >
                <ArrowLeft />
                Previous
              </button>
              <button 
                onClick={handleNext}
                className={`button next ${currentStep === steps.length ? 'complete' : ''}`}
              >
                {currentStep === steps.length ? (
                  <>
                    Complete Setup
                    <Check />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDashboard;