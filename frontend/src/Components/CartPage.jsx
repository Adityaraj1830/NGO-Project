import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./cart.css";

export default function CartPage() {
  const navigate = useNavigate();
  const donorId = localStorage.getItem("userId");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/cart/find-by-donor/${donorId}`
      );

      if (res.data && res.data.id) {
        setCart(res.data);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.log("No cart found");
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/cart/remove-item/${itemId}`);

      setCart((prev) => ({
        ...prev,
        cartItems: prev.cartItems.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      console.error("Error removing cart item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear all items from your cart?")) {
      return;
    }

    try {
      if (!cart) return;

      await axios.delete(`http://localhost:8080/cart/clear/${cart.id}`);
      setCart((prev) => ({ ...prev, cartItems: [] }));
    } catch (err) {
      console.error("Error clearing cart:", err);
      alert("Failed to clear cart. Please try again.");
    }
  };

  const checkout = async () => {
    try {
      if (!cart) return;

      await axios.post(`http://localhost:8080/cart/checkout/${cart.id}`);

      alert("Donation Confirmed! NGO will contact you soon.");
      setCart((prev) => ({ ...prev, cartItems: [] }));
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  const getTypeIcon = (type) => {
    switch(type?.toUpperCase()) {
      case "FOOD":
        return (
          <svg viewBox="0 0 24 24" className="type-icon">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
          </svg>
        );
      case "MONEY":
        return (
          <svg viewBox="0 0 24 24" className="type-icon">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        );
      case "CLOTHES":
        return (
          <svg viewBox="0 0 24 24" className="type-icon">
            <path d="M16 4l-4-4-4 4-4 2v2.5l2.5 2.5V22h11V11l2.5-2.5V6l-4-2zM12 2l2 2h-4l2-2zm7 6.5L16.5 11H15V5.14L17 4l2 2v2.5zm-11 1V20h8V9.5H7.5z"/>
          </svg>
        );
      case "ESSENTIALS":
        return (
          <svg viewBox="0 0 24 24" className="type-icon">
            <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="spinner-large"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  const items = cart?.cartItems || [];

  return (
    <div className="cart-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" className="back-icon">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="cart-header">
        <div className="cart-icon-wrapper">
          <svg viewBox="0 0 24 24" className="cart-main-icon">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <h1 className="cart-title">Your Donation Cart</h1>
        <p className="cart-subtitle">
          {items.length === 0 
            ? "Your cart is waiting for your generosity" 
            : `${items.length} ${items.length === 1 ? 'item' : 'items'} ready to make a difference`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <svg viewBox="0 0 24 24" className="empty-icon">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <h3>Your Cart is Empty</h3>
          <p>Start adding items to make a meaningful contribution</p>
          <button className="browse-btn" onClick={() => navigate(-1)}>
            Browse NGOs
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item, index) => (
              <div 
                className="cart-card" 
                key={item.id}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="card-header">
                  <div className="type-badge">
                    {getTypeIcon(item.donationType)}
                    <span>{item.donationType}</span>
                  </div>
                  <button
                    className="remove-icon-btn"
                    onClick={() => removeItem(item.id)}
                    title="Remove item"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>

                <div className="cart-details">
                  {item.foodName && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                      </svg>
                      <div>
                        <span className="label">Food Item</span>
                        <span className="value">{item.foodName}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.mealType && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div>
                        <span className="label">Meal Type</span>
                        <span className="value">{item.mealType}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.category && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M12 2l-5.5 9h11z"/>
                        <circle cx="17.5" cy="17.5" r="4.5"/>
                        <path d="M3 13.5h8v8H3z"/>
                      </svg>
                      <div>
                        <span className="label">Category</span>
                        <span className="value">{item.category}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.quantity && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                      <div>
                        <span className="label">Quantity</span>
                        <span className="value">{item.quantity}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.amount && (
                    <div className="detail-row highlight">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                      <div>
                        <span className="label">Amount</span>
                        <span className="value amount">₹{item.amount}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.clothesType && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M16 4l-4-4-4 4-4 2v2.5l2.5 2.5V22h11V11l2.5-2.5V6l-4-2z"/>
                      </svg>
                      <div>
                        <span className="label">Clothes Type</span>
                        <span className="value">{item.clothesType}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.itemName && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2z"/>
                      </svg>
                      <div>
                        <span className="label">Item Name</span>
                        <span className="value">{item.itemName}</span>
                      </div>
                    </div>
                  )}
                  
                  {item.city && (
                    <div className="detail-row">
                      <svg viewBox="0 0 24 24" className="detail-icon">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <div>
                        <span className="label">City</span>
                        <span className="value">{item.city}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button className="clear-btn" onClick={clearCart}>
              <svg viewBox="0 0 24 24" className="btn-icon">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Clear Cart
            </button>
            <button className="checkout-btn" onClick={checkout}>
              <svg viewBox="0 0 24 24" className="btn-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Confirm Donation
            </button>
          </div>
        </>
      )}
    </div>
  );
}