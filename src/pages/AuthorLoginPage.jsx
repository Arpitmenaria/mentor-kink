import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import './AuthorLoginPage.css';

export default function AuthorLoginPage({ onLogin }) {
  const [orgId, setOrgId] = useState('');
  const [orgName, setOrgName] = useState('Club24');
  const [orgLogo, setOrgLogo] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUrlParams, setHasUrlParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOrgId = params.get('orgId');
    const urlOrgName = params.get('orgName');
    const urlOrgLogo = params.get('orgLogo');
    const urlAdminEmail = params.get('adminEmail');
    const urlAdminPassword = params.get('adminPassword');
    const inviteToken = params.get('invite');

    if (urlOrgId) setOrgId(urlOrgId);
    if (urlOrgName) setOrgName(urlOrgName);
    if (urlOrgLogo) setOrgLogo(urlOrgLogo);
    if (urlAdminEmail) setEmail(urlAdminEmail);
    if (urlAdminPassword) setPassword(urlAdminPassword);

    if (urlOrgId || urlAdminEmail || urlAdminPassword) {
      setHasUrlParams(true);
    }

    if (inviteToken) {
      localStorage.setItem('inviteToken', inviteToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      // Call backend API
      const response = await fetch('https://kick-analyst-backend-production.jay886631.workers.dev/api/organizations/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.data.token) {
        const authorData = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          token: data.data.token,
          organization: data.data.organization.name,
          organizationId: data.data.organization.id,
          organizationStatus: data.data.organization.status,
          loginTime: new Date().toISOString(),
        };

        // Store token in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('organization', JSON.stringify(data.data.organization));

        // Check if there's an invite token to join
        const inviteToken = localStorage.getItem('inviteToken');
        if (inviteToken) {
          try {
            const joinResponse = await fetch('https://kick-analyst-backend-production.jay886631.workers.dev/api/organizations/join-by-invite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.data.token}`,
              },
              body: JSON.stringify({
                token: inviteToken,
              }),
            });

            if (joinResponse.ok) {
              localStorage.removeItem('inviteToken');
            }
          } catch (inviteErr) {
            console.error('Error joining by invite:', inviteErr);
          }
        }

        onLogin(authorData);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="author-login-page">
      <div className="login-container">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="logo-container">
            {orgLogo ? (
              <img src={orgLogo} alt={orgName} className="org-logo" />
            ) : (
              <Music size={40} className="logo-icon" />
            )}
          </div>
          <h1>{orgName}</h1>
          <p className="login-subtitle">Admin Panel</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>

          {error && <div className="login-error">{error}</div>}

          {/* Email Field */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
