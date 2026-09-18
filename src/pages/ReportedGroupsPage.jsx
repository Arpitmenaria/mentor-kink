import { useState, useEffect } from 'react';
import './ReportedGroupsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

const STATUS_QUERY_MAP = {
  Pending: 'pending',
  'Under Review': 'under_review',
  Reviewed: 'reviewed',
};

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export default function ReportedGroupsPage({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reports, setReports] = useState([]);
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
    fetchReports(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchReports = async (filter) => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const statusQuery = STATUS_QUERY_MAP[filter];
      const url = `${API_BASE_URL}/api/organizations/${orgId}/reports${statusQuery ? `?status=${statusQuery}` : ''}`;

      const response = await fetch(url, {
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
        throw new Error('Failed to fetch reported groups');
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports || data.data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reported groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (report) => report.group?.name || report.groupName || 'N/A';
  const getReportedBy = (report) => report.reportedBy?.fullName || report.reportedBy || 'Anonymous';
  const getReason = (report) => report.reason || report.reports?.[0]?.reason || 'N/A';
  const getReportCount = (report) => report.reportsCount ?? report.reportCount ?? report.reports?.length ?? 1;
  const getStatus = (report) => report.status || (report.reviewed ? 'Reviewed' : 'Pending');
  const getReportedDate = (report) => report.createdAt || report.reportedDate;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      getGroupName(report).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getReportedBy(report).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || getStatus(report).toLowerCase().replace(/\s+/g, '_') === STATUS_QUERY_MAP[statusFilter];
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'under_review':
      case 'under review': return 'status-review';
      case 'reviewed': return 'status-reviewed';
      default: return 'status-default';
    }
  };

  const totalReports = reports.reduce((sum, r) => sum + getReportCount(r), 0);
  const pendingReports = reports.filter(r => getStatus(r).toLowerCase() === 'pending').reduce((sum, r) => sum + getReportCount(r), 0);
  const reviewedReports = reports.filter(r => getStatus(r).toLowerCase() === 'reviewed').reduce((sum, r) => sum + getReportCount(r), 0);

  if (loading) {
    return <div className="reported-groups-page"><p style={{ padding: '40px', textAlign: 'center' }}>Loading reported groups...</p></div>;
  }

  return (
    <div className="reported-groups-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Groups</h3>
          <p className="header-subtitle">{totalReports} total reports</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

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
            {filteredReports.map((report) => (
              <tr key={report._id || report.id}>
                <td className="group-name">{getGroupName(report)}</td>
                <td>{getReportedBy(report)}</td>
                <td><span className="badge-reason">{getReason(report)}</span></td>
                <td><span className="badge-count">{getReportCount(report)}</span></td>
                <td><span className={`badge-status ${getStatusBadgeClass(getStatus(report))}`}>{getStatus(report)}</span></td>
                <td className="date">{formatDate(getReportedDate(report))}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No reported groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
