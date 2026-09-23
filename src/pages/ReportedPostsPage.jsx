import { useState, useEffect } from 'react';
import './ReportedPostsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}

function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export default function ReportedPostsPage({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, pending: 0, reviewed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

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
    fetchReportedPosts();
  }, []);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/admin/reported-posts?page=1&limit=100`,
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
        throw new Error('Failed to fetch reported posts');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(data.data.reportedPosts || []);
        const totalReports = data.data.reportedPosts?.reduce((sum, p) => sum + p.reportsCount, 0) || 0;
        setStats({
          totalReports,
          pending: data.data.reportedPosts?.filter(p => !p.reviewed).length || 0,
          reviewed: data.data.reportedPosts?.filter(p => p.reviewed).length || 0,
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [postId]: 'deleting' }));
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/admin/reported-posts/${postId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      setPosts(posts.filter(p => p.postId !== postId));
      setOpenActionMenu(null);
    } catch (err) {
      alert(err.message);
      console.error('Error deleting post:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const handleDismissReport = async (postId) => {
    if (!confirm('This will dismiss all reports for this post. Continue?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [postId]: 'dismissing' }));
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/admin/reported-posts/${postId}/dismiss`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to dismiss report');
      }

      setPosts(posts.map(p => p.postId === postId ? { ...p, reviewed: true } : p));
      setOpenActionMenu(null);
    } catch (err) {
      alert(err.message);
      console.error('Error dismissing report:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.author?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Pending' && !post.reviewed) ||
      (statusFilter === 'Reviewed' && post.reviewed);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="reported-posts-page"><p style={{ padding: '40px', textAlign: 'center' }}>Loading posts...</p></div>;
  }

  return (
    <div className="reported-posts-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Posts</h3>
          <p className="header-subtitle">{posts.length} reported posts</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL REPORTS</p>
          <p className="stat-value">{stats.totalReports}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">REVIEWED</p>
          <p className="stat-value">{stats.reviewed}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by author or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All</option>
          <option>Pending</option>
          <option>Reviewed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>AUTHOR</th>
              <th>CONTENT</th>
              <th>REPORTS</th>
              <th>REASONS</th>
              <th>STATUS</th>
              <th>REPORTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.postId}>
                <td className="author-cell">{post.author?.fullName}</td>
                <td className="content-cell">{post.content?.substring(0, 60)}...</td>
                <td><span className="badge-yellow">{post.reportsCount}</span></td>
                <td className="reasons-cell">
                  {post.reports?.map((report, idx) => (
                    <div key={idx} className="reason-item">
                      <span className="reason-text">{report.reason}</span>
                    </div>
                  ))}
                </td>
                <td><span className={`badge-status ${post.reviewed ? 'reviewed' : 'pending'}`}>{post.reviewed ? 'Reviewed' : 'Pending'}</span></td>
                <td>{formatDate(post.createdAt)}</td>
                <td className="action-cell">
                  <div className="action-menu-container">
                    <button
                      className="action-btn"
                      onClick={() => setSelectedPost(post)}
                      title="View post details"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => setOpenActionMenu(openActionMenu === post.postId ? null : post.postId)}
                      disabled={actionLoading[post.postId]}
                    >
                      <DotsIcon />
                    </button>
                    {openActionMenu === post.postId && (
                      <div className="action-dropdown-menu">
                        <button
                          className="action-option delete"
                          onClick={() => handleDeletePost(post.postId)}
                          disabled={actionLoading[post.postId]}
                        >
                          <TrashIcon />
                          Delete Post
                        </button>
                        <button
                          className="action-option dismiss"
                          onClick={() => handleDismissReport(post.postId)}
                          disabled={actionLoading[post.postId]}
                        >
                          <CheckIcon />
                          Dismiss Reports
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

      {selectedPost && (
        <div className="post-details-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="post-details-header">
              <div>
                <h2 className="post-details-title">{selectedPost.author?.fullName || 'Unknown author'}</h2>
                <p className="post-details-subtitle">Reported post details</p>
              </div>
              <button className="post-details-close" onClick={() => setSelectedPost(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <div className="post-details-content">
              <div className="post-details-author">
                <div
                  className="post-details-avatar"
                  style={selectedPost.author?.avatar ? { backgroundImage: `url(${selectedPost.author.avatar})` } : {}}
                >
                  {!selectedPost.author?.avatar && (selectedPost.author?.fullName?.charAt(0).toUpperCase() || '?')}
                </div>
                <div>
                  <p className="post-details-author-name">{selectedPost.author?.fullName || 'Unknown author'}</p>
                  {selectedPost.author?.email && <p className="post-details-author-email">{selectedPost.author.email}</p>}
                </div>
              </div>

              <div className="post-details-field">
                <label>POST CONTENT</label>
                <p className="post-details-full-content">{selectedPost.content || 'N/A'}</p>
              </div>

              <div className="post-details-info">
                <div className="post-details-field">
                  <label>STATUS</label>
                  <span className={`badge-status ${selectedPost.reviewed ? 'reviewed' : 'pending'}`}>
                    {selectedPost.reviewed ? 'Reviewed' : 'Pending'}
                  </span>
                </div>
                <div className="post-details-field">
                  <label>TOTAL REPORTS</label>
                  <p>{selectedPost.reportsCount ?? selectedPost.reports?.length ?? 0}</p>
                </div>
                <div className="post-details-field">
                  <label>REPORTED DATE</label>
                  <p>{formatDate(selectedPost.createdAt)}</p>
                </div>
                <div className="post-details-field">
                  <label>POST ID</label>
                  <p className="post-details-mono">{selectedPost.postId || 'N/A'}</p>
                </div>
              </div>

              <div className="post-details-field">
                <label>REPORT REASONS</label>
                <div className="post-details-reports-list">
                  {selectedPost.reports?.length > 0 ? (
                    selectedPost.reports.map((report, idx) => (
                      <div key={idx} className="post-details-report-item">
                        <span className="reason-text">{report.reason}</span>
                        {report.reportedBy?.fullName && (
                          <span className="post-details-report-by">by {report.reportedBy.fullName}</span>
                        )}
                        {report.createdAt && (
                          <span className="post-details-report-date">{formatDate(report.createdAt)}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="post-details-no-reports">No individual report details available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
