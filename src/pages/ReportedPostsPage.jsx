import { useState } from 'react';
import './ReportedPostsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const mockReportedPosts = [
  { id: 1, author: 'John Doe', content: 'This is a post with inappropriate content that was reported by multiple users', reportCount: 12, reason: 'Inappropriate Content', reportedDate: '08/31/2026', status: 'Pending' },
  { id: 2, author: 'Jane Smith', content: 'Spam message trying to promote external links and services', reportCount: 8, reason: 'Spam', reportedDate: '08/30/2026', status: 'Reviewed' },
  { id: 3, author: 'Mike Johnson', content: 'Harassment targeting specific user community', reportCount: 15, reason: 'Harassment', reportedDate: '08/29/2026', status: 'Pending' },
];

export default function ReportedPostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPosts = mockReportedPosts.filter((post) => {
    const matchesSearch = post.author.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="reported-posts-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Posts</h3>
          <p className="header-subtitle">{mockReportedPosts.length} reported posts</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL REPORTS</p>
          <p className="stat-value yellow">{mockReportedPosts.reduce((sum, p) => sum + p.reportCount, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value orange">{mockReportedPosts.filter((p) => p.status === 'Pending').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">REVIEWED</p>
          <p className="stat-value green">{mockReportedPosts.filter((p) => p.status === 'Reviewed').length}</p>
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
              <th>REASON</th>
              <th>STATUS</th>
              <th>REPORTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.id}>
                <td className="author-cell">{post.author}</td>
                <td className="content-cell">{post.content}</td>
                <td><span className="badge-yellow">{post.reportCount}</span></td>
                <td>{post.reason}</td>
                <td><span className={`badge-status ${post.status === 'Pending' ? 'pending' : 'reviewed'}`}>{post.status}</span></td>
                <td>{post.reportedDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
