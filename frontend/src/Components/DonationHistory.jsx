import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DonationHistory.css';

export default function DonationHistory({ donorId, onClose }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadDonations();
  }, [donorId]);

  const loadDonations = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/donation/status/donor/${donorId}`);
      setDonations(response.data);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', color: '#9E9E9E', icon: '⏳', bg: '#F5F5F5' },
      CONFIRMED: { label: 'Confirmed', color: '#2196F3', icon: '✓', bg: '#E3F2FD' },
      SCHEDULED: { label: 'Scheduled', color: '#FF9800', icon: '📅', bg: '#FFF3E0' },
      PICKED_UP: { label: 'Picked Up', color: '#9C27B0', icon: '🚚', bg: '#F3E5F5' },
      IN_TRANSIT: { label: 'In Transit', color: '#3F51B5', icon: '🛣️', bg: '#E8EAF6' },
      DELIVERED: { label: 'Delivered', color: '#4CAF50', icon: '📦', bg: '#E8F5E9' },
      COMPLETED: { label: 'Completed', color: '#00C853', icon: '✅', bg: '#E0F2F1' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDonations = filter === 'ALL'
    ? donations
    : donations.filter(d => d.status === filter);

  const statusCounts = {
    ALL: donations.length,
    CONFIRMED: donations.filter(d => d.status === 'CONFIRMED').length,
    SCHEDULED: donations.filter(d => d.status === 'SCHEDULED').length,
    PICKED_UP: donations.filter(d => d.status === 'PICKED_UP').length,
    IN_TRANSIT: donations.filter(d => d.status === 'IN_TRANSIT').length,
    DELIVERED: donations.filter(d => d.status === 'DELIVERED').length,
    COMPLETED: donations.filter(d => d.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="donation-history-overlay">
        <div className="donation-history-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading donations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-history-overlay" onClick={onClose}>
      <div className="donation-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>My Donations</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="filter-bar">
          {['ALL', 'CONFIRMED', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : getStatusInfo(status).label}
              <span className="filter-count">{statusCounts[status]}</span>
            </button>
          ))}
        </div>

        {filteredDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No donations found</h3>
            <p>Start making a difference by donating today!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="donations-table">
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>ITEM</th>
                  <th>QUANTITY</th>
                  <th>NGO</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const statusInfo = getStatusInfo(donation.status);
                  return (
                    <tr key={donation.id}>
                      <td>
                        <span className="type-badge">{donation.donationType}</span>
                      </td>
                      <td>
                        {donation.foodName || donation.clothesType || donation.itemName || `₹${donation.amount}`}
                      </td>
                      <td>{donation.quantity || donation.amount}</td>
                      <td>
                        <div className="ngo-info">
                          <div className="ngo-name">{donation.ngo?.ngoName}</div>
                          <div className="ngo-city">{donation.ngo?.city}</div>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge" style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color
                        }}>
                          <span className="status-icon">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>{formatDate(donation.donatedDate)}</td>
                      <td>
                        {donation.donationType === "MONEY" ? (
                          <button
                            className="track-btn"
                            onClick={() => setSelectedDonation(donation)}
                          >
                            View.
                          </button>
                        ) : (
                          <button
                            className="track-btn"
                            onClick={() => setSelectedDonation(donation)}
                          >
                            Track
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedDonation && (
          <DonationTracker
            donation={selectedDonation}
            onClose={() => setSelectedDonation(null)}
          />
        )}
      </div>
    </div>
  );
}

// ✅ FIXED: Donation Tracker Modal Component
function DonationTracker({ donation, onClose }) {
  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', color: '#9E9E9E', icon: '⏳' },
      CONFIRMED: { label: 'Confirmed', color: '#2196F3', icon: '✓' },
      SCHEDULED: { label: 'Scheduled', color: '#FF9800', icon: '📅' },
      PICKED_UP: { label: 'Picked Up', color: '#9C27B0', icon: '🚚' },
      IN_TRANSIT: { label: 'In Transit', color: '#3F51B5', icon: '🛣️' },
      DELIVERED: { label: 'Delivered', color: '#4CAF50', icon: '📦' },
      COMPLETED: { label: 'Completed', color: '#00C853', icon: '✅' }
    };
    return statusMap[status];
  };

  // ✅ Check if it's a money donation
  const isMoneyDonation = donation.donationType === 'MONEY';

  const statuses = ['CONFIRMED', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
  const currentIndex = statuses.indexOf(donation.status);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tracker-overlay" onClick={onClose}>
      <div className="tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tracker-header">
          <h3>Donation Tracking</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tracker-content">
          <div className="donation-info">
            <div className="info-row">
              <span className="info-label">
                {donation.donationType === "MONEY" ? "Amount:" : "Item:"}
              </span>

              <span className="info-value">
                {donation.donationType === "MONEY"
                  ? `₹${donation.amount || 'N/A'}`
                  : (donation.foodName ||
                    donation.clothesType ||
                    donation.itemName ||
                    'N/A')}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">NGO:</span>
              <span className="info-value">{donation.ngo?.ngoName}</span>
            </div>
            {donation.donationType && (
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{donation.donationType}</span>
              </div>
            )}
          </div>

          {/* ✅ MONEY DONATION: Simple completed status */}
          {isMoneyDonation ? (
            <div className="money-completion-wrapper">
              <div className="money-completion-card">
                <div className="completion-icon-large">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="#00C853">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="completion-title">Payment Completed</h3>
                <p className="completion-subtitle">Your money donation was processed instantly</p>

                <div className="completion-details">
                  <div className="detail-row-horizontal">
                    <span className="detail-icon"></span>
                    <div>
                      <div className="detail-label">Amount Donated</div>
                      <div className="detail-value-large">₹{donation.amount}</div>
                    </div>
                  </div>

                  <div className="detail-row-horizontal">
                    <span className="detail-icon"></span>
                    <div>
                      <div className="detail-label">Completed On</div>
                      <div className="detail-value">{formatDate(donation.completedAt || donation.donatedDate)}</div>
                    </div>
                  </div>

                  {donation.beneficiariesCount > 0 && (
                    <div className="detail-row-horizontal">
                      <span className="detail-icon">❤️</span>
                      <div>
                        <div className="detail-label">People Helped</div>
                        <div className="detail-value">{donation.beneficiariesCount} beneficiaries</div>
                      </div>
                    </div>
                  )}
                </div>

                {donation.statusMessage && (
                  <div className="completion-message">
                    <div className="message-icon">✉️</div>
                    <p>{donation.statusMessage}</p>
                  </div>
                )}

                {donation.impactDescription && (
                  <div className="impact-story">
                    <h4>Impact Story</h4>
                    <p>{donation.impactDescription}</p>
                  </div>
                )}

                <div className="completion-badge">
                  <span className="badge-icon">✅</span>
                  <span className="badge-text">INSTANTLY COMPLETED</span>
                </div>
              </div>
            </div>
          ) : (
            /* ✅ OTHER DONATIONS: Full timeline tracking */
            <div className="timeline">
              {statuses.map((status, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const statusInfo = getStatusInfo(status);

                let timestamp = null;
                if (status === 'CONFIRMED') timestamp = donation.confirmedAt;
                else if (status === 'SCHEDULED') timestamp = donation.scheduledAt;
                else if (status === 'PICKED_UP') timestamp = donation.pickedUpAt;
                else if (status === 'IN_TRANSIT') timestamp = donation.inTransitAt;
                else if (status === 'DELIVERED') timestamp = donation.deliveredAt;
                else if (status === 'COMPLETED') timestamp = donation.completedAt;

                return (
                  <div key={status} className="timeline-item">
                    <div className={`timeline-icon ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      style={{ backgroundColor: isCompleted ? statusInfo.color : '#E0E0E0' }}>
                      {statusInfo.icon}
                    </div>
                    {index < statuses.length - 1 && (
                      <div className={`timeline-line ${index < currentIndex ? 'completed' : ''}`}
                        style={{ backgroundColor: index < currentIndex ? statusInfo.color : '#E0E0E0' }} />
                    )}
                    <div className="timeline-content">
                      <div className={`timeline-label ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                        {statusInfo.label}
                      </div>
                      {timestamp && (
                        <div className="timeline-date">{formatDate(timestamp)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show additional info for non-money donations */}
          {!isMoneyDonation && (
            <>
              {donation.statusMessage && (
                <div className="status-message">
                  <strong>Latest Update:</strong> {donation.statusMessage}
                </div>
              )}

              {donation.pickupScheduledDate && donation.status === 'SCHEDULED' && (
                <div className="pickup-info">
                  <div className="pickup-icon">📅</div>
                  <div>
                    <strong>Scheduled Pickup:</strong>
                    <div>{formatDate(donation.pickupScheduledDate)}</div>
                  </div>
                </div>
              )}

              {donation.beneficiariesCount > 0 && donation.status === 'COMPLETED' && (
                <div className="impact-info">
                  <div className="impact-icon">❤️</div>
                  <div>
                    <strong>Impact:</strong> Helped {donation.beneficiariesCount} people
                  </div>
                </div>
              )}

              {donation.impactDescription && donation.status === 'COMPLETED' && (
                <div className="impact-description">
                  <h4>Impact Story</h4>
                  <p>{donation.impactDescription}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}