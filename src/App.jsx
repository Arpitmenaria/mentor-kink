import { useState, useEffect, useRef } from 'react';
import AuthorLoginPage from './pages/AuthorLoginPage';
import AuthorDashboard from './pages/AuthorDashboard';
import './App.css';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authorData, setAuthorData] = useState(null);
  const logoutTimerRef = useRef(null);

  const clearSessionStorage = () => {
    localStorage.removeItem('authorSession');
    localStorage.removeItem('authToken');
    localStorage.removeItem('organization');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthorData(null);
    clearSessionStorage();
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // Schedules (or immediately triggers) the 24h auto-logout based on the
  // session's stored loginTime, so an expired session is killed whether the
  // tab has been open the whole time or the user just reopened the URL.
  const scheduleAutoLogout = (data) => {
    if (!data?.loginTime) return;
    const elapsed = Date.now() - new Date(data.loginTime).getTime();
    const remaining = SESSION_DURATION_MS - elapsed;

    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    if (remaining <= 0) {
      handleLogout();
      return;
    }
    logoutTimerRef.current = setTimeout(handleLogout, remaining);
  };

  const handleLogin = (data) => {
    setAuthorData(data);
    setIsLoggedIn(true);
    localStorage.setItem('authorSession', JSON.stringify(data));
    scheduleAutoLogout(data);
  };

  // Check if user was already logged in
  useEffect(() => {
    const saved = localStorage.getItem('authorSession');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const elapsed = data.loginTime ? Date.now() - new Date(data.loginTime).getTime() : 0;
      if (data.loginTime && elapsed >= SESSION_DURATION_MS) {
        // Session is already past 24 hours — don't restore it.
        clearSessionStorage();
        return;
      }
      setAuthorData(data);
      setIsLoggedIn(true);
      scheduleAutoLogout(data);
    } catch (err) {
      console.error('Failed to restore session:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A backgrounded/suspended tab (laptop sleep, a mobile tab getting frozen)
  // can miss the scheduled setTimeout firing exactly on time — re-check
  // whenever the tab regains focus so the 24h cutoff still applies even if
  // the timer itself didn't fire while the tab was inactive.
  useEffect(() => {
    if (!isLoggedIn) return;
    const recheck = () => {
      const saved = localStorage.getItem('authorSession');
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        const elapsed = data.loginTime ? Date.now() - new Date(data.loginTime).getTime() : 0;
        if (data.loginTime && elapsed >= SESSION_DURATION_MS) {
          handleLogout();
        }
      } catch {
        // malformed session data — leave it for the mount-time check to handle
      }
    };
    document.addEventListener('visibilitychange', recheck);
    window.addEventListener('focus', recheck);
    return () => {
      document.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('focus', recheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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
