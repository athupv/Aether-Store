import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ShoppingBag, Heart, User, LogOut, Package, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount, wishlistItems } = useCartWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          AETHER<span>STORE</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Shop</Link>
          {user && (
            <>
              <Link to="/orders" className="nav-link">
                <Package size={18} />
                Orders
              </Link>
              <Link to="/wishlist" className="nav-link relative">
                <Heart size={18} />
                Wishlist
                {wishlistItems.length > 0 && (
                  <span className="nav-badge bg-primary-glow">{wishlistItems.length}</span>
                )}
              </Link>
            </>
          )}
          <Link to="/cart" className="nav-link relative">
            <ShoppingBag size={18} />
            Cart
            {getCartCount() > 0 && (
              <span className="nav-badge bg-accent">{getCartCount()}</span>
            )}
          </Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="user-profile-menu">
              <span className="user-name">
                <User size={16} />
                {user.username}
              </span>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm-padding">Sign Up</Link>
            </div>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <Link to="/" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/wishlist" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
                Wishlist ({wishlistItems.length})
              </Link>
              <Link to="/cart" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
                Cart ({getCartCount()})
              </Link>
              <div className="drawer-user-info">
                <span>Logged in as <strong>{user.username}</strong></span>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-danger w-full mt-2">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="drawer-auth-buttons">
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
