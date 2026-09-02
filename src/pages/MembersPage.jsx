import { useState, useMemo } from 'react';
import './MembersPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function CheckCircleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function DotsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const MOCK_MEMBERS = {
  active: [
    { id: '1', name: 'Carlos Rodriguez', email: 'carlos@example.com', avatar: '👨‍💼', joinDate: '08/15/2026', sites: 5 },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '👩‍💼', joinDate: '07/22/2026', sites: 3 },
    { id: '3', name: 'James Wilson', email: 'james@example.com', avatar: '👨‍💻', joinDate: '06/10/2026', sites: 8 },
    { id: '4', name: 'Maria Garcia', email: 'maria@example.com', avatar: '👩', joinDate: '05/30/2026', sites: 2 },
  ],
  pending: [
    { id: '5', name: 'Alex Thompson', email: 'alex@example.com', avatar: '👨', requestDate: '08/27/2026' },
    { id: '6', name: 'Emma Davis', email: 'emma@example.com', avatar: '👩', requestDate: '08/26/2026' },
  ],
};

export default function MembersPage({ activeTab }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentMembers = MOCK_MEMBERS[activeTab] || [];

  const filteredMembers = useMemo(() => {
    return currentMembers.filter(member => {
      const searchLower = search.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      );
    });
  }, [search, currentMembers, activeTab]);

  const getTabIcon = () => {
    switch (activeTab) {
      case 'active':
        return <CheckCircleIcon />;
      case 'pending':
        return <ClockIcon />;
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'active':
        return 'Active Members';
      case 'pending':
        return 'Pending Requests';
      default:
        return '';
    }
  };

  const getTabStats = () => {
    return {
      active: MOCK_MEMBERS.active.length,
      pending: MOCK_MEMBERS.pending.length,
    };
  };

  const stats = getTabStats();

  return (
    <div className="members-page">
      {/* Page Header */}
      <div className="members-header">
        <div className="members-title">
          <div>
            <h1>{getTabTitle()}</h1>
            <p>{filteredMembers.length} members</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab !== 'pending' && <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">ACTIVE</p>
            <p className="stat-value">{stats.active}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">PENDING</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
      </div>}

      {/* Search and Filters */}
      <div className="members-controls">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === 'pending' && (
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* Members Table */}
      <div className="members-table-wrapper">
        <table className="members-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              {activeTab === 'active' && <th>JOINED</th>}
              {activeTab === 'active' && <th>SITES</th>}
              {activeTab === 'pending' && <th>REQUESTED</th>}
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <tr key={member.id}>
                  <td>
                    <div className="member-cell">
                      <span className="member-avatar">{member.avatar}</span>
                      <span className="member-name">{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <code className="email">{member.email}</code>
                  </td>
                  {activeTab === 'active' && <td>{member.joinDate}</td>}
                  {activeTab === 'active' && <td><strong>{member.sites}</strong></td>}
                  {activeTab === 'pending' && <td>{member.requestDate}</td>}
                  <td>
                    <button className="action-btn" title="More options">
                      <DotsIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="empty-state">
                  <p>No members found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
