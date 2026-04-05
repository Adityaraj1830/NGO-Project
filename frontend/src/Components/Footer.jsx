import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!email) return;

    setSuccess(true);
    setEmail("");

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* About NGO */}
        <div className="footer-section">
          <h4>🤝 NGO Foundation</h4>
          <p>Dedicated to helping communities through food donation and welfare initiatives.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/donate">Donate</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 info@ngo.org</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 Mumbai, India</p>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <h4>Stay Updated</h4>
          <form onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>

          {success && <p className="success-msg">✓ Subscribed!</p>}

          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2025 NGO Foundation. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;