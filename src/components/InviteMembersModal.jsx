import { useState } from 'react';
import './InviteMembersModal.css';

function CloseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CopyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}

function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}

const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

export default function InviteMembersModal({ onClose }) {
  const [inviteLink, setInviteLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const generateInviteLink = async () => {
    try {
      setLoading(true);
      setError('');
      const orgId = getOrgId();
      const response = await fetch(
        `${API_BASE_URL}/api/organizations/${orgId}/invite-link`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ expiresInDays: 7 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invite link');
      }

      const data = await response.json();
      if (data.success) {
        setInviteLink(data.data.link);
        setExpiresAt(new Date(data.data.expiresAt).toLocaleDateString());
      }
    } catch (err) {
      setError(err.message);
      console.error('Error generating invite link:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Members</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {!inviteLink ? (
            <div className="generate-section">
              <p className="description">Generate a unique invite link to share with people you want to add to your organization. The link will expire in 7 days.</p>
              <button
                className="generate-btn"
                onClick={generateInviteLink}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>
          ) : (
            <div className="link-section">
              <div className="link-info">
                <p className="info-label">Your Invite Link</p>
                <p className="expires-text">Expires on: {expiresAt}</p>
              </div>

              <div className="link-container">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="link-input"
                />
                <button
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="share-section">
                <p className="share-label">Share this link with:</p>
                <div className="share-options">
                  <a
                    href={`mailto:?subject=Join my Organization&body=Click the link to join my organization: ${inviteLink}`}
                    className="share-option"
                    title="Send via Email"
                  >
                    📧 Email
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join my organization: ${inviteLink}`)}`}
                    className="share-option"
                    title="Send via WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 WhatsApp
                  </a>
                  <button
                    className="share-option"
                    onClick={() => {
                      const message = `Join my organization: ${inviteLink}`;
                      // Placeholder for other sharing methods
                      alert('Share this link: ' + message);
                    }}
                    title="Share manually"
                  >
                    🔗 Copy & Share
                  </button>
                </div>
              </div>

              <div className="notes">
                <p>✅ <strong>One-time use per person</strong> - Each person needs their own link</p>
                <p>✅ <strong>Expires in 7 days</strong> - Generate a new link after expiry</p>
                <p>✅ <strong>Instant join</strong> - No approval needed, users join immediately</p>
              </div>

              <button className="generate-new-btn" onClick={() => setInviteLink('')}>
                Generate Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
