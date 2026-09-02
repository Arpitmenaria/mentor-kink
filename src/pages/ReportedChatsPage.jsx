import { useState } from 'react';
import './ReportedChatsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

const mockReportedChats = [
  { id: 1, sender: 'User#1234', recipient: 'User#5678', message: 'Threatening message content here', reportCount: 3, reason: 'Threats', reportedDate: '08/31/2026', status: 'Pending' },
  { id: 2, sender: 'BadUser123', recipient: 'User#9999', message: 'Persistent harassment and bullying', reportCount: 6, reason: 'Harassment', reportedDate: '08/30/2026', status: 'Pending' },
  { id: 3, sender: 'Spammer456', recipient: 'User#1111', message: 'Click here for cryptocurrency investment', reportCount: 4, reason: 'Scam', reportedDate: '08/29/2026', status: 'Reviewed' },
];

export default function ReportedChatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredChats = mockReportedChats.filter((chat) => {
    const matchesSearch = chat.sender.toLowerCase().includes(searchTerm.toLowerCase()) || chat.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || chat.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || chat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="reported-chats-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Reported Chats</h3>
          <p className="header-subtitle">{mockReportedChats.length} reported conversations</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL REPORTS</p>
          <p className="stat-value purple">{mockReportedChats.reduce((sum, c) => sum + c.reportCount, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value orange">{mockReportedChats.filter((c) => c.status === 'Pending').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">REVIEWED</p>
          <p className="stat-value green">{mockReportedChats.filter((c) => c.status === 'Reviewed').length}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by user or message..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <th>SENDER</th>
              <th>RECIPIENT</th>
              <th>MESSAGE</th>
              <th>REPORTS</th>
              <th>REASON</th>
              <th>STATUS</th>
              <th>REPORTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredChats.map((chat) => (
              <tr key={chat.id}>
                <td className="user-cell">{chat.sender}</td>
                <td className="user-cell">{chat.recipient}</td>
                <td className="content-cell">{chat.message}</td>
                <td><span className="badge-purple">{chat.reportCount}</span></td>
                <td>{chat.reason}</td>
                <td><span className={`badge-status ${chat.status === 'Pending' ? 'pending' : 'reviewed'}`}>{chat.status}</span></td>
                <td>{chat.reportedDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
