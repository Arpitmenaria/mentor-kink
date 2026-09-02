import { useState, useEffect } from 'react';
import AuthorLoginPage from './pages/AuthorLoginPage';
import AuthorDashboard from './pages/AuthorDashboard';
import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authorData, setAuthorData] = useState(null);

  const handleLogin = (data) => {
    setAuthorData(data);
    setIsLoggedIn(true);
    // Save to localStorage for persistence
    localStorage.setItem('authorSession', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthorData(null);
    localStorage.removeItem('authorSession');
  };

  // Check if user was already logged in
  useEffect(() => {
    const saved = localStorage.getItem('authorSession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAuthorData(data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
    }
  }, []);

  return (
    <div className="app">
      {!isLoggedIn ? (
        <AuthorLoginPage onLogin={handleLogin} />
      ) : (
        <AuthorDashboard authorData={authorData} onLogout={handleLogout} />
      )}
    </div>
  );
}
