import { useState } from 'react';
import './ReportedEventsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const mockReportedEvents = [
  { id: 1, eventName: 'Unauthorized MLM Summit', reason: 'Deceptive Content', reportCount: 16, status: 'Pending', reportedDate: '06/28/2025', host: 'Unknown' },
  { id: 2, eventName: 'Fake Tech Workshop', reason: 'Fraud', reportCount: 22, status: 'Under Review', reportedDate: '06/27/2025', host: 'Tech Scammers' },
  { id: 3, eventName: 'Harmful Ritual Event', reason: 'Dangerous Content', reportCount: 8, status: 'Reviewed', reportedDate: '06/25/2025', host: 'Cult Group' },
  { id: 4, eventName: 'Suspicious Financial Seminar', reason: 'Investment Scam', reportCount: 31, status: 'Pending', reportedDate: '06/29/2025', host: 'Ponzi Operators' },
];

export default function ReportedEventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredEvents = mockReportedEvents.filter((event) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || event.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
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

  const totalReports = mockReportedEvents.reduce((sum, e) => sum + e.reportCount, 0);
  const pendingReports = mockReportedEvents.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.reportCount, 0);
  const reviewedReports = mockReportedEvents.filter(e => e.status === 'Reviewed').reduce((sum, e) => sum + e.reportCount, 0);

  return (
    <div className="reported-events-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Events</h3>
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
          <input type="text" placeholder="Search by event name or host..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Reviewed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="events-table">
          <thead>
            <tr>
              <th>EVENT NAME</th>
              <th>HOST</th>
              <th>REASON</th>
              <th>REPORTS</th>
              <th>STATUS</th>
              <th>REPORTED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td className="event-name">{event.eventName}</td>
                <td>{event.host}</td>
                <td><span className="badge-reason">{event.reason}</span></td>
                <td><span className="badge-count">{event.reportCount}</span></td>
                <td><span className={`badge-status ${getStatusBadgeClass(event.status)}`}>{event.status}</span></td>
                <td className="date">{event.reportedDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
