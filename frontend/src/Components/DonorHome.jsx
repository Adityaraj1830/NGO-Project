// DonorHome.jsx - FIXED VERSION with Validation & Notifications
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NgoSection from "./NgoSection";
import "./donorhome.css";
import Chatbot from "../Pages/Chatbot";
import Footer from "./Footer";
import DonationHistory from "./DonationHistory";

const DonorHome = () => {
  const navigate = useNavigate();
  const storedId = localStorage.getItem("userId");
  const storedName = localStorage.getItem("userName");

  const [userData, setUserData] = useState({
    id: storedId || "",
    name: storedName || "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    password: "",
    role: ""
  });

  const [showDropdown, setShowDropdown] = useState(false);
  // ✅ Cart item count
  const [cartCount, setCartCount] = useState(0);

  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showDonations, setShowDonations] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // ✅ NEW: Notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // ✅ NEW: Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const dropdownRef = useRef(null);
  const navRightRef = useRef(null);

  const carouselSlides = [
    {
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&h=900&fit=crop",
      title: "Empower Children's Future",
      subtitle: "Education is the key to breaking the cycle of poverty",
      message: "Your donation can provide books, uniforms, and learning resources to children in need"
    },
    {
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&h=900&fit=crop",
      title: "Feed the Hungry",
      subtitle: "No one should go to bed hungry",
      message: "Help us provide nutritious meals to families struggling with food insecurity"
    },
    {
      image: "https://i.ibb.co/spf2PXzy/c.jpg",
      title: "Clothe with Dignity",
      subtitle: "Everyone deserves warmth and comfort",
      message: "Donate clothes and essentials to those facing hardship and homelessness"
    }
  ];

  // ✅ NEW: Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ✅ NEW: Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || !name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (!nameRegex.test(name)) {
      return "Name can only contain letters and spaces";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return "";  // Email is optional for update
    }
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please provide a valid email address";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return "";  // Phone is optional for update
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return "Phone must be exactly 10 digits";
    }
    return "";
  };

  const validatePassword = (password) => {
    // Password is optional, only validate if provided
    if (password && password.length > 0 && password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(userData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(userData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(userData.phone);
    if (phoneError) errors.phone = phoneError;
    
    // Only validate password if it's not empty
    if (userData.password && userData.password.trim() !== "") {
      const passwordError = validatePassword(userData.password);
      if (passwordError) errors.password = passwordError;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!storedId) return;
    fetch(`http://localhost:8080/donor/${storedId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(prev => ({ ...prev, ...data, password: "" })); // Don't load password
        if (data.name && data.name.trim() !== "") localStorage.setItem("userName", data.name);
      })
      .catch(err => console.error("Error loading donor:", err));
  }, [storedId]);


  // ✅ Load cart item count
useEffect(() => {
  if (!storedId) return;

  const loadCartCount = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/cart/find-by-donor/${storedId}`
      );
      const data = await res.json();

      if (data && data.cartItems) {
        setCartCount(data.cartItems.length);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.log("No cart found");
      setCartCount(0);
    }
  };

  loadCartCount();
}, [storedId]);


  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [carouselSlides.length, isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // ✅ FIXED: Profile update with proper password handling and backend validation
  const handleUserUpdate = async (e) => {
    e.preventDefault();
    
    // Frontend validation first
    if (!validateForm()) {
      showNotification("Please fix the validation errors", "error");
      return;
    }
    
    try {
      // Build the update object - only include fields that have values
      const updatedData = {};
      
      if (userData.name && userData.name.trim() !== "") {
        updatedData.name = userData.name.trim();
      }
      if (userData.email && userData.email.trim() !== "") {
        updatedData.email = userData.email.trim();
      }
      if (userData.phone && userData.phone.trim() !== "") {
        updatedData.phone = userData.phone.trim();
      }
      if (userData.address && userData.address.trim() !== "") {
        updatedData.address = userData.address.trim();
      }
      if (userData.city && userData.city.trim() !== "") {
        updatedData.city = userData.city.trim();
      }
      if (userData.state && userData.state.trim() !== "") {
        updatedData.state = userData.state.trim();
      }
      
      // ✅ CRITICAL: Only include password if it's been entered and not empty
      if (userData.password && userData.password.trim() !== "") {
        updatedData.password = userData.password.trim();
      }
      
      console.log("Sending update data:", { ...updatedData, password: updatedData.password ? "***" : "not included" });
      
      const response = await fetch(`http://localhost:8080/donor/${userData.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updatedData),
      });
      
      const responseData = await response.json();
      
      // ✅ Handle backend validation errors
      if (!response.ok) {
        console.error("Backend validation errors:", responseData);
        
        // Check if response is validation errors object
        if (typeof responseData === 'object' && !responseData.error) {
          // Backend returned field-specific validation errors
          setValidationErrors(responseData);
          showNotification("Please fix the validation errors", "error");
          return;
        }
        
        // Generic error message
        const errorMsg = responseData.error || "Update failed";
        showNotification(errorMsg, "error");
        return;
      }
      
      console.log("Update successful:", responseData);
      
      // ✅ Update local state with response, clear password field
      setUserData(prev => ({ 
        ...prev, 
        ...responseData, 
        password: "" 
      }));
      
      if (responseData.name) {
        localStorage.setItem("userName", responseData.name);
      }
      
      showNotification("Profile updated successfully!", "success");
      setShowProfileCard(false);
      setValidationErrors({});
      
    } catch (err) {
      console.error("Profile update failed:", err);
      showNotification("Network error. Please check your connection.", "error");
    }
  };

  // ✅ NEW: Handle input changes with validation
  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
    
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!dropdownRef.current || !navRightRef.current) return;
      if (navRightRef.current.contains(e.target)) return;
      setShowDropdown(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener("click", handleDocClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDropdown]);

  return (
    <div className="donor-home-container">
      {/* ✅ NEW: Notification component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <svg viewBox="0 0 24 24" className="notification-icon">
              {notification.type === "success" ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              )}
            </svg>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo">Contribution <span>Dashboard</span></div>

        <div className="nav-right" ref={navRightRef} aria-haspopup="true" aria-expanded={showDropdown}>
          <button
  className="cart-icon"
  aria-label="Go to cart"
  onClick={() => navigate("/cart")}
  title="Cart"
>
  <svg viewBox="0 0 24 24" className="icon-svg">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h8.03c.75 0 1.41-.41 1.75-1.03l3.58-6.49L19.42 2 16.31 8H8.53L7.27 5H2v2h3l3.6 7.59L6.25 17.04C6.09 17.31 6 17.65 6 18a2 2 0 104 0c0-.35-.09-.69-.25-.96L7.16 14z"/>
  </svg>

  {/* ✅ Cart count badge */}
  {cartCount > 0 && (
    <span className="cart-badge">{cartCount}</span>
  )}
</button>


          <button
            className="profile-btn"
            onClick={() => setShowDropdown(prev => !prev)}
            aria-label="Profile menu"
            title="Profile"
          >
            <svg viewBox="0 0 24 24" className="icon-svg" role="img" aria-hidden="true">
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="dropdown" ref={dropdownRef} role="menu" aria-label="Profile menu">
              <div className="dropdown-header">
                <div className="profile-avatar">
                  <svg viewBox="0 0 24 24" className="avatar-icon">
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
                  </svg>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{userData.name || storedName || "User"}</span>
                  <span className="profile-email">{userData.email || "user@example.com"}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={() => { setShowProfileCard(true); setShowDropdown(false); }}>
                <svg viewBox="0 0 24 24" className="item-icon">
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
                </svg>
                My Profile
              </button>

              <button className="dropdown-item" onClick={() => { setShowDonations(true); setShowDropdown(false); }}>
                <svg viewBox="0 0 24 24" className="item-icon">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                </svg>
                My Donations
              </button>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item logout-item" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                <svg viewBox="0 0 24 24" className="item-icon">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="hero-banner">
        <div className="carousel-container">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${slide.image}')` }}
              aria-hidden={index === currentSlide ? "false" : "true"}
            >
              <div className="carousel-content">
                <h1>{slide.title}</h1>
                <h3>{slide.subtitle}</h3>
                <p>{slide.message}</p>
              </div>
            </div>
          ))}

          <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" className="arrow-svg" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>

          <button className="carousel-btn next" onClick={nextSlide} aria-label="Next slide">
            <svg viewBox="0 0 24 24" className="arrow-svg" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>

          <div className="carousel-indicators" role="tablist">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {showDonations && (
        <DonationHistory 
          donorId={storedId} 
          onClose={() => setShowDonations(false)} 
        />
      )}

      {showProfileCard && (
        <div className="popup-overlay" role="dialog" aria-modal="true">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Update Profile</h2>
              <button className="close-icon-btn" onClick={() => setShowProfileCard(false)} aria-label="Close">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUserUpdate} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                    </svg>
                    Full Name *
                  </label>
                  <input 
                    id="name"
                    type="text" 
                    value={userData.name || ""} 
                    onChange={(e) => handleInputChange("name", e.target.value)} 
                    placeholder="Enter your name"
                    className={validationErrors.name ? "error" : ""}
                  />
                  {validationErrors.name && (
                    <small className="error-message">{validationErrors.name}</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email Address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    value={userData.email || ""} 
                    onChange={(e) => handleInputChange("email", e.target.value)} 
                    placeholder="Enter your email"
                    className={validationErrors.email ? "error" : ""}
                  />
                  {validationErrors.email && (
                    <small className="error-message">{validationErrors.email}</small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    Phone Number
                  </label>
                  <input 
                    id="phone"
                    type="text" 
                    value={userData.phone || ""} 
                    onChange={(e) => handleInputChange("phone", e.target.value)} 
                    placeholder="Enter phone number (10 digits)"
                    className={validationErrors.phone ? "error" : ""}
                  />
                  {validationErrors.phone && (
                    <small className="error-message">{validationErrors.phone}</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="city">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
                    </svg>
                    City
                  </label>
                  <input 
                    id="city"
                    type="text" 
                    value={userData.city || ""} 
                    onChange={(e) => handleInputChange("city", e.target.value)} 
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <svg viewBox="0 0 24 24" className="label-icon">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Address
                </label>
                <input 
                  id="address"
                  type="text" 
                  value={userData.address || ""} 
                  onChange={(e) => handleInputChange("address", e.target.value)} 
                  placeholder="Enter your address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    State
                  </label>
                  <input 
                    id="state"
                    type="text" 
                    value={userData.state || ""} 
                    onChange={(e) => handleInputChange("state", e.target.value)} 
                    placeholder="Enter state"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <svg viewBox="0 0 24 24" className="label-icon">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Password
                  </label>
                  <input 
                    id="password"
                    type="password" 
                    value={userData.password || ""} 
                    onChange={(e) => handleInputChange("password", e.target.value)} 
                    placeholder="Leave empty to keep current"
                    className={validationErrors.password ? "error" : ""}
                  />
                  {validationErrors.password && (
                    <small className="error-message">{validationErrors.password}</small>
                  )}
                  {!validationErrors.password && (
                    <small className="form-hint">Leave empty to keep your current password (min 6 characters)</small>
                  )}
                </div>
              </div>

              <div className="profile-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowProfileCard(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <svg viewBox="0 0 24 24" className="btn-icon">
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Chatbot />
      <NgoSection />
      <Footer />
    </div>
  );
};

export default DonorHome;
