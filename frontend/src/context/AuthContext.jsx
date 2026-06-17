import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => {
    const saved = localStorage.getItem('authToken');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const refreshAccessToken = async () => {
    if (!authToken?.refresh) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: authToken.refresh })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedToken = {
          access: data.access,
          refresh: authToken.refresh
        };
        setAuthToken(updatedToken);
        localStorage.setItem('authToken', JSON.stringify(updatedToken));
        await fetchUserProfile(data.access);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken?.access) {
      fetchUserProfile(authToken.access).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (authToken) {
        refreshAccessToken();
      }
    }, 1000 * 60 * 15);

    return () => clearInterval(interval);
  }, [authToken]);

  const login = async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data);
      localStorage.setItem('authToken', JSON.stringify(data));
      await fetchUserProfile(data.access);
      return { success: true };
    } else {
      const errData = await response.json();
      return { success: false, error: errData.detail || "Invalid credentials" };
    }
  };

  const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errData = await response.json();
      let errorMsg = "Registration failed";
      if (errData.username) errorMsg = `Username: ${errData.username[0]}`;
      else if (errData.email) errorMsg = `Email: ${errData.email[0]}`;
      else if (errData.password) errorMsg = `Password: ${errData.password[0]}`;
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
  };

  const authenticatedFetch = async (url, options = {}) => {
    let token = authToken?.access;
    
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });
    
    if (response.status === 401 && authToken?.refresh) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh: authToken.refresh })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const updatedToken = {
            access: refreshData.access,
            refresh: authToken.refresh
          };
          setAuthToken(updatedToken);
          localStorage.setItem('authToken', JSON.stringify(updatedToken));
          
          headers['Authorization'] = `Bearer ${refreshData.access}`;
          response = await fetch(url, { ...options, headers });
        } else {
          logout();
        }
      } catch (err) {
        console.error("Token auto-refresh failed during fetch", err);
        logout();
      }
    }
    
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, authToken, loading, login, register, logout, authenticatedFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
