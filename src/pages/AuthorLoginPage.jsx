import { useState } from 'react';
import { Music } from 'lucide-react';
import './AuthorLoginPage.css';

export default function AuthorLoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // Simulate API call
    setTimeout(() => {
      // Mock authentication
      if (email && password.length >= 6) {
        const authorData = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          organization: 'Club24',
          loginTime: new Date().toISOString(),
        };
        onLogin(authorData);
      } else {
        setError('Invalid credentials');
      }
      setLoading(false);
    }, 1000);
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
