import { useState, useEffect } from 'react';
import './PendingRequestsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}

function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export default function PendingRequestsPage({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getOrgId = () => {
    const org = JSON.parse(localStorage.getItem('organization') || '{}');
    return org.id;
  };

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/join-requests?status=pending`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('organization');
          if (onLogout) onLogout();
          return;
        }
        throw new Error('Failed to fetch join requests');
      }

      const data = await response.json();
      if (data.success) {
        setRequests(data.data.requests || []);
        setStats(data.data.summary || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: 'approving' }));
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/join-request/${requestId}/approve`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }

      setRequests(requests.filter(r => r.requestId !== requestId));
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
    } catch (err) {
      alert(err.message);
      console.error('Error approving request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleReject = async (requestId, userId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [requestId]: 'rejecting' }));
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/join-request/${requestId}/reject`,
        {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      setRequests(requests.filter(r => r.requestId !== requestId));
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }));
    } catch (err) {
      alert(err.message);
      console.error('Error rejecting request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.user.fullName.toLowerCase().includes(searchLower) ||
      request.user.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="pending-requests-page">
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="pending-requests-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h3 className="header-title">Pending Requests</h3>
          <p className="header-subtitle">{stats.pending} pending requests</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <p className="stat-label">TOTAL</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">PENDING</p>
            <p className="stat-value pending">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">APPROVED</p>
            <p className="stat-value approved">{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <p className="stat-label">REJECTED</p>
            <p className="stat-value rejected">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="table-wrapper">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>No pending requests</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>REQUESTED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.requestId}>
                  <td>
                    <div className="user-cell">
                      <img
                        src={request.user.avatar}
                        alt={request.user.fullName}
                        className="avatar"
                      />
                      <span>{request.user.fullName}</span>
                    </div>
                  </td>
                  <td>{request.user.email}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td className="action-cell">
                    <button
                      className="action-btn approve"
                      onClick={() => handleApprove(request.requestId, request.userId)}
                      disabled={actionLoading[request.requestId]}
                      title="Approve Request"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleReject(request.requestId, request.userId)}
                      disabled={actionLoading[request.requestId]}
                      title="Reject Request"
                    >
                      <XIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
