import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/theme.css';
import './StorePage.css';

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, featuredOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        featured: featuredOnly ? 'true' : ''
      });

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'song_catalog', label: 'Song Catalogs' },
    { value: 'beat', label: 'Beats' },
    { value: 'instrumental', label: 'Instrumentals' },
    { value: 'sample_pack', label: 'Sample Packs' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="store-page">
      <Header />
      
      <main className="store-main">
        <div className="store-hero">
          <h1>PHONESTREAM Store</h1>
          <p>Browse and purchase premium music products, song catalogs, and more</p>
        </div>

        <div className="store-filters">
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <label className="featured-toggle">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
            />
            <span>Featured Only</span>
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="empty-state">
                <h3>No Products Found</h3>
                <p>Check back soon for new products!</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  {product.image && (
                    <div className="product-image">
                      <img src={product.image} alt={product.title} />
                      {product.isFeatured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                  )}
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="product-category">{product.category.replace('_', ' ')}</p>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">${product.price} {product.currency}</span>
                      <button className="btn btn-primary">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StorePage;
