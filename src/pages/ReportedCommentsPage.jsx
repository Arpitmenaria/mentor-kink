import { useState } from 'react';
import './ReportedCommentsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const mockReportedComments = [
  { id: 1, author: 'User123', comment: 'This is an offensive comment directed at the community', reportCount: 7, reason: 'Hate Speech', reportedDate: '08/31/2026', status: 'Pending' },
  { id: 2, author: 'Commenter456', comment: 'Check out this link for free money!', reportCount: 5, reason: 'Phishing', reportedDate: '08/30/2026', status: 'Pending' },
  { id: 3, author: 'BadUser789', comment: 'Trolling and harassment comment', reportCount: 9, reason: 'Harassment', reportedDate: '08/29/2026', status: 'Reviewed' },
];

export default function ReportedCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredComments = mockReportedComments.filter((comment) => {
    const matchesSearch = comment.author.toLowerCase().includes(searchTerm.toLowerCase()) || comment.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="reported-comments-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Comments</h3>
          <p className="header-subtitle">{mockReportedComments.length} reported comments</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL REPORTS</p>
          <p className="stat-value red">{mockReportedComments.reduce((sum, c) => sum + c.reportCount, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value orange">{mockReportedComments.filter((c) => c.status === 'Pending').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">REVIEWED</p>
          <p className="stat-value green">{mockReportedComments.filter((c) => c.status === 'Reviewed').length}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by author or comment..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <th>COMMENT</th>
              <th>REPORTS</th>
              <th>REASON</th>
              <th>STATUS</th>
              <th>REPORTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((comment) => (
              <tr key={comment.id}>
                <td className="author-cell">{comment.author}</td>
                <td className="content-cell">{comment.comment}</td>
                <td><span className="badge-red">{comment.reportCount}</span></td>
                <td>{comment.reason}</td>
                <td><span className={`badge-status ${comment.status === 'Pending' ? 'pending' : 'reviewed'}`}>{comment.status}</span></td>
                <td>{comment.reportedDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
