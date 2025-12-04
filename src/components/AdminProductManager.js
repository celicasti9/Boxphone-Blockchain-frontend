import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './AdminProductManager.css';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    price: '',
    currency: 'USD',
    image: '',
    images: [],
    isAvailable: true,
    isFeatured: false,
    metadata: {}
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: 'other',
      price: '',
      currency: 'USD',
      image: '',
      images: [],
      isAvailable: true,
      isFeatured: false,
      metadata: {}
    });
    setShowAddForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'other',
      price: product.price || '',
      currency: product.currency || 'USD',
      image: product.image || '',
      images: product.images || [],
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      isFeatured: product.isFeatured || false,
      metadata: product.metadata || {}
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: 'other',
      price: '',
      currency: 'USD',
      image: '',
      images: [],
      isAvailable: true,
      isFeatured: false,
      metadata: {}
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct}`, formData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully!');
      }

      setShowAddForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="admin-product-manager">
      <div className="product-manager-header">
        <h2>Product Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add New Product
        </button>
      </div>

      {showAddForm && (
        <div className="product-form-modal">
          <div className="product-form">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                >
                  <option value="song_catalog">Song Catalog</option>
                  <option value="beat">Beat</option>
                  <option value="instrumental">Instrumental</option>
                  <option value="sample_pack">Sample Pack</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="form-input"
                >
                  <option value="USD">USD</option>
                  <option value="BNB">BNB</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Main Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="form-input"
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                Available for purchase
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Featured product
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="products-list">
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to create one.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                {product.image && (
                  <div className="product-image">
                    <img src={product.image} alt={product.title} />
                    {product.isFeatured && <span className="featured-badge">Featured</span>}
                  </div>
                )}
                <div className="product-info">
                  <h4>{product.title}</h4>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">${product.price} {product.currency}</p>
                  <div className="product-status">
                    <span className={product.isAvailable ? 'status-available' : 'status-unavailable'}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="product-actions">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;
