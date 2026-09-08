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

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <p className="stat-label">TOTAL USERS</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">ACTIVE</p>
          <p className="stat-value">{stats.active}</p>
        </div>
        <div className="stat-card">
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
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">{user.avatar || user.name.substring(0, 2).toUpperCase()}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="role-dropdown-container">
                    <button
                      className={`role-dropdown-btn ${getRoleBadgeClass(user.role)}`}
                      onClick={() => setOpenRoleDropdown(openRoleDropdown === user.id ? null : user.id)}
                    >
                      {user.role}
                      <ChevronDownIcon />
                    </button>
                    {openRoleDropdown === user.id && (
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
                <td className="action-cell">
                  <div className="action-menu-container">
                    <button
                      className="action-btn"
                      onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)}
                    >
                      <DotsIcon />
                    </button>
                    {openActionMenu === user.id && (
                      <div className="action-dropdown-menu">
                        <button
                          className="action-option remove"
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
    </div>
  );
}
