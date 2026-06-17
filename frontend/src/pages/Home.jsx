import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/products/?`;
    if (selectedCategory) {
      url += `category=${selectedCategory}&`;
    }
    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="animate-fade-in">
      <header className="mb-4 text-center mt-4">
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Discover the Future of E-Commerce
        </h1>
        <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Explore our collection of handpicked premium goods designed for modern lifestyles.
        </p>
      </header>

      <div className="search-filter-row mt-6">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input" 
          />
        </div>
      </div>

      <div className="category-tabs">
        <button 
          onClick={() => setSelectedCategory('')} 
          className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat.slug)} 
            className={`category-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-4">
          <div className="pulse-glow-hover" style={{ display: 'inline-block', padding: '2rem', borderRadius: '50%' }}>
            Loading catalog...
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <h3 className="empty-state-title">No Products Found</h3>
          <p className="text-muted">We couldn't find any products matching your current filters. Try searching for something else.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory(''); }} className="btn btn-primary mt-2">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
