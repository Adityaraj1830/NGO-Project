import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DonationForm from "./DonationForm";
import "./donatepage.css";

export default function DonatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const ngo = location.state?.ngo;

  const [selectedType, setSelectedType] = useState(null);

  // If no NGO data, show error
  if (!ngo) {
    return (
      <div className="donate-page-error">
        <div className="error-content">
          <svg viewBox="0 0 24 24" className="error-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2>NGO Not Found</h2>
          <p>Please select an NGO from the list first.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const donationTypes = [
    {
      type: "MONEY",
      icon: (
        <svg viewBox="0 0 24 24" className="card-icon">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
      title: "Money",
      description: "Support their mission with financial help to fund their programs and initiatives.",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
    },
    {
      type: "FOOD",
      icon: (
        <svg viewBox="0 0 24 24" className="card-icon">
          <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
        </svg>
      ),
      title: "Food",
      description: "Donate meals, groceries, or dry rations to help feed those in need.",
      gradient: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
    },
    {
      type: "CLOTHES",
      icon: (
        <svg viewBox="0 0 24 24" className="card-icon">
          <path d="M16 4l-4-4-4 4-4 2v2.5l2.5 2.5V22h11V11l2.5-2.5V6l-4-2zM12 2l2 2h-4l2-2zm7 6.5L16.5 11H15V5.14L17 4l2 2v2.5zm-11 1V20h8V9.5H7.5z"/>
        </svg>
      ),
      title: "Clothes",
      description: "Give clothes, blankets, and warm essentials to provide comfort and dignity.",
      gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
    },
    {
      type: "ESSENTIALS",
      icon: (
        <svg viewBox="0 0 24 24" className="card-icon">
          <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
        </svg>
      ),
      title: "Essentials",
      description: "Provide hygiene items, medical supplies, and other basic necessities.",
      gradient: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
    }
  ];

  return (
    <div className="donate-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" className="back-icon">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>

      {/* HEADER */}
      <div className="donate-header">
        <div className="header-badge">Make a Difference</div>
        <h1>Donate to <span className="ngo-name">{ngo.ngoName}</span></h1>
        <p>Your contribution, no matter how small, can create a lasting impact in someone's life.</p>
      </div>

      {/* NGO INFO CARD */}
      <div className="ngo-info-card">
        <div className="ngo-card-image-wrapper">
          <img
            src={ngo.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop"}
            alt={ngo.ngoName}
            className="ngo-card-image"
          />
        </div>
        
        <div className="ngo-card-content">
          <h2 className="ngo-card-title">{ngo.ngoName}</h2>
          
          <div className="ngo-card-details">
            <div className="detail-item">
              <svg viewBox="0 0 24 24" className="detail-icon">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div>
                <span className="detail-label">Location</span>
                <span className="detail-value">{ngo.city}, {ngo.state}</span>
              </div>
            </div>

            <div className="detail-item">
              <svg viewBox="0 0 24 24" className="detail-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div>
                <span className="detail-label">Email</span>
                <span className="detail-value">{ngo.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <svg viewBox="0 0 24 24" className="detail-icon">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <div>
                <span className="detail-label">Phone</span>
                <span className="detail-value">{ngo.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DONATION OPTIONS */}
      <div className="donation-section">
        <h2 className="section-title">Choose Your Donation Type</h2>
        <p className="section-subtitle">Select how you'd like to contribute and make a difference</p>

        <div className="donation-grid">
          {donationTypes.map((item, index) => (
            <div 
              key={item.type} 
              className="donation-card"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="card-icon-wrapper" style={{ background: item.gradient }}>
                {item.icon}
              </div>
              
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
              
              <button 
                className="choose-btn" 
                onClick={() => setSelectedType(item.type)}
              >
                <span>Donate {item.title}</span>
                <svg viewBox="0 0 24 24" className="btn-arrow">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SHOW DONATION FORM AS POPUP */}
      {selectedType && (
        <DonationForm
          ngoId={ngo.id}
          type={selectedType}
          onClose={() => setSelectedType(null)}
          onAddedToCart={() => console.log("Item added")}
        />
      )}
    </div>
  );
}