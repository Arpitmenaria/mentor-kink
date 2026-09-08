import { useState } from 'react';
import { Music } from 'lucide-react';
import './AuthorLoginPage.css';

export default function AuthorLoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@rrca.com');
  const [password, setPassword] = useState('SecurePassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            <Music size={40} className="logo-icon" />
          </div>
          <h1>Club24</h1>
          <p className="login-subtitle">Admin Panel</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>

          {error && <div className="login-error">{error}</div>}

          {/* Demo Credentials Info */}
          <div className="demo-info">Demo: admin@rrca.com / SecurePassword123!</div>

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
