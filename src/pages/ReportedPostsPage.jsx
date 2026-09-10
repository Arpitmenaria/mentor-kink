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

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getSiteId = () => {
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
      const siteId = getSiteId();
      const response = await fetch(
        `${API_BASE_URL}/api/mini-sites/${siteId}/admin/reported-posts?page=1&limit=100`,
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
      const siteId = getSiteId();
      const response = await fetch(
        `${API_BASE_URL}/api/mini-sites/${siteId}/admin/reported-posts/${postId}`,
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
      const siteId = getSiteId();
      const response = await fetch(
        `${API_BASE_URL}/api/mini-sites/${siteId}/admin/reported-posts/${postId}/dismiss`,
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
    </div>
  );
}
