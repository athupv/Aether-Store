import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Key, User, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || "Login failed. Check credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card auth-form-card">
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogIn size={24} className="text-primary" />
            Welcome Back
          </h2>
          <p className="text-muted mt-2">Log in to manage your cart, wishlist, and track orders.</p>
        </div>

        {error && (
          <div className="error-banner animate-fade-in">
            <Info size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="relative">
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="form-input" 
                placeholder="testuser" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="form-input" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={loading}
            style={{ padding: '0.85rem' }}
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <p className="text-center auth-redirect-text">
          New to Aether Store? <Link to="/register">Create an account</Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          💡 <strong>Demo Credentials:</strong><br />
          • Username: <code>testuser</code><br />
          • Password: <code>testuser123</code>
        </div>
      </div>
    </div>
  );
}
