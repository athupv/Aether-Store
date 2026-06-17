import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth, API_URL } from '../context/AuthContext';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCartLocal } = useCartWishlist();
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4111 2222 3333 4444',
    expiry: '12/29',
    cvv: '123'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.street || !address.city || !address.postalCode || !address.country) {
      setError("Please complete all shipping address fields.");
      return;
    }
    
    setError('');
    setLoading(true);

    const fullShippingAddress = `${address.fullName}\n${address.street}\n${address.city}, ${address.postalCode}\n${address.country}`;
    
    setTimeout(async () => {
      try {
        const paymentId = `sim_tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const response = await authenticatedFetch(`${API_URL}/orders/checkout/`, {
          method: 'POST',
          body: JSON.stringify({
            shipping_address: fullShippingAddress,
            payment_id: paymentId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCreatedOrder(data);
          setSuccess(true);
          clearCartLocal();
        } else {
          const data = await response.json();
          setError(data.error || "Order creation failed. Check stock levels or address.");
        }
      } catch (err) {
        console.error("Checkout submission error:", err);
        setError("A network error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  if (cartItems.length === 0 && !success) {
    return (
      <div className="glass-card empty-state animate-fade-in">
        <ShoppingBag size={48} className="empty-state-icon" />
        <h2 className="empty-state-title">Nothing to Checkout</h2>
        <p className="text-muted">Your cart is empty. Head back to the store to add items before checking out.</p>
        <Link to="/" className="btn btn-primary mt-4">Go to Store</Link>
      </div>
    );
  }

  if (success && createdOrder) {
    return (
      <div className="glass-card text-center p-4 animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <CheckCircle size={64} className="text-accent" style={{ margin: '0 auto 1.5rem' }} />
        <h1 className="mb-2" style={{ fontWeight: 800 }}>Payment Successful!</h1>
        <p className="badge badge-success mb-4">Order Status: Paid</p>
        
        <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          Thank you for your purchase! Your order <strong>#{createdOrder.id}</strong> is being processed. 
          We have sent a confirmation email containing details and tracking parameters.
        </p>

        <div className="glass-card text-left mt-6 mb-4" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>Order Details</h3>
          <div className="summary-row" style={{ marginBottom: '0.5rem' }}>
            <span>Order Number:</span>
            <strong>#{createdOrder.id}</strong>
          </div>
          <div className="summary-row" style={{ marginBottom: '0.5rem' }}>
            <span>Transaction ID:</span>
            <code style={{ fontSize: '0.85rem' }}>{createdOrder.payment_id}</code>
          </div>
          <div className="summary-row" style={{ marginBottom: '0.5rem' }}>
            <span>Shipping Address:</span>
            <span style={{ fontSize: '0.9rem', textAlign: 'right', whiteSpace: 'pre-line' }}>{createdOrder.shipping_address}</span>
          </div>
          <div className="summary-row total" style={{ marginTop: '0.75rem', paddingTop: '0.75rem' }}>
            <span>Total Paid:</span>
            <span>${parseFloat(createdOrder.total_price).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
          <Link to="/orders" className="btn btn-primary">Track Order</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link to="/cart" className="btn btn-secondary mb-4" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="mb-4" style={{ fontWeight: 800 }}>Secure Checkout</h1>

      {error && (
        <div className="error-banner animate-fade-in">
          {error}
        </div>
      )}

      <div className="cart-layout">
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <MapPin size={20} className="text-primary" />
              Shipping Address
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={address.fullName} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="Jane Doe" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input 
                type="text" 
                name="street" 
                value={address.street} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="123 Future Ave, Apt 4B" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={address.city} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Neo City" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal / Zip Code</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  value={address.postalCode} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="90001" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                name="country" 
                value={address.country} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="United States" 
                required 
              />
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <CreditCard size={20} className="text-primary" />
              Secure Payment (Simulated)
            </h2>

            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed var(--primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              🔒 <strong>Sandbox Mode:</strong> Use any dummy credit card number to test the order processing sequence.
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input 
                type="text" 
                name="cardNumber" 
                value={paymentData.cardNumber} 
                onChange={handlePaymentChange} 
                className="form-input" 
                placeholder="4111 2222 3333 4444" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input 
                  type="text" 
                  name="expiry" 
                  value={paymentData.expiry} 
                  onChange={handlePaymentChange} 
                  className="form-input" 
                  placeholder="MM/YY" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input 
                  type="password" 
                  name="cvv" 
                  value={paymentData.cvv} 
                  onChange={handlePaymentChange} 
                  className="form-input" 
                  placeholder="•••" 
                  maxLength="3" 
                  required 
                />
              </div>
            </div>
          </div>
        </form>

        <div className="glass-card cart-summary-card">
          <h2 className="summary-title">Review Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
                <img 
                  src={item.product_details?.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
                  alt={item.product_details?.name} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 600 }}>{item.product_details?.name}</h4>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Qty: {item.quantity}</span>
                </div>
                <strong>${(parseFloat(item.product_details?.price || 0) * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button 
            type="submit" 
            onClick={handleSubmit} 
            className="btn btn-primary w-full mt-6"
            style={{ padding: '0.9rem' }}
            disabled={loading}
          >
            {loading ? "Verifying Transaction..." : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
