import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';
import './Dashboard.css';

function Dashboard() {
  const { client, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/dashboard/metrics`);
      setMetrics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Klaviyo Dashboard</h1>
          <p className="client-name">Welcome, {client?.name}</p>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading metrics...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>⚠️ {error}</p>
            <button onClick={fetchMetrics} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && metrics && (
          <>
            {/* Overview Section */}
            <div className="metrics-section">
              <h2 className="section-title">Overview</h2>
              <div className="metrics-grid">
                {/* Campaigns Count */}
                <div className="metric-card highlight">
                  <h3>Total Campaigns</h3>
                  <div className="metric-value-large">{metrics.campaignCount?.toLocaleString() || 0}</div>
                </div>

                {/* Flows Count */}
                <div className="metric-card">
                  <h3>Total Flows</h3>
                  <div className="metric-value-large">{metrics.flowCount?.toLocaleString() || 0}</div>
                </div>

                {/* Total Revenue */}
                {metrics.revenueMetrics && (
                  <div className="metric-card">
                    <h3>Total Revenue</h3>
                    <div className="metric-value-large">
                      ${metrics.revenueMetrics.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Metrics Section */}
            {metrics.eventMetrics && (
              <div className="metrics-section">
                <h2 className="section-title">Event Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card highlight">
                    <h3>Placed Order</h3>
                    <div className="metric-value-large">{metrics.eventMetrics.placedOrder?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Viewed Product</h3>
                    <div className="metric-value-large">{metrics.eventMetrics.viewedProduct?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Added to Cart</h3>
                    <div className="metric-value-large">{metrics.eventMetrics.addedToCart?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Active on Site</h3>
                    <div className="metric-value-large">{metrics.eventMetrics.activeOnSite?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="metrics-section">
              <div className="metric-card">
                <h3>Last Updated</h3>
                <div className="metric-content">
                  <p className="timestamp">
                    {new Date(metrics.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

