import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    klaviyoPrivateKey: ''
  });
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/admin/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/admin/clients', formData);
      setMessage({ type: 'success', text: 'Client added successfully!' });
      setFormData({ name: '', email: '', password: '', klaviyoPrivateKey: '' });
      fetchClients();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add client' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Admin Panel</h1>
        <p className="subtitle">Add new clients to the dashboard</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Client Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter client name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter client email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="klaviyoPrivateKey">Klaviyo Private Key</label>
            <input
              type="text"
              id="klaviyoPrivateKey"
              name="klaviyoPrivateKey"
              value={formData.klaviyoPrivateKey}
              onChange={handleChange}
              required
              placeholder="Enter Klaviyo private key"
            />
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Adding Client...' : 'Add Client'}
          </button>
        </form>

        <div className="clients-list">
          <h2>Existing Clients</h2>
          {clients.length === 0 ? (
            <p className="no-clients">No clients added yet</p>
          ) : (
            <div className="clients-table">
              <div className="table-header">
                <div>Name</div>
                <div>Email</div>
                <div>Created</div>
              </div>
              {clients.map((client) => (
                <div key={client.id} className="table-row">
                  <div>{client.name}</div>
                  <div>{client.email}</div>
                  <div>{new Date(client.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-footer">
          <a href="/login">Go to Login</a>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

