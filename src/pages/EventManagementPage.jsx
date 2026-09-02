import { useState } from 'react';
import './EventManagementPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

const mockEvents = [
  { id: 1, name: 'Tech Conference 2026', category: 'Technology', location: 'San Francisco, CA', attendees: 450, capacity: 500, status: 'Upcoming', eventDate: '09/15/2026', host: 'Alex Thompson' },
  { id: 2, name: 'Design Workshop', category: 'Design', location: 'New York, NY', attendees: 120, capacity: 150, status: 'Ongoing', eventDate: '09/01/2026', host: 'Sarah Chen' },
  { id: 3, name: 'Business Networking', category: 'Business', location: 'Chicago, IL', attendees: 200, capacity: 300, status: 'Completed', eventDate: '08/20/2026', host: 'James Wilson' },
  { id: 4, name: 'Music Festival', category: 'Entertainment', location: 'Los Angeles, CA', attendees: 2500, capacity: 3000, status: 'Upcoming', eventDate: '09/25/2026', host: 'Emma Davis' },
];

export default function EventManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || event.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Upcoming': return 'status-upcoming';
      case 'Ongoing': return 'status-ongoing';
      case 'Completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  return (
    <div className="event-management-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Event Management</h3>
          <p className="header-subtitle">{mockEvents.length} total events</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL EVENTS</p>
          <p className="stat-value">{mockEvents.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">UPCOMING</p>
          <p className="stat-value upcoming">{mockEvents.filter((e) => e.status === 'Upcoming').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">ONGOING</p>
          <p className="stat-value ongoing">{mockEvents.filter((e) => e.status === 'Ongoing').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">TOTAL ATTENDEES</p>
          <p className="stat-value attendees">{mockEvents.reduce((sum, e) => sum + e.attendees, 0)}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by event name or host..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All</option>
          <option>Upcoming</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="events-table">
          <thead>
            <tr>
              <th>EVENT NAME</th>
              <th>CATEGORY</th>
              <th>LOCATION</th>
              <th>ATTENDEES</th>
              <th>HOST</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  <div className="event-cell">
                    <CalendarIcon />
                    <span>{event.name}</span>
                  </div>
                </td>
                <td>{event.category}</td>
                <td className="location">{event.location}</td>
                <td><span className="badge-attendees">{event.attendees}/{event.capacity}</span></td>
                <td className="host">{event.host}</td>
                <td><span className={`badge-status ${getStatusBadgeClass(event.status)}`}>{event.status}</span></td>
                <td className="date">{event.eventDate}</td>
                <td className="action-cell"><button className="action-btn"><DotsIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
