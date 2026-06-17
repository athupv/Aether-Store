import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCartWishlist();
  
  const inWishlist = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-img-wrapper">
        <img 
          src={product.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
          alt={product.name} 
          className="product-img" 
        />
        <button 
          onClick={handleWishlist} 
          className={`btn-icon product-card-wishlist ${inWishlist ? 'active' : ''}`}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="product-card-info">
        <span className="product-card-category">{product.category_name}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        
        <div className="product-card-bottom">
          <span className="product-card-price">${parseFloat(product.price).toFixed(2)}</span>
          {product.stock > 0 ? (
            <button 
              onClick={handleAddToCart} 
              className="btn btn-primary btn-sm-padding"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
              Add
            </button>
          ) : (
            <span className="badge badge-danger">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
