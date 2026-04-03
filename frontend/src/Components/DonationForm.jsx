// DonationForm.jsx - FULLY UPDATED WITH FIXED CSS CLASSES
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./donationForm.css";

export default function DonationForm({ ngoId, type, onClose, onAddedToCart }) {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Donor";
  const userEmail = localStorage.getItem("userEmail") || "donor@example.com";

  const [ngo, setNgo] = useState(null);
  const [loadingNgo, setLoadingNgo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const [form, setForm] = useState({
    donationType: type,
    foodName: "",
    mealType: "",
    category: "",
    quantity: "",
    city: "",
    expiryDateTime: "",
    amount: "",
    clothesType: "",
    itemName: "",
  });

  const quickAmounts = [500, 1000, 2000];

  useEffect(() => {
    if (!ngoId) return;
    setLoadingNgo(true);
    axios.get(`http://localhost:8080/ngo/${ngoId}`)
      .then(res => {
        console.log("NGO loaded:", res.data);
        setNgo(res.data);
      })
      .catch(err => { 
        console.error("Load NGO failed", err); 
        setNgo(null); 
      })
      .finally(() => setLoadingNgo(false));
  }, [ngoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === "amount") {
      setSelectedQuickAmount(null);
    }
  };

  const handleQuickAmount = (amount) => {
    setSelectedQuickAmount(amount);
    setForm(prev => ({ ...prev, amount: String(amount) }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ FIXED: Money Payment Handler with Clear Status Communication
  const handleMoneyPayment = async () => {
    const amountValue = Number(form.amount);
    if (!amountValue || isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Creating Razorpay order for amount:", amountValue);
      
      const orderRes = await axios.post(
        "http://localhost:8080/payment/create-order",
        { amount: Math.round(amountValue * 100) }
      );

      const od = orderRes.data || {};
      const orderId = od.orderId || od.id || od.order_id;
      const rzKey = od.key || od.key_ || od.razorpayKey || "rzp_test_RjzWLkPc2oFYv7";
      const rzAmount = od.amount || Math.round(amountValue * 100);
      const rzCurrency = od.currency || "INR";

      console.log("Razorpay order created:", orderId);

      const options = {
        key: rzKey,
        amount: rzAmount,
        currency: rzCurrency,
        name: ngo?.ngoName || "NGO Donation",
        description: `Donation to ${ngo?.ngoName || "NGO"}`,
        order_id: orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#ff6a00" },
        handler: async function (response) {
          console.log("✅ Payment successful:", response);
          
          try {
            // ✅ CRITICAL: Ensure donation type is exactly "MONEY" in uppercase
            const payload = {
              donationType: "MONEY",  // Must be uppercase and exactly this
              ngo: { id: ngoId },
              amount: String(amountValue),
              quantity: String(amountValue),
              paymentId: response.razorpay_payment_id,
              orderId: orderId
            };

            console.log("=".repeat(50));
            console.log("💰 SAVING MONEY DONATION");
            console.log("=".repeat(50));
            console.log("Payload:", JSON.stringify(payload, null, 2));
            console.log("Donation Type:", payload.donationType);
            console.log("Type of donationType:", typeof payload.donationType);
            console.log("Amount:", payload.amount);
            console.log("NGO ID:", ngoId);
            console.log("Donor ID:", userId);

            // Save the donation
            const saveResponse = await axios.post(
              `http://localhost:8080/donation/add/${userId}`, 
              payload
            );

            console.log("✅ Donation saved successfully:", saveResponse.data);
            console.log("✅ Status should be COMPLETED:", saveResponse.data.status);

            // ✅ CLEAR SUCCESS MESSAGE - Explaining instant completion
            const successMessage = `
🎉 Payment Successful!
✅ Your donation of ₹${amountValue} has been received.
📧 A receipt has been sent to your email.

            `.trim();

            alert(successMessage);

            // Show additional confirmation in console
            console.log("=".repeat(50));
            console.log("DONATION COMPLETED SUCCESSFULLY");
            console.log("Amount: ₹" + amountValue);
            console.log("NGO:", ngo?.ngoName);
            console.log("Payment ID:", response.razorpay_payment_id);
            console.log("Status: COMPLETED (Auto-set by backend)");
            console.log("=".repeat(50));
            
            // Call success callback to refresh parent component
            if (onAddedToCart) {
              console.log("Calling onAddedToCart callback to refresh data...");
              onAddedToCart();
            }
            
            // Close the form
            onClose();
            
          } catch (err) {
            console.error("❌ Save money donation failed:", err);
            console.error("Error response:", err.response?.data);
            
            const errorMsg = err.response?.data?.message || 
                           err.response?.data?.error ||
                           "Failed to record donation. Please contact support with your payment ID: " + 
                           response.razorpay_payment_id;
            
            alert("❌ " + errorMsg);
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function() {
            console.log("Payment cancelled by user");
            alert("Payment cancelled. No charges were made.");
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error("❌ Payment flow error:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error ||
                       "Payment initiation failed. Please try again.";
      
      alert("❌ " + errorMsg);
      setIsSubmitting(false);
    }
  };

  // Handle Non-Money Donations (Add to Cart)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle money donations separately
    if (type === "MONEY") {
      return handleMoneyPayment();
    }

    // Validate required fields based on type
    if (type === "FOOD" && !form.foodName) {
      alert("⚠️ Please enter food name");
      return;
    }
    if (type === "CLOTHES" && !form.clothesType) {
      alert("⚠️ Please enter clothes type");
      return;
    }
    if (type === "ESSENTIALS" && !form.itemName) {
      alert("⚠️ Please enter item name");
      return;
    }
    if (!form.quantity) {
      alert("⚠️ Please enter quantity");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("=== Starting Add to Cart Process ===");
      console.log("Donor ID:", userId);
      console.log("NGO ID:", ngoId);
      console.log("Donation Type:", type);
      
      // Step 1: Get or create cart
      console.log("Step 1: Creating/Getting cart...");
      const createRes = await axios.post(
        `http://localhost:8080/cart/create/${userId}/${ngoId}`
      );
      const cart = createRes.data;
      console.log("Cart created/fetched - Cart ID:", cart.id);
      
      // Step 2: Prepare cart item with NGO reference
      const cartItem = {
        donationType: type,
        foodName: form.foodName || null,
        mealType: form.mealType || null,
        category: form.category || null,
        quantity: form.quantity,
        city: form.city || null,
        expiryDateTime: form.expiryDateTime || null,
        amount: form.amount || null,
        clothesType: form.clothesType || null,
        itemName: form.itemName || null,
        
        // Include NGO with each item
        ngo: {
          id: ngoId
        }
      };
      
      console.log("Step 2: Prepared cart item:", cartItem);
      
      // Step 3: Add item to cart
      console.log("Step 3: Adding item to cart...");
      const addItemRes = await axios.post(
        `http://localhost:8080/cart/add-item/${cart.id}`,
        cartItem
      );
      
      console.log("Item added successfully:", addItemRes.data);
      console.log("=== Add to Cart Complete ===");
      
      // Success message with NGO name
      const ngoName = ngo?.ngoName || "the NGO";
      alert(`✅ ${type} donation added to cart for ${ngoName}!\n.`);
      
      // Reset form
      setForm({
        donationType: type,
        foodName: "",
        mealType: "",
        category: "",
        quantity: "",
        city: "",
        expiryDateTime: "",
        amount: "",
        clothesType: "",
        itemName: "",
      });
      
      // Call success callback
      if (onAddedToCart) onAddedToCart();
      
      // Close the form
      onClose();
      
    } catch (err) {
      console.error("❌ Add to cart error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data || 
                       "Failed to add to cart. Please try again.";
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormIcon = () => {
    switch(type) {
      case "FOOD":
        return (
          <svg viewBox="0 0 24 24" className="df-form-icon">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
          </svg>
        );
      case "MONEY":
        return (
          <svg viewBox="0 0 24 24" className="df-form-icon">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        );
      case "CLOTHES":
        return (
          <svg viewBox="0 0 24 24" className="df-form-icon">
            <path d="M16 4l-4-4-4 4-4 2v2.5l2.5 2.5V22h11V11l2.5-2.5V6l-4-2zM12 2l2 2h-4l2-2zm7 6.5L16.5 11H15V5.14L17 4l2 2v2.5zm-11 1V20h8V9.5H7.5z"/>
          </svg>
        );
      case "ESSENTIALS":
        return (
          <svg viewBox="0 0 24 24" className="df-form-icon">
            <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getFormTitle = () => {
    switch(type) {
      case "FOOD": return "Food Donation";
      case "MONEY": return "Money Donation";
      case "CLOTHES": return "Clothes Donation";
      case "ESSENTIALS": return "Essentials Donation";
      default: return "Donation";
    }
  };

  return (
    <div className="df-overlay" onClick={onClose}>
      <div className="df-card" onClick={(e) => e.stopPropagation()}>
        <button className="df-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="df-header">
          <div className="df-icon-wrapper">
            {getFormIcon()}
          </div>
          <h2 className="df-title">{getFormTitle()}</h2>
        </div>

        {/* Show NGO Info for all types */}
        {ngo && (
          <div className="df-ngo-info">
            <div className="df-ngo-info-content">
              <span className="df-ngo-label">Donating to:</span>
              <span className="df-ngo-name">{loadingNgo ? "Loading..." : ngo.ngoName}</span>
              <span className="df-ngo-location">{ngo.city}, {ngo.state}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="df-form">
          {type === "MONEY" && (
            <>
              {/* Quick Amount Buttons */}
              <div className="df-quick-amounts">
                <label className="df-quick-amounts-label">Quick Select:</label>
                <div className="df-quick-amounts-buttons">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      className={`df-quick-amount-btn ${selectedQuickAmount === amount ? 'df-selected' : ''}`}
                      onClick={() => handleQuickAmount(amount)}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="df-field">
                <label htmlFor="amount">
                  <svg viewBox="0 0 24 24" className="df-label-icon">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  Enter Amount (₹)
                </label>
                <input 
                  id="amount"
                  type="number" 
                  name="amount" 
                  value={form.amount} 
                  onChange={handleChange} 
                  placeholder="Or enter custom amount" 
                  min="1"
                  required 
                />
              </div>
            </>
          )}

          {type === "FOOD" && (
            <>
              <div className="df-field">
                <label htmlFor="foodName">
                  <svg viewBox="0 0 24 24" className="df-label-icon">
                    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05z"/>
                  </svg>
                  Food Name
                </label>
                <input 
                  id="foodName"
                  name="foodName" 
                  value={form.foodName} 
                  onChange={handleChange} 
                  placeholder="e.g., Rice, Dal, Vegetables"
                  required 
                />
              </div>

              <div className="df-row">
                <div className="df-field">
                  <label htmlFor="mealType">Meal Type</label>
                  <select id="mealType" name="mealType" value={form.mealType} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>

                <div className="df-field">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="raw">Raw</option>
                    <option value="cooked">Cooked</option>
                    <option value="packed">Packed</option>
                  </select>
                </div>
              </div>

              <div className="df-row">
                <div className="df-field">
                  <label htmlFor="quantity">Quantity</label>
                  <input 
                    id="quantity"
                    name="quantity" 
                    value={form.quantity} 
                    onChange={handleChange} 
                    placeholder="e.g., 10 kg, 20 plates"
                    required 
                  />
                </div>

                <div className="df-field">
                  <label htmlFor="city">City</label>
                  <input 
                    id="city"
                    name="city" 
                    value={form.city} 
                    onChange={handleChange} 
                    placeholder="Your city"
                    required 
                  />
                </div>
              </div>
            </>
          )}

          {type === "CLOTHES" && (
            <>
              <div className="df-field">
                <label htmlFor="clothesType">
                  <svg viewBox="0 0 24 24" className="df-label-icon">
                    <path d="M16 4l-4-4-4 4-4 2v2.5l2.5 2.5V22h11V11l2.5-2.5V6l-4-2z"/>
                  </svg>
                  Clothes Type
                </label>
                <input 
                  id="clothesType"
                  name="clothesType" 
                  value={form.clothesType} 
                  onChange={handleChange} 
                  placeholder="e.g., Shirts, Pants, Blankets"
                  required 
                />
              </div>

              <div className="df-field">
                <label htmlFor="quantity">Quantity</label>
                <input 
                  id="quantity"
                  name="quantity" 
                  value={form.quantity} 
                  onChange={handleChange} 
                  placeholder="Number of items"
                  required 
                />
              </div>
            </>
          )}

          {type === "ESSENTIALS" && (
            <>
              <div className="df-field">
                <label htmlFor="itemName">
                  <svg viewBox="0 0 24 24" className="df-label-icon">
                    <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2z"/>
                  </svg>
                  Item Name
                </label>
                <input 
                  id="itemName"
                  name="itemName" 
                  value={form.itemName} 
                  onChange={handleChange} 
                  placeholder="e.g., Soap, Toothpaste, Medicine"
                  required 
                />
              </div>

              <div className="df-field">
                <label htmlFor="quantity">Quantity</label>
                <input 
                  id="quantity"
                  name="quantity" 
                  value={form.quantity} 
                  onChange={handleChange} 
                  placeholder="Number of items"
                  required 
                />
              </div>
            </>
          )}

          <div className="df-buttons">
            <button 
              type="submit" 
              className={`df-submit ${isSubmitting ? 'df-loading' : ''}`} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="df-spinner"></span>
                  {type === "MONEY" ? "Processing Payment..." : "Adding to Cart..."}
                </>
              ) : (
                <>
                  {type === "MONEY" ? (
                    <>
                      <svg viewBox="0 0 24 24" className="df-btn-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Donate Now
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="df-btn-icon">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      Add to Cart
                    </>
                  )}
                </>
              )}
            </button>
            <button type="button" className="df-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}