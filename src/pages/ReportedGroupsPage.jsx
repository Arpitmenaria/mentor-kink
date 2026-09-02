import { useState } from 'react';
import './ReportedGroupsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const mockReportedGroups = [
  { id: 1, groupName: 'Crypto Scam Network', reportedBy: 'Marcus Thorne', reason: 'Illegal Activity', reportCount: 24, status: 'Pending', reportedDate: '06/28/2025' },
  { id: 2, groupName: 'Fake Investment Scheme', reportedBy: 'Elena Voss', reason: 'Fraud', reportCount: 18, status: 'Under Review', reportedDate: '06/27/2025' },
  { id: 3, groupName: 'Hate Speech Community', reportedBy: 'Anonymous', reason: 'Hate Speech', reportCount: 12, status: 'Reviewed', reportedDate: '06/25/2025' },
  { id: 4, groupName: 'Private Exploitation Ring', reportedBy: 'John Doe', reason: 'Exploitation', reportCount: 35, status: 'Pending', reportedDate: '06/29/2025' },
];

export default function ReportedGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredGroups = mockReportedGroups.filter((group) => {
    const matchesSearch = group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) || group.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Under Review': return 'status-review';
      case 'Reviewed': return 'status-reviewed';
      default: return 'status-default';
    }
  };

  const totalReports = mockReportedGroups.reduce((sum, g) => sum + g.reportCount, 0);
  const pendingReports = mockReportedGroups.filter(g => g.status === 'Pending').reduce((sum, g) => sum + g.reportCount, 0);
  const reviewedReports = mockReportedGroups.filter(g => g.status === 'Reviewed').reduce((sum, g) => sum + g.reportCount, 0);

  return (
    <div className="reported-groups-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Groups</h3>
          <p className="header-subtitle">{totalReports} total reports</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL REPORTS</p>
          <p className="stat-value">{totalReports}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value pending">{pendingReports}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">REVIEWED</p>
          <p className="stat-value reviewed">{reviewedReports}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by group name or reporter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Reviewed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="groups-table">
          <thead>
            <tr>
              <th>GROUP NAME</th>
              <th>REPORTED BY</th>
              <th>REASON</th>
              <th>REPORTS</th>
              <th>STATUS</th>
              <th>REPORTED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id}>
                <td className="group-name">{group.groupName}</td>
                <td>{group.reportedBy}</td>
                <td><span className="badge-reason">{group.reason}</span></td>
                <td><span className="badge-count">{group.reportCount}</span></td>
                <td><span className={`badge-status ${getStatusBadgeClass(group.status)}`}>{group.status}</span></td>
                <td className="date">{group.reportedDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
