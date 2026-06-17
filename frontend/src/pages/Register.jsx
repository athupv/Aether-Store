import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(res.error || "Registration failed. Try a different username.");
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
        {success ? (
          <div className="text-center p-4 animate-fade-in">
            <CheckCircle size={48} className="text-accent" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontWeight: 800 }}>Account Created!</h2>
            <p className="text-muted mt-2">Your account has been registered successfully. Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <UserPlus size={24} className="text-primary" />
                Create Account
              </h2>
              <p className="text-muted mt-2">Sign up to buy premium products and track delivery status.</p>
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
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="form-input" 
                  placeholder="choose_username" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="form-input" 
                  placeholder="you@example.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="form-input" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="form-input" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full mt-4" 
                disabled={loading}
                style={{ padding: '0.85rem' }}
              >
                {loading ? "Registering account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center auth-redirect-text">
              Already have an account? <Link to="/login">Log in here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
