import { useState } from 'react';
import ImageCropperModal from '../components/ImageCropperModal';
import './CreateEventPage.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
}

function CameraIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function ChevronDownIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
}

function EditIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

const CATEGORIES = [
  'Technology', 'Business', 'Design', 'Music', 'Sports',
  'Education', 'Arts & Culture', 'Health & Wellness', 'Food & Drink', 'Other',
];

const EVENT_TYPES = [
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
  { id: 'both', label: 'Both' },
];

const VISIBILITY_OPTIONS = [
  { id: 'anyone', label: 'Anyone' },
  { id: 'friends', label: 'Friends only' },
  { id: 'only_me', label: 'Only me' },
];

const STEP_LABELS = ['Basic Info', 'Plans & Pricing', 'Location & Logistics', 'Review & Publish'];
const TOTAL_STEPS = STEP_LABELS.length;

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

const capitalizeFirst = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

const initialForm = {
  title: '',
  tagline: '',
  description: '',
  category: '',
  categoryOther: '',
  eventType: '',
  visibility: 'anyone',
  startDate: '',
  endDate: '',
  isAllDay: false,
  startTime: '',
  endTime: '',
};

const initialVenue = {
  name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
};

const initialVirtual = {
  link: '',
  instructions: '',
};

const initialTicket = {
  name: '',
  description: '',
  price: '0.00',
  seats: '100',
  maxPerUser: '1',
};

export default function CreateEventPage({ onBack, onCreateEvent, onLogout }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [venue, setVenue] = useState(initialVenue);
  const [virtual, setVirtual] = useState(initialVirtual);
  const [locationTab, setLocationTab] = useState('physical');
  const [pricingType, setPricingType] = useState('free');
  const [coverImg, setCoverImg] = useState('');
  const [coverImgFile, setCoverImgFile] = useState(null);
  const [cropSrc, setCropSrc] = useState('');
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState(initialTicket);
  const [parking, setParking] = useState('');

  const [stepError, setStepError] = useState('');
  const [stepErrors, setStepErrors] = useState({});
  const [publishErrors, setPublishErrors] = useState([]);
  const [creating, setCreating] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [visDropdownOpen, setVisDropdownOpen] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  const getOrgId = () => {
    const org = JSON.parse(localStorage.getItem('organization') || '{}');
    return org.id;
  };

  // Mini-site events are scoped by siteId. This admin portal only stores the
  // organization's id in localStorage, so we assume a 1:1 org<->mini-site
  // mapping for now — swap this for org.miniSiteId (or a dedicated lookup)
  // once the backend confirms how mini-site ids are actually assigned.
  const getSiteId = () => getOrgId();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openPicker = (e) => {
    if (e.target.showPicker) {
      try { e.target.showPicker(); } catch { /* ignore unsupported/disabled cases */ }
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleCropSave = (blob) => {
    const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
    setCoverImgFile(file);
    setCoverImg(URL.createObjectURL(blob));
    URL.revokeObjectURL(cropSrc);
    setCropSrc('');
  };

  const handleCropCancel = () => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc('');
  };

  const addTicket = () => {
    if (!newTicket.name.trim()) return;
    setTickets((prev) => [...prev, newTicket]);
    setNewTicket(initialTicket);
  };

  const removeTicket = (index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep) => {
    const errors = [];
    const fieldErrors = {};

    if (currentStep === 1) {
      if (!form.title.trim()) {
        errors.push('Event title is required.');
        fieldErrors.title = 'Event title is required.';
      }
      if (!form.category) {
        errors.push('Event category is required.');
        fieldErrors.category = 'Event category is required.';
      } else if (form.category === 'Other' && !form.categoryOther.trim()) {
        errors.push('Please enter a custom category.');
        fieldErrors.category = 'Please enter a custom category.';
      }
      if (!form.startDate) {
        errors.push('Start date is required.');
        fieldErrors.startDate = 'Start date is required.';
      }
    }

    if (currentStep === 3) {
      const showOffline = form.eventType === 'offline' || form.eventType === 'both';
      const showOnline = form.eventType === 'online' || form.eventType === 'both';

      if (showOffline) {
        if (!venue.name.trim()) { errors.push('Venue name is required.'); fieldErrors.venueName = 'Venue name is required.'; }
        if (!venue.street.trim()) { errors.push('Street address is required.'); fieldErrors.street = 'Street address is required.'; }
        if (!venue.city.trim()) { errors.push('City is required.'); fieldErrors.city = 'City is required.'; }
        if (!venue.state.trim()) { errors.push('State is required.'); fieldErrors.state = 'State is required.'; }
      }
      if (showOnline) {
        if (!virtual.link.trim()) { errors.push('Meeting link is required for online events.'); fieldErrors.virtualLink = 'Meeting link is required.'; }
      }
    }

    return { errors, fieldErrors };
  };

  const validateForm = () => {
    return [1, 3].reduce((all, s) => all.concat(validateStep(s).errors), []);
  };

  const handleNext = () => {
    const { errors, fieldErrors } = validateStep(step);
    if (errors.length) {
      setStepError(errors[0]);
      setStepErrors((prev) => ({ ...prev, ...fieldErrors }));
      return;
    }
    setStepError('');
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStepError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handlePublish = async () => {
    const errors = validateForm();
    if (errors.length) {
      setPublishErrors(errors);
      return;
    }

    try {
      setCreating(true);
      setPublishErrors([]);
      const siteId = getSiteId();

      const showOfflineFields = form.eventType === 'offline' || form.eventType === 'both';
      const showOnlineFields = form.eventType === 'online' || form.eventType === 'both';

      const fd = new FormData();
      fd.append('title', capitalizeFirst(form.title.trim()));
      fd.append('description', capitalizeFirst(form.description.trim()));
      fd.append('startDate', form.startDate);
      if (form.endDate) fd.append('endDate', form.endDate);
      fd.append('isAllDay', form.isAllDay ? 'true' : 'false');
      if (!form.isAllDay) {
        if (form.startTime) fd.append('startTime', form.startTime);
        if (form.endTime) fd.append('endTime', form.endTime);
      }
      fd.append('category', form.category === 'Other' ? form.categoryOther.trim() : form.category);
      fd.append('eventType', form.eventType);
      // API only accepts public|private; map our 3-way visibility onto that pair.
      fd.append('visibility', form.visibility === 'anyone' ? 'public' : 'private');
      fd.append('pricingType', pricingType);

      if (pricingType === 'paid') {
        fd.append('tickets', JSON.stringify(tickets.map((t) => ({
          name: t.name,
          description: t.description || '',
          price: Number(t.price) || 0,
          seats: Number(t.seats) || 0,
          maxPerUser: Number(t.maxPerUser) || 1,
        }))));
      }

      if (showOfflineFields) {
        fd.append('venue', JSON.stringify({
          name: venue.name.trim(),
          street: venue.street.trim(),
          city: venue.city.trim(),
          state: venue.state.trim(),
          country: venue.country?.trim() || '',
          pinCode: venue.pinCode?.trim() || '',
          parking: parking?.trim() || '',
        }));
      }
      if (showOnlineFields) {
        fd.append('virtual', JSON.stringify({
          link: virtual.link.trim(),
          instructions: virtual.instructions?.trim() || '',
        }));
      }

      if (coverImgFile) fd.append('coverImages', coverImgFile);

      const response = await fetch(`${API_BASE_URL}/api/mini-sites/${siteId}/events`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: fd,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('organization');
          if (onLogout) onLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to publish event');
      }

      const data = await response.json();
      if (onCreateEvent) onCreateEvent(data.data || data);
    } catch (err) {
      setPublishErrors([err.message || 'Failed to publish event']);
      console.error('Error publishing event:', err);
    } finally {
      setCreating(false);
    }
  };

  const showOffline = form.eventType === 'offline' || form.eventType === 'both';
  const showOnline = form.eventType === 'online' || form.eventType === 'both';

  return (
    <div className="ev-page">
      <div className="ev-header">
        <button type="button" className="ev-back-btn" onClick={onBack} aria-label="Back to events">
          <BackIcon />
        </button>
        <div>
          <h2 className="ev-title">Create Event</h2>
          <p className="ev-subtitle">Step {step} of {TOTAL_STEPS}: {STEP_LABELS[step - 1]}</p>
        </div>
      </div>

      <div className="ev-stepper-card">
        <div className="ev-steps-indicator">
          {STEP_LABELS.map((label, i) => {
            const isActive = step === i + 1;
            const isDone = step > i + 1;
            return (
              <div key={label} className={`ev-step-wrap ${i === STEP_LABELS.length - 1 ? 'last' : ''}`}>
                <div className={`ev-step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  {isDone ? <CheckIcon /> : i + 1}
                </div>
                <span className={`ev-step-text ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>{label}</span>
                {i < STEP_LABELS.length - 1 && <div className={`ev-step-line ${isDone ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ev-form-body">
        <div className="ev-form-step">
          {step === 1 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Step 1: Basic Information</h2>
                <p className="ev-form-subtitle">Set the foundation for your event with essential details that help attendees discover what you're planning.</p>
              </div>

              <div className="ev-form-body">
                {/* Title + Tagline */}
                <div className="ev-field-row">
                  <div className="ev-field">
                    <label className="ev-label">Event Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      className={`ev-input${stepErrors.title ? ' ev-input--error' : ''}`}
                      value={form.title}
                      onChange={(e) => {
                        updateField('title', e.target.value);
                        if (stepErrors.title) setStepErrors(p => ({ ...p, title: '' }));
                      }}
                      placeholder="e.g. Summer Music Festival 2024"
                    />
                    {stepErrors.title && <span className="ev-field-error">{stepErrors.title}</span>}
                  </div>
                  <div className="ev-field">
                    <label className="ev-label">Short Tagline</label>
                    <input
                      className="ev-input"
                      value={form.tagline}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      placeholder="A catchy one-liner for your event"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="ev-field">
                  <label className="ev-label">Description / About Event</label>
                  <textarea
                    className="ev-textarea"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Tell your audience what makes this event special..."
                    rows={5}
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <div className="ev-section-header">
                    <span className="ev-section-title">Date & Time</span>
                    <label className="ev-toggle-label">
                      All Day Event
                      <span className="ev-toggle">
                        <input
                          type="checkbox"
                          checked={form.isAllDay}
                          onChange={(e) => updateField('isAllDay', e.target.checked)}
                        />
                        <span className="ev-toggle-slider" />
                      </span>
                    </label>
                  </div>
                  <div className="ev-date-grid">
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="date"
                        className={`ev-input${stepErrors.startDate ? ' ev-input--error' : ''}`}
                        value={form.startDate}
                        onChange={(e) => {
                          updateField('startDate', e.target.value);
                          if (stepErrors.startDate) setStepErrors(p => ({ ...p, startDate: '' }));
                        }}
                        onClick={openPicker}
                      />
                      {stepErrors.startDate && <span className="ev-field-error">{stepErrors.startDate}</span>}
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">Start Time</label>
                      <input
                        type="time"
                        className="ev-input"
                        value={form.startTime}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        onClick={openPicker}
                      />
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">End Date</label>
                      <input
                        type="date"
                        className="ev-input"
                        value={form.endDate}
                        onChange={(e) => updateField('endDate', e.target.value)}
                        onClick={openPicker}
                      />
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small" style={{ opacity: form.isAllDay ? 0.4 : 1 }}>End Time</label>
                      <input
                        type="time"
                        className="ev-input"
                        value={form.endTime}
                        onChange={(e) => updateField('endTime', e.target.value)}
                        onClick={openPicker}
                        disabled={form.isAllDay}
                      />
                    </div>
                  </div>
                </div>

                {/* Category + Event Type */}
                <div className="ev-field-row">
                  <div className="ev-field">
                    <label className="ev-label">Event Category <span style={{ color: '#ef4444' }}>*</span></label>
                    <div className={`ev-cat-wrap${stepErrors.category ? ' ev-cat-wrap--error' : ''}`}>
                      <button
                        type="button"
                        className={`ev-cat-select-btn${catDropdownOpen ? ' ev-cat-select-btn--open' : ''}`}
                        onClick={() => setCatDropdownOpen(v => !v)}
                      >
                        <span className={form.category ? '' : 'ev-cat-placeholder'}>
                          {form.category || 'Select a category'}
                        </span>
                        <span className={`ev-vis-chevron${catDropdownOpen ? ' ev-vis-chevron--up' : ''}`}><ChevronDownIcon /></span>
                      </button>

                      {catDropdownOpen && (
                        <ul className="ev-vis-dropdown ev-cat-dropdown">
                          {CATEGORIES.map(c => (
                            <li key={c}>
                              <button
                                type="button"
                                className={`ev-vis-option${form.category === c ? ' ev-vis-option--active' : ''}`}
                                onClick={() => {
                                  setForm(prev => ({ ...prev, category: c }));
                                  if (stepErrors.category) setStepErrors(p => ({ ...p, category: '' }));
                                  setCatDropdownOpen(false);
                                }}
                              >
                                <span className="ev-vis-label">{c}</span>
                                {form.category === c && <span className="ev-vis-check"><CheckIcon /></span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {form.category === 'Other' && (
                      <input
                        type="text"
                        className="ev-input ev-cat-other-input"
                        placeholder="Enter Other Category"
                        value={form.categoryOther}
                        onChange={(e) => {
                          setForm(prev => ({ ...prev, categoryOther: e.target.value }));
                          if (stepErrors.category) setStepErrors(p => ({ ...p, category: '' }));
                        }}
                      />
                    )}
                    {stepErrors.category && <span className="ev-field-error">{stepErrors.category}</span>}
                  </div>
                  <div className="ev-field">
                    <label className="ev-label">Event Type</label>
                    <div className="ev-type-buttons">
                      {EVENT_TYPES.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          className={`ev-type-btn${form.eventType === t.id ? ' ev-type-btn--active' : ''}`}
                          onClick={() => setForm(prev => ({ ...prev, eventType: t.id }))}
                        >
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div className="ev-field">
                  <label className="ev-label">Visibility</label>
                  <div className="ev-vis-wrap">
                    <button
                      type="button"
                      className={`ev-vis-chip${visDropdownOpen ? ' ev-vis-chip--open' : ''}`}
                      onClick={() => setVisDropdownOpen(v => !v)}
                    >
                      <span className="ev-vis-chip-main">
                        {VISIBILITY_OPTIONS.find(o => o.id === form.visibility)?.label}
                      </span>
                      <span className={`ev-vis-chevron${visDropdownOpen ? ' ev-vis-chevron--up' : ''}`}><ChevronDownIcon /></span>
                    </button>

                    {visDropdownOpen && (
                      <ul className="ev-vis-dropdown">
                        {VISIBILITY_OPTIONS.map(opt => (
                          <li key={opt.id}>
                            <button
                              type="button"
                              className={`ev-vis-option${form.visibility === opt.id ? ' ev-vis-option--active' : ''}`}
                              onClick={() => { setForm(prev => ({ ...prev, visibility: opt.id })); setVisDropdownOpen(false); }}
                            >
                              <span className="ev-vis-label">{opt.label}</span>
                              {form.visibility === opt.id && <span className="ev-vis-check"><CheckIcon /></span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div className="ev-field">
                  <label className="ev-label">Cover Image</label>
                  <label className="ev-cover-upload-label" style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}>
                    {!coverImg && (
                      <span className="ev-cover-upload-placeholder">
                        <CameraIcon />
                        Click to upload cover image
                      </span>
                    )}
                    <input type="file" accept="image/*" hidden onChange={handleCoverChange} />
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Step 2: Plans & Pricing</h2>
                <p className="ev-form-subtitle">Configure ticket types and pricing options for your attendees.</p>
              </div>

              <div className="ev-s2-layout">
                <div className="ev-s2-left">
                  {/* Free / Paid toggle */}
                  <div className="ev-free-paid-toggle">
                    <button
                      type="button"
                      className={`ev-fp-btn${pricingType === 'free' ? ' ev-fp-btn--active' : ''}`}
                      onClick={() => setPricingType('free')}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      className={`ev-fp-btn${pricingType === 'paid' ? ' ev-fp-btn--active' : ''}`}
                      onClick={() => setPricingType('paid')}
                    >
                      Paid
                    </button>
                  </div>

                  <p className="ev-s2-section-title">Ticket Types</p>

                  {pricingType === 'free' ? (
                    <div className="ev-ticket-list">
                      <div className="ev-ticket-item ev-ticket-item--active ev-ticket-item--readonly">
                        <div className="ev-ticket-icon">🎟️</div>
                        <p className="ev-ticket-name">Free Ticket</p>
                        <p className="ev-ticket-price ev-ticket-price--active">Free</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ev-ticket-list">
                        {tickets.map((tk, i) => (
                          <div key={i} className="ev-ticket-item">
                            <p className="ev-ticket-name">{tk.name}</p>
                            <p className="ev-ticket-price">${Number(tk.price).toFixed(2)}</p>
                            <button
                              type="button"
                              className="ev-ticket-remove-btn"
                              onClick={() => removeTicket(i)}
                              aria-label="Delete ticket"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>

                      {tickets.length < 5 && (
                        <div className="ev-new-ticket-form">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Ticket Name</label>
                            <input
                              className="ev-input"
                              type="text"
                              placeholder="e.g. General Admission"
                              value={newTicket.name}
                              onChange={(e) => setNewTicket((t) => ({ ...t, name: e.target.value }))}
                            />
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Price</label>
                            <input
                              className="ev-input"
                              type="number"
                              placeholder="0.00"
                              value={newTicket.price}
                              onChange={(e) => setNewTicket((t) => ({ ...t, price: e.target.value }))}
                            />
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Members / Seats</label>
                            <input
                              className="ev-input"
                              type="number"
                              placeholder="100"
                              value={newTicket.seats}
                              onChange={(e) => setNewTicket((t) => ({ ...t, seats: e.target.value }))}
                            />
                          </div>
                          <button type="button" className="ev-add-ticket-btn" onClick={addTicket}>Add Ticket</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Location & Logistics</h2>
              </div>

              <div className="ev-form-body">
                <div className="ev-loc-tabs">
                  <button
                    type="button"
                    className={`ev-loc-tab${locationTab === 'physical' ? ' ev-loc-tab--active' : ''}`}
                    onClick={() => setLocationTab('physical')}
                    disabled={form.eventType === 'online'}
                  >
                    Physical Event
                  </button>
                  <button
                    type="button"
                    className={`ev-loc-tab${locationTab === 'online' ? ' ev-loc-tab--active' : ''}`}
                    onClick={() => setLocationTab('online')}
                    disabled={form.eventType === 'offline'}
                  >
                    Online Event
                  </button>
                </div>

                {locationTab === 'physical' && (
                  <>
                    <div className="ev-loc-section">
                      <div className="ev-loc-section-title">📍 Venue Information</div>
                      <div className="ev-loc-section-body">
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Venue Name <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ev-input${stepErrors.venueName ? ' ev-input--error' : ''}`}
                            value={venue.name}
                            onChange={(e) => {
                              setVenue(p => ({ ...p, name: e.target.value }));
                              if (stepErrors.venueName) setStepErrors(p => ({ ...p, venueName: '' }));
                            }}
                            placeholder="e.g. Grand Plaza Convention Center"
                          />
                          {stepErrors.venueName && <span className="ev-field-error">{stepErrors.venueName}</span>}
                        </div>
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Street Address <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ev-input${stepErrors.street ? ' ev-input--error' : ''}`}
                            value={venue.street}
                            onChange={(e) => {
                              setVenue(p => ({ ...p, street: e.target.value }));
                              if (stepErrors.street) setStepErrors(p => ({ ...p, street: '' }));
                            }}
                            placeholder="123 Event Lane, Downtown"
                          />
                          {stepErrors.street && <span className="ev-field-error">{stepErrors.street}</span>}
                        </div>
                        <div className="ev-field-row">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">City <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                              className={`ev-input${stepErrors.city ? ' ev-input--error' : ''}`}
                              value={venue.city}
                              onChange={(e) => {
                                setVenue(p => ({ ...p, city: e.target.value }));
                                if (stepErrors.city) setStepErrors(p => ({ ...p, city: '' }));
                              }}
                              placeholder="City"
                            />
                            {stepErrors.city && <span className="ev-field-error">{stepErrors.city}</span>}
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">State / Province <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                              className={`ev-input${stepErrors.state ? ' ev-input--error' : ''}`}
                              value={venue.state}
                              onChange={(e) => {
                                setVenue(p => ({ ...p, state: e.target.value }));
                                if (stepErrors.state) setStepErrors(p => ({ ...p, state: '' }));
                              }}
                              placeholder="State"
                            />
                            {stepErrors.state && <span className="ev-field-error">{stepErrors.state}</span>}
                          </div>
                        </div>
                        <div className="ev-field-row">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Country</label>
                            <input
                              className="ev-input"
                              value={venue.country}
                              onChange={(e) => setVenue(p => ({ ...p, country: e.target.value }))}
                              placeholder="Select country"
                            />
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Pin Code / ZIP</label>
                            <input
                              className="ev-input"
                              value={venue.pinCode}
                              onChange={(e) => setVenue(p => ({ ...p, pinCode: e.target.value }))}
                              placeholder="000000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ev-loc-section">
                      <div className="ev-loc-section-title">🅿️ Parking & Accessibility</div>
                      <div className="ev-loc-section-body">
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Parking Details</label>
                          <textarea
                            className="ev-textarea"
                            value={parking}
                            onChange={(e) => setParking(e.target.value)}
                            placeholder="Describe parking availability, valet services, or nearby public transit options..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {locationTab === 'online' && (
                  <div className="ev-loc-section">
                    <div className="ev-loc-section-title">🖥️ Virtual Access</div>
                    <div className="ev-loc-section-body">
                      <div className="ev-field">
                        <label className="ev-label ev-label--small">Meeting Link / Platform <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          className={`ev-input${stepErrors.virtualLink ? ' ev-input--error' : ''}`}
                          value={virtual.link}
                          onChange={(e) => {
                            setVirtual(p => ({ ...p, link: e.target.value }));
                            if (stepErrors.virtualLink) setStepErrors(p => ({ ...p, virtualLink: '' }));
                          }}
                          placeholder="https://zoom.us/j/..."
                        />
                        {stepErrors.virtualLink && <span className="ev-field-error">{stepErrors.virtualLink}</span>}
                      </div>
                      <div className="ev-field">
                        <label className="ev-label ev-label--small">Instructions for Joiners</label>
                        <textarea
                          className="ev-textarea"
                          value={virtual.instructions}
                          onChange={(e) => setVirtual(p => ({ ...p, instructions: e.target.value }))}
                          placeholder="e.g. Password will be sent via email&#10;Join 5 minutes early&#10;Camera optional"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="ev-s4-wrap">
              <div className="ev-s4-main">
                <h2 className="ev-s4-title">Review & Publish</h2>

                {/* Basic Info card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Basic Info</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(1)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body">
                    <p className="ev-review-field-label">EVENT TITLE</p>
                    <p className="ev-review-field-value ev-review-title">{form.title || 'Your Event Title'}</p>
                    <p className="ev-review-field-label" style={{ marginTop: 12 }}>DESCRIPTION</p>
                    <p className="ev-review-field-value ev-review-desc">{form.description || 'Event description'}</p>
                    <div className="ev-review-tags">
                      <span className="ev-review-tag">{form.category === 'Other' && form.categoryOther.trim() ? form.categoryOther : form.category || 'Category'}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Tickets card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Pricing & Tickets</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(2)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body ev-review-card-body--tickets">
                    {pricingType === 'free' ? (
                      <div className="ev-review-ticket-row">
                        <p className="ev-review-ticket-name">Free Ticket</p>
                        <span className="ev-review-ticket-price">Free</span>
                      </div>
                    ) : (
                      tickets.map((tk, i) => (
                        <div key={i} className="ev-review-ticket-row">
                          <p className="ev-review-ticket-name">{tk.name}</p>
                          <span className="ev-review-ticket-price">${Number(tk.price).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Location card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Location</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(3)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body">
                    {(form.eventType === 'offline' || form.eventType === 'both') && (
                      <>
                        <p className="ev-review-field-label">VENUE NAME</p>
                        <p className="ev-review-field-value">{venue.name || 'Venue Name'}</p>
                        <p className="ev-review-field-label" style={{ marginTop: 10 }}>ADDRESS</p>
                        <p className="ev-review-field-value">{venue.street && `${venue.street}${venue.city ? ', ' + venue.city : ''}${venue.state ? ', ' + venue.state : ''}${venue.pinCode ? ' ' + venue.pinCode : ''}` || 'Address'}</p>
                      </>
                    )}
                    {(form.eventType === 'online' || form.eventType === 'both') && (
                      <div style={form.eventType === 'both' ? { marginTop: 14 } : undefined}>
                        <p className="ev-review-field-label">MEETING LINK</p>
                        <p className="ev-review-field-value">{virtual.link || 'https://...'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {publishErrors.length > 0 && (
                  <div className="ev-publish-errors">
                    {publishErrors.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ev-actions-bar">
        <button type="button" className="ev-btn-secondary" onClick={onBack} disabled={creating}>
          Cancel
        </button>
        <div className="ev-actions-right">
          {stepError && <span className="ev-error-message">{stepError}</span>}
          {step > 1 && (
            <button type="button" className="ev-btn-secondary" onClick={handleBack} disabled={creating}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" className="ev-btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className="ev-btn-primary" onClick={handlePublish} disabled={creating}>
              {creating ? 'Publishing...' : 'Publish Event'}
            </button>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropperModal
          src={cropSrc}
          aspect={2}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
