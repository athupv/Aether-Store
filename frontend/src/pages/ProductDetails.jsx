import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { API_URL } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCartWishlist();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/products/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (val) => {
    if (quantity + val < 1 || quantity + val > (product?.stock || 1)) return;
    setQuantity(prev => prev + val);
  };

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setNotification(`Successfully added ${quantity} item(s) to your cart!`);
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification(res.error);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleWishlist = async () => {
    const res = await toggleWishlist(product.id);
    if (res.success) {
      if (res.action === 'added') {
        setNotification("Added to wishlist!");
      } else {
        setNotification("Removed from wishlist.");
      }
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification(res.error);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div>Loading product specifications...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="glass-card text-center p-4">
        <h3 className="text-danger">Product Not Found</h3>
        <p className="text-muted mt-2">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/" className="btn btn-primary mt-4">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);

  return (
    <div className="animate-fade-in">
      <Link to="/" className="btn btn-secondary mb-4" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {notification && (
        <div className={`success-banner animate-fade-in`}>
          {notification}
        </div>
      )}

      <div className="glass-card details-grid">
        <div className="details-image-container">
          <img 
            src={product.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
            alt={product.name} 
            className="details-image" 
          />
        </div>

        <div className="details-info-container">
          <div>
            <span className="details-category">{product.category_name}</span>
            <h1 className="details-name mt-2">{product.name}</h1>
          </div>

          <div className="details-price">${parseFloat(product.price).toFixed(2)}</div>
          
          <p className="details-desc">{product.description}</p>
          
          <div className="details-stock-row">
            <span className="form-label">Availability:</span>
            {product.stock > 0 ? (
              <span className="badge badge-success">{product.stock} Units In Stock</span>
            ) : (
              <span className="badge badge-danger">Temporarily Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="details-actions-row">
              <div className="form-group" style={{ marginBottom: 0, gap: '0.25rem' }}>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Quantity</span>
                <div className="quantity-control">
                  <button onClick={() => handleQuantityChange(-1)} className="quantity-btn" disabled={quantity <= 1}>-</button>
                  <span className="quantity-value">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="quantity-btn" disabled={quantity >= product.stock}>+</button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart} 
                className="btn btn-primary mt-4 w-full"
                style={{ flexGrow: 1 }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          )}

          <button 
            onClick={handleWishlist} 
            className={`btn btn-secondary w-full ${isWish ? 'active-wishlist' : ''}`}
            style={isWish ? { borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' } : {}}
          >
            <Heart size={18} fill={isWish ? "currentColor" : "none"} />
            {isWish ? "Remove from Wishlist" : "Save to Wishlist"}
          </button>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Truck size={18} className="text-muted" />
              <span>Free Express Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={18} className="text-muted" />
              <span>2-Year Full Warranty</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
