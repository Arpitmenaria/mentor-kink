import { useState } from 'react';
import ImageCropper from '../components/ImageCropper';
import './CreateGroupPage.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
}

function CameraIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}

function PencilIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
}

function TrashIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

function ChevronDownIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
}

function GlobeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function ShieldIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

const CATEGORY_OPTIONS = [
  'Technology & Software',
  'Design & Creative',
  'Business & Finance',
  'Education & Learning',
  'Health & Wellness',
  'Entertainment',
  'Sports & Fitness',
  'Travel & Lifestyle',
];

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

export default function CreateGroupPage({ onBack, onCreateGroup, onLogout }) {
  const [groupName, setGroupName] = useState('');
  const [mission, setMission] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const privacy = 'public';

  const [coverImg, setCoverImg] = useState('');
  const [coverImgFile, setCoverImgFile] = useState(null);
  const [groupImg, setGroupImg] = useState('');
  const [groupImgFile, setGroupImgFile] = useState(null);

  const [cropTarget, setCropTarget] = useState(null); // 'cover' | 'photo'
  const [cropFile, setCropFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  const getOrgId = () => {
    const org = JSON.parse(localStorage.getItem('organization') || '{}');
    return org.id;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget('cover');
    setCropFile(file);
    e.target.value = '';
  };

  const handleGroupImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget('photo');
    setCropFile(file);
    e.target.value = '';
  };

  const applyCroppedFile = (file) => {
    const url = URL.createObjectURL(file);
    if (cropTarget === 'cover') {
      setCoverImgFile(file);
      setCoverImg(url);
    } else if (cropTarget === 'photo') {
      setGroupImgFile(file);
      setGroupImg(url);
    }
    setCropFile(null);
    setCropTarget(null);
  };

  const handleCropSave = (croppedFile) => applyCroppedFile(croppedFile);
  const handleCropSkip = () => applyCroppedFile(cropFile);
  const handleCropCancel = () => {
    setCropFile(null);
    setCropTarget(null);
  };

  const handleRemoveCover = () => {
    setCoverImg('');
    setCoverImgFile(null);
  };

  const handleRemoveGroupImg = () => {
    setGroupImg('');
    setGroupImgFile(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length > 50) {
      newErrors.groupName = 'Group name must be 50 characters or less';
    }
    if (mission.length > 100) {
      newErrors.mission = 'Mission must be 100 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!validate()) return;

    try {
      setCreating(true);
      const orgId = getOrgId();

      const formData = new FormData();
      formData.append('name', groupName.trim());
      formData.append('mission', mission.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('privacy', privacy);
      formData.append('adminApproval', false);
      if (coverImgFile) formData.append('coverImg', coverImgFile);
      if (groupImgFile) formData.append('groupImg', groupImgFile);

      const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/groups`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('organization');
          if (onLogout) onLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create group');
      }

      const data = await response.json();
      if (onCreateGroup) onCreateGroup(data.data || data);
    } catch (err) {
      setCreateError(err.message || 'Failed to create group');
      console.error('Error creating group:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="cg-page">
      {/* Cover Section */}
      <div className="cg-cover" style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}>
        {!coverImg && <span className="cg-cover-placeholder">Social Platform</span>}

        <button type="button" className="cg-back-btn" onClick={onBack} aria-label="Back to groups">
          <BackIcon />
        </button>

        <div className="cg-cover-actions">
          <label className="cg-edit-cover-btn">
            <CameraIcon />
            Edit Cover
            <input type="file" accept="image/*" onChange={handleCoverChange} hidden />
          </label>
          {coverImg && (
            <button
              type="button"
              className="cg-remove-cover-btn"
              onClick={handleRemoveCover}
              aria-label="Remove cover image"
              title="Remove cover image"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>

        <div className="cg-profile-photo-wrap">
          <div className="cg-profile-photo" style={groupImg ? { backgroundImage: `url(${groupImg})` } : {}}>
            {!groupImg && <span className="cg-profile-fallback">G</span>}
            <label className="cg-profile-edit-btn" aria-label="Upload group photo">
              <PencilIcon />
              <input type="file" accept="image/*" onChange={handleGroupImgChange} hidden />
            </label>
            {groupImg && (
              <button
                type="button"
                className="cg-profile-remove-btn"
                onClick={handleRemoveGroupImg}
                aria-label="Remove group photo"
                title="Remove group photo"
              >
                <TrashIcon size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="cg-form-container" onSubmit={handleSubmit}>
        <div className="cg-form-column">
          {/* Group Identity */}
          <div className="cg-section">
            <div className="cg-field">
              <div className="cg-label-row">
                <label htmlFor="cg-group-name">Group Name</label>
                <span className="cg-char-count">{groupName.length}/50</span>
              </div>
              <input
                id="cg-group-name"
                type="text"
                value={groupName}
                maxLength={50}
                onChange={(e) => setGroupName(e.target.value)}
                className={errors.groupName ? 'cg-input-error' : ''}
              />
              {errors.groupName && <span className="cg-helper">{errors.groupName}</span>}
            </div>

            <div className="cg-field">
              <div className="cg-label-row">
                <label htmlFor="cg-mission">Group Mission</label>
                <span className="cg-char-count">{mission.length}/100</span>
              </div>
              <input
                id="cg-mission"
                type="text"
                value={mission}
                maxLength={100}
                onChange={(e) => setMission(e.target.value)}
                className={errors.mission ? 'cg-input-error' : ''}
              />
              {errors.mission && <span className="cg-helper">{errors.mission}</span>}
            </div>

            <div className="cg-field">
              <label htmlFor="cg-description">Description</label>
              <textarea
                id="cg-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="cg-field">
              <label htmlFor="cg-category">Category</label>
              <div className="cg-select-wrap">
                <select id="cg-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Privacy & Access */}
          <div className="cg-section">
            <div className="cg-section-header">
              <ShieldIcon size={18} />
              <span>Privacy & Access</span>
            </div>

            <div className="cg-privacy-grid cg-privacy-grid-single">
              <div className="cg-privacy-card active locked" aria-disabled="true">
                <div className="cg-privacy-top">
                  <GlobeIcon />
                  <span className="cg-radio checked" />
                </div>
                <h4>Public Group</h4>
                <p>Anyone can see who's in the group and what they post.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cg-actions-bar">
          {createError && <span className="cg-error-message">{createError}</span>}
          <button type="button" className="cg-btn-secondary" onClick={onBack} disabled={creating}>
            Cancel
          </button>
          <button type="submit" className="cg-btn-primary" disabled={creating || !groupName.trim()}>
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          defaultAspect={cropTarget === 'cover' ? 'cover' : 'square'}
          cropShape={cropTarget === 'cover' ? 'rect' : 'round'}
          onSave={handleCropSave}
          onSkip={handleCropSkip}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
