import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist, addToCart } = useCartWishlist();

  const handleRemove = (productId) => {
    toggleWishlist(productId);
  };

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="glass-card empty-state animate-fade-in">
        <Heart size={48} className="empty-state-icon" />
        <h2 className="empty-state-title">Your Wishlist is Empty</h2>
        <p className="text-muted">Save items that you like to your wishlist, and they will show up here for easy access later.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-4" style={{ fontWeight: 800 }}>My Wishlist</h1>

      <div className="product-grid">
        {wishlistItems.map((item) => {
          const product = item.product_details;
          if (!product) return null;

          return (
            <div key={item.id} className="product-card animate-fade-in">
              <div className="product-img-wrapper">
                <img 
                  src={product.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
                  alt={product.name} 
                  className="product-img" 
                />
                <button 
                  onClick={() => handleRemove(product.id)} 
                  className="btn-icon product-card-wishlist active"
                  title="Remove from Wishlist"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>

              <div className="product-card-info">
                <span className="product-card-category">{product.category_name}</span>
                <h3 className="product-card-name">
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="product-card-desc">{product.description}</p>
                
                <div className="product-card-bottom">
                  <span className="product-card-price">${parseFloat(product.price).toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleRemove(product.id)} 
                      className="btn btn-secondary btn-icon"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    {product.stock > 0 ? (
                      <button 
                        onClick={() => handleAddToCart(product.id)} 
                        className="btn btn-primary btn-sm-padding"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    ) : (
                      <span className="badge badge-danger">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
