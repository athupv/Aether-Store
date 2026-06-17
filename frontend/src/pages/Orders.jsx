import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, DollarSign, Check, Clock, Truck, ShieldAlert } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function Orders() {
  const { authenticatedFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/orders/`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          setError("Failed to fetch order history.");
        }
      } catch (err) {
        console.error("Orders fetching error:", err);
        setError("Network error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const getTimelineStatus = (orderStatus) => {
    if (orderStatus === 'pending') return 0;
    if (orderStatus === 'paid') return 1;
    if (orderStatus === 'shipped') return 2;
    if (orderStatus === 'delivered') return 3;
    return -1;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div>Loading your order dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card text-center p-4">
        <h3 className="text-danger">Failed to Load Orders</h3>
        <p className="text-muted mt-2">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass-card empty-state animate-fade-in">
        <Package size={48} className="empty-state-icon" />
        <h2 className="empty-state-title">No Orders Yet</h2>
        <p className="text-muted">You haven't placed any orders on our platform. Your order history will appear here once you make a purchase.</p>
        <Link to="/" className="btn btn-primary mt-4">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-4" style={{ fontWeight: 800 }}>Order History & Tracking</h1>

      <div className="orders-list">
        {orders.map((order) => {
          const activeIndex = getTimelineStatus(order.status);
          
          return (
            <div key={order.id} className="glass-card order-card animate-fade-in" style={{ padding: '1.5rem' }}>
              <div className="order-card-header">
                <div>
                  <h3 className="order-title">Order #{order.id}</h3>
                  <span className="order-date">
                    <Calendar size={14} style={{ display: 'inline-block', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    {formatDate(order.created_at)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {order.status === 'cancelled' ? (
                    <span className="badge badge-danger">Cancelled</span>
                  ) : (
                    <span className="badge badge-success">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  )}
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                    ${parseFloat(order.total_price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="order-items-list">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <img 
                      src={item.product_details?.image_display || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"} 
                      alt={item.product_details?.name || "Product"} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                    
                    <div className="order-item-details">
                      <div className="order-item-name">
                        {item.product_details ? (
                          <Link to={`/products/${item.product_details.id}`}>{item.product_details.name}</Link>
                        ) : (
                          "Deleted Product"
                        )}
                      </div>
                      <span className="order-item-qty">Qty: {item.quantity}</span>
                    </div>

                    <div className="order-item-price">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                <MapPin size={16} className="text-muted" style={{ marginTop: '0.15rem' }} />
                <div>
                  <strong>Shipping to:</strong>
                  <div style={{ whiteSpace: 'pre-line', marginTop: '0.25rem' }}>{order.shipping_address}</div>
                </div>
              </div>

              {order.status !== 'cancelled' && (
                <div className="order-timeline">
                  <div className={`timeline-step ${activeIndex >= 0 ? 'active' : ''}`}>
                    <div className="timeline-dot"><Clock size={16} /></div>
                    <span className="timeline-label">Placed</span>
                  </div>

                  <div className={`timeline-step ${activeIndex >= 1 ? 'active' : ''}`}>
                    <div className="timeline-dot"><Check size={16} /></div>
                    <span className="timeline-label">Paid</span>
                  </div>

                  <div className={`timeline-step ${activeIndex >= 2 ? 'active' : ''}`}>
                    <div className="timeline-dot"><Truck size={16} /></div>
                    <span className="timeline-label">Shipped</span>
                  </div>

                  <div className={`timeline-step ${activeIndex >= 3 ? 'active' : ''}`}>
                    <div className="timeline-dot"><Package size={16} /></div>
                    <span className="timeline-label">Delivered</span>
                  </div>
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
