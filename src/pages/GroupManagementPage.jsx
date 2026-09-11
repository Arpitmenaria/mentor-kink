import { useState, useEffect } from 'react';
import './GroupManagementPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'N/A';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

const CATEGORY_CLASS_MAP = {
  'Technology & Software': 'category-tech',
  'Design & Creative': 'category-design',
  'Business & Finance': 'category-finance',
  'Education & Learning': 'category-education',
  'Health & Wellness': 'category-health',
  'Entertainment': 'category-entertainment',
  'Sports & Fitness': 'category-sports',
  'Travel & Lifestyle': 'category-travel',
};

export default function GroupManagementPage({ onCreateClick, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('All');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/groups?page=1&limit=50`, {
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
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      if (data.success) {
        setGroups(data.data.groups || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/groups/${groupId}`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch group details');
      }

      const data = await response.json();
      if (data.success) {
        setGroupDetails(data.data);
      }
    } catch (err) {
      setDetailsError(err.message);
      console.error('Error fetching group details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewGroup = (group) => {
    setSelectedGroupId(group._id);
    setGroupDetails(null);
    setDetailsError('');
    fetchGroupDetails(group._id);
  };

  const closeModal = () => {
    setSelectedGroupId(null);
    setGroupDetails(null);
    setDetailsError('');
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.admin?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrivacy = privacyFilter === 'All' || group.privacy.toLowerCase() === privacyFilter.toLowerCase();
    return matchesSearch && matchesPrivacy;
  });

  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount || 0), 0);
  const publicCount = groups.filter((g) => g.privacy === 'public').length;
  const privateCount = groups.filter((g) => g.privacy === 'private').length;
  const vettedCount = groups.filter((g) => g.privacy === 'vetted').length;

  const getCategoryBadgeClass = (category) => CATEGORY_CLASS_MAP[category] || 'category-tech';
  const getPrivacyBadgeClass = (privacy) => `privacy-${privacy}`;

  if (loading) {
    return <div className="group-management-page"><p style={{ padding: '40px', textAlign: 'center' }}>Loading groups...</p></div>;
  }

  return (
    <div className="group-management-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Group Management</h3>
          <p className="header-subtitle">{groups.length} total groups</p>
        </div>
        <button className="create-group-btn" onClick={onCreateClick}>
          <PlusIcon />
          Create Group
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL GROUPS</p>
          <p className="stat-value">{groups.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">TOTAL MEMBERS</p>
          <p className="stat-value members">{totalMembers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PUBLIC</p>
          <p className="stat-value active">{publicCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PRIVATE / VETTED</p>
          <p className="stat-value posts">{privateCount + vettedCount}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by group name or owner..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={privacyFilter} onChange={(e) => setPrivacyFilter(e.target.value)} className="filter-select">
          <option value="All">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="vetted">Vetted</option>
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
              <th>CREATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group._id}>
                <td>
                  <div className="group-cell">
                    <div
                      className="group-avatar"
                      style={group.groupImg ? { backgroundImage: `url(${group.groupImg})` } : {}}
                    >
                      {!group.groupImg && group.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{group.name}</span>
                  </div>
                </td>
                <td><span className={`badge-category ${getCategoryBadgeClass(group.category)}`}>{group.category}</span></td>
                <td><span className={`badge-privacy ${getPrivacyBadgeClass(group.privacy)}`}>{group.privacy}</span></td>
                <td className="owner">{group.admin?.fullName || 'N/A'}</td>
                <td><span className="badge-members">{(group.memberCount || 0).toLocaleString()}</span></td>
                <td className="date">{formatDate(group.createdAt)}</td>
                <td className="action-cell">
                  <button className="action-btn" onClick={() => handleViewGroup(group)} title="View group details">
                    <EyeIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedGroupId && (
        <div className="group-details-modal-overlay" onClick={closeModal}>
          <div className="group-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="group-details-header">
              <div>
                <h2 className="group-details-title">{groupDetails?.name || 'Group details'}</h2>
                <p className="group-details-subtitle">Group details</p>
              </div>
              <button className="group-details-close" onClick={closeModal} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {detailsLoading && <p className="group-details-loading">Loading group details...</p>}
            {detailsError && <p className="group-details-loading" style={{ color: 'var(--destructive)' }}>{detailsError}</p>}

            {groupDetails && !detailsLoading && (
              <div className="group-details-content">
                <div
                  className="group-details-cover"
                  style={groupDetails.coverImg ? { backgroundImage: `url(${groupDetails.coverImg})` } : {}}
                />

                <div className="group-details-profile">
                  <div
                    className="group-details-avatar"
                    style={groupDetails.groupImg ? { backgroundImage: `url(${groupDetails.groupImg})` } : {}}
                  >
                    {!groupDetails.groupImg && groupDetails.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="group-details-name">{groupDetails.name}</h3>
                  {groupDetails.mission && <p className="group-details-mission">{groupDetails.mission}</p>}
                </div>

                <div className="group-details-info">
                  <div className="group-details-field">
                    <label>CATEGORY</label>
                    <p>{groupDetails.category}</p>
                  </div>
                  <div className="group-details-field">
                    <label>PRIVACY</label>
                    <span className={`group-details-pill pill-${groupDetails.privacy}`}>{groupDetails.privacy}</span>
                  </div>
                  <div className="group-details-field">
                    <label>ADMIN APPROVAL</label>
                    <p>{groupDetails.adminApproval ? 'Required' : 'Not required'}</p>
                  </div>
                  <div className="group-details-field">
                    <label>MIN AGE</label>
                    <p>{groupDetails.minAge || 'N/A'}</p>
                  </div>
                  <div className="group-details-field">
                    <label>OWNER</label>
                    <p>{groupDetails.admin?.fullName || 'N/A'}</p>
                  </div>
                  <div className="group-details-field">
                    <label>MEMBERS</label>
                    <p>{groupDetails.memberCount || 0}</p>
                  </div>
                  <div className="group-details-field">
                    <label>CREATED</label>
                    <p>{formatDate(groupDetails.createdAt)}</p>
                  </div>
                  <div className="group-details-field">
                    <label>DESCRIPTION</label>
                    <p>{groupDetails.description || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
