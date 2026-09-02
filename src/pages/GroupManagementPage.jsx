import { useState } from 'react';
import './GroupManagementPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

const mockGroups = [
  { id: 1, name: 'Dev Infrastructure', category: 'Technology', privacy: 'Public', owner: 'Marcus Thorne', members: 12482, posts: 45200, status: 'Active', createdDate: '06/02/2023' },
  { id: 2, name: 'Global Design Collective', category: 'Design', privacy: 'Private', owner: 'Elena Voss', members: 8103, posts: 112000, status: 'Active', createdDate: '08/14/2023' },
  { id: 3, name: 'Shadow Traders Elite', category: 'Finance', privacy: 'Private', owner: 'Unknown Entity', members: 542, posts: 1200, status: 'Suspended', createdDate: '01/06/2024' },
  { id: 4, name: 'Alpha Moderators', category: 'Security', privacy: 'Public', owner: 'Soren Kierk', members: 42, posts: 9800, status: 'Pending', createdDate: '11/20/2023' },
];

export default function GroupManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) || group.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Suspended': return 'status-suspended';
      case 'Pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Technology': return 'category-tech';
      case 'Design': return 'category-design';
      case 'Finance': return 'category-finance';
      case 'Security': return 'category-security';
      default: return 'category-default';
    }
  };

  return (
    <div className="group-management-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Group Management</h3>
          <p className="header-subtitle">{mockGroups.length} total groups</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL GROUPS</p>
          <p className="stat-value">{mockGroups.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">ACTIVE</p>
          <p className="stat-value active">{mockGroups.filter((g) => g.status === 'Active').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">TOTAL MEMBERS</p>
          <p className="stat-value members">{(mockGroups.reduce((sum, g) => sum + g.members, 0) / 1000).toFixed(1)}K</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">TOTAL POSTS</p>
          <p className="stat-value posts">{(mockGroups.reduce((sum, g) => sum + g.posts, 0) / 1000).toFixed(1)}K</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by group name or owner..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All</option>
          <option>Active</option>
          <option>Suspended</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="groups-table">
          <thead>
            <tr>
              <th>GROUP NAME</th>
              <th>CATEGORY</th>
              <th>PRIVACY</th>
              <th>OWNER</th>
              <th>MEMBERS</th>
              <th>POSTS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id}>
                <td>
                  <div className="group-cell">
                    <UsersIcon />
                    <span>{group.name}</span>
                  </div>
                </td>
                <td><span className={`badge-category ${getCategoryBadgeClass(group.category)}`}>{group.category}</span></td>
                <td><span className={`badge-privacy ${group.privacy === 'Public' ? 'privacy-public' : 'privacy-private'}`}>{group.privacy}</span></td>
                <td className="owner">{group.owner}</td>
                <td><span className="badge-members">{group.members.toLocaleString()}</span></td>
                <td className="posts">{group.posts.toLocaleString()}</td>
                <td><span className={`badge-status ${getStatusBadgeClass(group.status)}`}>{group.status}</span></td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
