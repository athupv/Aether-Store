import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity, getCartTotal } = useCartWishlist();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="glass-card empty-state animate-fade-in">
        <ShoppingBag size={48} className="empty-state-icon" />
        <h2 className="empty-state-title">Your Cart is Empty</h2>
        <p className="text-muted">Looks like you haven't added anything to your cart yet. Head back to the store to start browsing.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-4" style={{ fontWeight: 800 }}>Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items-container">
          {cartItems.map((item) => {
            const product = item.product_details;
            if (!product) return null;
            
            return (
              <div key={item.id} className="cart-item-card animate-fade-in">
                <img 
                  src={product.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
                  alt={product.name} 
                  className="cart-item-image" 
                />
                
                <div className="cart-item-info">
                  <span className="product-card-category">{product.category_name}</span>
                  <h3 className="cart-item-name">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="cart-item-price">${parseFloat(product.price).toFixed(2)}</div>
                </div>

                <div className="cart-item-right">
                  <div className="quantity-control">
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                      className="quantity-btn"
                      disabled={item.quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="btn-icon text-danger"
                    style={{ marginLeft: '1rem' }}
                    title="Remove from Cart"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card cart-summary-card">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
          </div>

          {shipping > 0 && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Add <strong>${(150 - subtotal).toFixed(2)}</strong> more for FREE shipping!
            </p>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout} 
            className="btn btn-primary w-full mt-6"
            style={{ padding: '0.9rem' }}
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
