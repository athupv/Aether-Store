import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartWishlistProvider } from './context/CartWishlistContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="pulse-glow-hover" style={{ display: 'inline-block', padding: '2rem', borderRadius: '50%' }}>
          Verifying security session...
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartWishlistProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="text-center text-muted p-4" style={{ borderTop: '1px solid var(--glass-border)', marginTop: 'auto', background: 'rgba(5, 7, 12, 0.4)', backdropFilter: 'blur(8px)' }}>
              <p style={{ fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} AETHER STORE. Powered by Django REST Framework & React. All rights reserved.
              </p>
            </footer>
          </div>
        </Router>
      </CartWishlistProvider>
    </AuthProvider>
  );
}

export default App;
