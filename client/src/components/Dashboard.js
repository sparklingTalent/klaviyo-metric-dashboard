import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
      const response = await axios.get('/api/dashboard/metrics');
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
                {/* Account Info */}
                {metrics.account && (
                  <div className="metric-card">
                    <h3>Account Information</h3>
                    <div className="metric-content">
                      <div className="metric-item">
                        <span className="metric-label">Account Name:</span>
                        <span className="metric-value">{metrics.account.name || 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Contact Email:</span>
                        <span className="metric-value">{metrics.account.contact_email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Count */}
                <div className="metric-card highlight">
                  <h3>Total Profiles</h3>
                  <div className="metric-value-large">{metrics.profileCount?.toLocaleString() || 0}</div>
                </div>

                {/* Campaigns Count */}
                {metrics.campaignMetrics && (
                  <div className="metric-card">
                    <h3>Total Campaigns</h3>
                    <div className="metric-value-large">{metrics.campaignMetrics.total || 0}</div>
                  </div>
                )}

                {/* Flows Count */}
                {metrics.flowMetrics && (
                  <div className="metric-card">
                    <h3>Total Flows</h3>
                    <div className="metric-value-large">{metrics.flowMetrics.total || 0}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Metrics Section */}
            {metrics.campaignMetrics && (
              <div className="metrics-section">
                <h2 className="section-title">Campaign Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h3>Opens</h3>
                    <div className="metric-value-large">{metrics.campaignMetrics.opens?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Click-Through Rate</h3>
                    <div className="metric-value-large">
                      {metrics.campaignMetrics.opens > 0 
                        ? ((metrics.campaignMetrics.clicks / metrics.campaignMetrics.opens) * 100).toFixed(2) + '%'
                        : '0%'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h3>Delivered</h3>
                    <div className="metric-value-large">{metrics.campaignMetrics.delivered?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Bounces</h3>
                    <div className="metric-value-large">{metrics.campaignMetrics.bounces?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card highlight">
                    <h3>Campaign Revenue</h3>
                    <div className="metric-value-large">
                      ${metrics.campaignMetrics.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flow Metrics Section */}
            {metrics.flowMetrics && (
              <div className="metrics-section">
                <h2 className="section-title">Flow Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h3>Flow Sends</h3>
                    <div className="metric-value-large">{metrics.flowMetrics.sends?.toLocaleString() || 0}</div>
                  </div>
                  <div className="metric-card">
                    <h3>Flow Conversion Rate</h3>
                    <div className="metric-value-large">
                      {metrics.flowMetrics.conversionRate > 0 
                        ? metrics.flowMetrics.conversionRate.toFixed(2) + '%'
                        : '0%'}
                    </div>
                  </div>
                  <div className="metric-card highlight">
                    <h3>Flow Revenue</h3>
                    <div className="metric-value-large">
                      ${metrics.flowMetrics.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Profile Metrics Section */}
            <div className="metrics-section">
              <h2 className="section-title">Profile Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card highlight">
                  <h3>Total Profiles</h3>
                  <div className="metric-value-large">{metrics.profileCount?.toLocaleString() || 0}</div>
                </div>
                {metrics.listMembership && Object.keys(metrics.listMembership).length > 0 && (
                  <div className="metric-card">
                    <h3>List Membership</h3>
                    <div className="metric-content">
                      {Object.entries(metrics.listMembership).slice(0, 5).map(([listName, count]) => (
                        <div key={listName} className="metric-item">
                          <span className="metric-label">{listName}:</span>
                          <span className="metric-value">{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {metrics.lists && (
                  <div className="metric-card">
                    <h3>List Growth</h3>
                    <div className="metric-value-large">
                      {metrics.lists.data?.length || 0}
                    </div>
                    <p className="metric-description">Active lists</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Metrics Section */}
            {metrics.revenueMetrics && (
              <div className="metrics-section">
                <h2 className="section-title">Revenue Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card highlight">
                    <h3>Total Revenue</h3>
                    <div className="metric-value-large">
                      ${metrics.revenueMetrics.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h3>Revenue by Email</h3>
                    <div className="metric-value-large">
                      ${metrics.revenueMetrics.revenueByEmail?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
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

