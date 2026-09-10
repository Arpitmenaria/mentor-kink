import { useState, useEffect } from 'react';
import './UserManagementPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

function ChevronDownIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

function UsersIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function CheckCircleIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function AlertIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

export default function UserManagementPage({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatorId, setCreatorId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
    const org = JSON.parse(localStorage.getItem('organization') || '{}');
    if (org.createdBy) setCreatorId(org.createdBy);
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/members/list`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('organization');
          if (onLogout) onLogout();
          return;
        }
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setStats({
          total: data.data.total,
          active: data.data.active,
          suspended: data.data.suspended,
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ role: newRole.toLowerCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role');
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setOpenRoleDropdown(null);
    } catch (err) {
      alert(err.message);
      console.error('Error updating role:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/members/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove member');
      }

      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: prev.active - (users.find(u => u.id === userId)?.status === 'Active' ? 1 : 0),
      }));
      setOpenActionMenu(null);
    } catch (err) {
      alert(err.message);
      console.error('Error removing member:', err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;

    if (statusFilter === 'Active') {
      matchesFilter = user.status === 'Active';
    } else if (statusFilter === 'Suspended') {
      matchesFilter = user.status === 'Suspended';
    } else if (statusFilter === 'Premium') {
      matchesFilter = user.isPremium === true;
    }

    return matchesSearch && matchesFilter;
  });

  const getRoleBadgeClass = (role) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'admin') return 'role-admin';
    if (lowerRole === 'moderator') return 'role-mentor';
    return 'role-user';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Suspended') return 'status-suspended';
    return 'status-inactive';
  };

  if (loading) {
    return <div className="user-management-page"><p style={{ padding: '40px', textAlign: 'center' }}>Loading members...</p></div>;
  }

  return (
    <div className="user-management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h3 className="header-title">User Management</h3>
          <p className="header-subtitle">{stats.total} total users</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <UsersIcon />
          </div>
          <p className="stat-label">TOTAL USERS</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircleIcon />
          </div>
          <p className="stat-label">ACTIVE</p>
          <p className="stat-value">{stats.active}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <AlertIcon />
          </div>
          <p className="stat-label">SUSPENDED</p>
          <p className="stat-value">{stats.suspended}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>
            ALL USERS
          </button>
          <button className={`filter-btn ${statusFilter === 'Active' ? 'active' : ''}`} onClick={() => setStatusFilter('Active')}>
            ACTIVE
          </button>
          <button className={`filter-btn ${statusFilter === 'Suspended' ? 'active' : ''}`} onClick={() => setStatusFilter('Suspended')}>
            SUSPENDED
          </button>
          <button className={`filter-btn ${statusFilter === 'Premium' ? 'active' : ''}`} onClick={() => setStatusFilter('Premium')}>
            PREMIUM
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>JOINED</th>
              <th className="user-mgmt-actions-header" style={{ textAlign: 'center', paddingLeft: '28px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar" style={{ backgroundImage: user.avatar && !user.avatar.includes('http') ? 'none' : `url(${user.avatar})` }}>
                      {!user.avatar || user.avatar.includes('http') ? '' : user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="email-cell">{user.email}</td>
                <td>
                  <div className="role-dropdown-container">
                    <button
                      className={`role-dropdown-btn ${getRoleBadgeClass(user.role)} ${creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin' ? 'disabled' : ''}`}
                      onClick={() => {
                        const isCreator = creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin';
                        if (!isCreator) {
                          setOpenRoleDropdown(openRoleDropdown === user.id ? null : user.id);
                        }
                      }}
                      disabled={creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin'}
                      title={creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin' ? 'Organization creator/admin role cannot be changed' : ''}
                    >
                      {user.role}
                      <ChevronDownIcon />
                    </button>
                    {openRoleDropdown === user.id && !(creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin') && (
                      <div className="role-dropdown-menu">
                        <button
                          className="role-option"
                          onClick={() => handleRoleChange(user.id, 'Admin')}
                        >
                          Admin
                        </button>
                        <button
                          className="role-option"
                          onClick={() => handleRoleChange(user.id, 'Moderator')}
                        >
                          Moderator
                        </button>
                        <button
                          className="role-option"
                          onClick={() => handleRoleChange(user.id, 'Member')}
                        >
                          Member
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinedDate}</td>
                <td className="user-mgmt-action-cell">
                  <div className="user-mgmt-action-menu">
                    <button
                      className="user-mgmt-action-btn"
                      onClick={() => setSelectedUser(user)}
                      title="View user details"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      className="user-mgmt-action-btn"
                      onClick={() => {
                        const isCreator = creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin';
                        if (!isCreator) {
                          setOpenActionMenu(openActionMenu === user.id ? null : user.id);
                        }
                      }}
                      disabled={creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin'}
                      title={creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin' ? 'Cannot modify organization author/admin' : ''}
                    >
                      <DotsIcon />
                    </button>
                    {openActionMenu === user.id && !(creatorId === user.id || user.role.toLowerCase() === 'author' || user.role.toLowerCase() === 'admin') && (
                      <div className="user-mgmt-action-dropdown">
                        <button
                          className="user-mgmt-action-option remove"
                          onClick={() => handleRemoveMember(user.id)}
                        >
                          <TrashIcon />
                          Remove Member
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="user-details-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-details-header">
              <div>
                <h2 className="user-details-title">{selectedUser.name}</h2>
                <p className="user-details-subtitle">User details</p>
              </div>
              <button className="user-details-close" onClick={() => setSelectedUser(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <div className="user-details-content">
              <div className="user-details-profile">
                <div className="avatar-large" style={{ backgroundImage: selectedUser.avatar && !selectedUser.avatar.includes('http') ? 'none' : `url(${selectedUser.avatar})` }}>
                  {!selectedUser.avatar || selectedUser.avatar.includes('http') ? '' : selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="user-details-name">{selectedUser.name}</h3>
                <p className="user-details-email">{selectedUser.email}</p>
              </div>

              <div className="user-details-info">
                <div className="detail-item">
                  <label>EMAIL</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="detail-item">
                  <label>ROLE</label>
                  <span className={`user-details-pill ${selectedUser.role.toLowerCase() === 'admin' ? 'pill-role-admin' : selectedUser.role.toLowerCase() === 'moderator' ? 'pill-role-mentor' : 'pill-role-user'}`}>{selectedUser.role}</span>
                </div>
                <div className="detail-item">
                  <label>STATUS</label>
                  <span className={`user-details-pill ${selectedUser.status === 'Active' ? 'pill-status-active' : 'pill-status-suspended'}`}>{selectedUser.status}</span>
                </div>
                <div className="detail-item">
                  <label>JOINED</label>
                  <p>{selectedUser.joinedDate}</p>
                </div>
                <div className="detail-item">
                  <label>PHONE</label>
                  <p>{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>LOCATION</label>
                  <p>{selectedUser.location || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>PROFESSION</label>
                  <p>{selectedUser.profession || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>BIO</label>
                  <p>{selectedUser.bio || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
