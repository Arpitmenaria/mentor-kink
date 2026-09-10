export const handleUnauthorized = (response, onLogout) => {
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('organization');
    if (onLogout) {
      onLogout();
    }
    return true;
  }
  return false;
};

export const checkAuthError = async (response, onLogout) => {
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('organization');
    if (onLogout) {
      onLogout();
    }
    return true;
  }
  return false;
};
