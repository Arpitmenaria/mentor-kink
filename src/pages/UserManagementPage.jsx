import { useState } from 'react';
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

const mockUsers = [
  { id: 1, name: 'Alex Thompson', email: 'alex@example.com', role: 'Admin', status: 'Active', isPremium: true, joinedDate: '01/15/2026', avatar: 'AT' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Mentor', status: 'Active', isPremium: false, joinedDate: '02/20/2026', avatar: 'SC' },
  { id: 3, name: 'James Wilson', email: 'james@example.com', role: 'User', status: 'Suspended', isPremium: false, joinedDate: '03/10/2026', avatar: 'JW' },
  { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'User', status: 'Active', isPremium: true, joinedDate: '04/05/2026', avatar: 'ED' },
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);
  const [users, setUsers] = useState(mockUsers);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setOpenRoleDropdown(null);
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
    switch (role) {
      case 'Admin':
        return 'role-admin';
      case 'Mentor':
        return 'role-mentor';
      default:
        return 'role-user';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Suspended') return 'status-suspended';
    return 'status-inactive';
  };

  return (
    <div className="user-management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h3 className="header-title">User Management</h3>
          <p className="header-subtitle">{mockUsers.length} total users</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL USERS</p>
          <p className="stat-value">{mockUsers.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">ACTIVE</p>
          <p className="stat-value active">{mockUsers.filter((u) => u.status === 'Active').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">INACTIVE</p>
          <p className="stat-value inactive">{mockUsers.filter((u) => u.status === 'Inactive').length}</p>
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
                    <div className="avatar">{user.avatar}</div>
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
                  <button className="action-btn">
                    <DotsIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
