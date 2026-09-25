import { useState, useEffect } from 'react';
import './EventManagementPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function TrashIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// The list endpoint returns `fullDate`; the details endpoint returns
// `startDate` instead — neither response has both, so fall back across them.
function getEventDateString(ev) {
  return ev.startDate || ev.fullDate || null;
}

function getEventStatus(ev) {
  const now = new Date();
  const startStr = getEventDateString(ev);
  const start = startStr ? new Date(startStr) : null;
  const end = ev.endDate ? new Date(ev.endDate) : start;
  if (!start) return 'Upcoming';
  if (end && now > end) return 'Completed';
  if (now >= start && (!end || now <= end)) return 'Ongoing';
  return 'Upcoming';
}

function getEventTypeLabel(ev) {
  if (!ev.eventType) return 'N/A';
  return ev.eventType.charAt(0).toUpperCase() + ev.eventType.slice(1).toLowerCase();
}

export default function EventManagementPage({ onCreateClick, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/events?page=1&limit=20`, {
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
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      if (data.success) {
        setEvents(data.data.events || data.data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/events/${eventId}`, {
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
        throw new Error(errorData.message || 'Failed to fetch event details');
      }

      const data = await response.json();
      if (data.success) {
        setEventDetails(data.data);
      }
    } catch (err) {
      setDetailsError(err.message);
      console.error('Error fetching event details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    const eventId = event.id || event._id;
    setSelectedEventId(eventId);
    setEventDetails(null);
    setDetailsError('');
    fetchEventDetails(eventId);
  };

  const closeModal = () => {
    setSelectedEventId(null);
    setEventDetails(null);
    setDetailsError('');
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const eventId = event.id || event._id;
    try {
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/events/${eventId}`, {
        method: 'DELETE',
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
        throw new Error(errorData.message || 'Failed to delete event');
      }

      setEvents((prev) => prev.filter((e) => (e.id || e._id) !== eventId));
    } catch (err) {
      alert(err.message);
      console.error('Error deleting event:', err);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.createdBy?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || getEventStatus(event) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendingCount || 0), 0);

  if (loading) {
    return <div className="event-management-page"><p style={{ padding: '40px', textAlign: 'center' }}>Loading events...</p></div>;
  }

  return (
    <div className="event-management-page">
      <div className="page-header">
        <div>
          <h3 className="header-title">Event Management</h3>
          <p className="header-subtitle">{events.length} total events</p>
        </div>
        <button className="create-event-btn" onClick={onCreateClick}>
          <PlusIcon />
          Create Event
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL EVENTS</p>
          <p className="stat-value">{events.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">UPCOMING</p>
          <p className="stat-value upcoming">{events.filter((e) => getEventStatus(e) === 'Upcoming').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">ONGOING</p>
          <p className="stat-value ongoing">{events.filter((e) => getEventStatus(e) === 'Ongoing').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">TOTAL ATTENDEES</p>
          <p className="stat-value attendees">{totalAttendees}</p>
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
              <th>EVENT TYPE</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id || event._id}>
                <td>
                  <div className="event-cell">
                    <CalendarIcon />
                    <span>{event.title}</span>
                  </div>
                </td>
                <td>{event.category}</td>
                <td className="location">{getEventTypeLabel(event)}</td>
                <td className="date">{formatDate(getEventDateString(event))}</td>
                <td className="action-cell">
                  <button className="action-btn" onClick={() => handleViewEvent(event)} title="View event details">
                    <EyeIcon />
                  </button>
                  <button className="action-btn action-btn--danger" onClick={() => handleDeleteEvent(event)} title="Delete event">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEventId && (
        <div className="event-details-modal-overlay" onClick={closeModal}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-details-header">
              <div>
                <h2 className="event-details-title">{eventDetails?.title || 'Event details'}</h2>
                <p className="event-details-subtitle">Event details</p>
              </div>
              <button className="event-details-close" onClick={closeModal} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {detailsLoading && <p className="event-details-loading">Loading event details...</p>}
            {detailsError && <p className="event-details-loading" style={{ color: 'var(--destructive)' }}>{detailsError}</p>}

            {eventDetails && !detailsLoading && (
              <div className="event-details-content">
                {(eventDetails.image || eventDetails.coverImages?.[0]) && (
                  <div className="event-details-cover" style={{ backgroundImage: `url(${eventDetails.image || eventDetails.coverImages[0]})` }} />
                )}

                <div className="event-details-info">
                  <div className="event-details-field">
                    <label>CATEGORY</label>
                    <p>{eventDetails.category || 'N/A'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>EVENT TYPE</label>
                    <p style={{ textTransform: 'capitalize' }}>{eventDetails.eventType || 'N/A'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>VISIBILITY</label>
                    <p style={{ textTransform: 'capitalize' }}>{eventDetails.visibility || 'N/A'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>PRICING</label>
                    <p>{eventDetails.tickets?.length > 0 ? 'Paid' : 'Free'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>START DATE</label>
                    <p>{formatDate(getEventDateString(eventDetails))}{eventDetails.startTime ? ` at ${eventDetails.startTime}` : ''}</p>
                  </div>
                  <div className="event-details-field">
                    <label>END DATE</label>
                    <p>{eventDetails.endDate ? formatDate(eventDetails.endDate) : 'N/A'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>HOST</label>
                    <p>{eventDetails.createdBy?.fullName || 'N/A'}</p>
                  </div>
                  <div className="event-details-field">
                    <label>ATTENDEES</label>
                    <p>{eventDetails.attendingCount || 0}</p>
                  </div>
                  {(eventDetails.eventType === 'offline' || eventDetails.eventType === 'both') && (
                    <div className="event-details-field">
                      <label>VENUE</label>
                      <p>
                        {eventDetails.location?.venue || 'N/A'}
                        {eventDetails.location?.street ? ` — ${eventDetails.location.street}` : ''}
                        {eventDetails.location?.city ? `, ${eventDetails.location.city}` : ''}
                        {eventDetails.location?.country ? `, ${eventDetails.location.country}` : ''}
                      </p>
                    </div>
                  )}
                  {(eventDetails.eventType === 'online' || eventDetails.eventType === 'both') && (
                    <div className="event-details-field">
                      <label>MEETING LINK</label>
                      <p>{eventDetails.virtualLink || 'N/A'}</p>
                    </div>
                  )}
                  <div className="event-details-field" style={{ gridColumn: '1 / -1' }}>
                    <label>DESCRIPTION</label>
                    <p>{eventDetails.description || 'N/A'}</p>
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
