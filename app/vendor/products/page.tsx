'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '../../components/DataTable';
import api from '../../lib/api';

interface Produce {
  id: string;
  name: string;
  category: string;
  price: number;
  availableQuantity: number;
  certificationStatus: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    availableQuantity: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getVendorProduces();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Set mock data for demo
      setProducts([
        {
          id: '1',
          name: 'Organic Tomatoes',
          category: 'Vegetables',
          price: 5.99,
          availableQuantity: 50,
          certificationStatus: 'Approved',
        },
        {
          id: '2',
          name: 'Fresh Lettuce',
          category: 'Vegetables',
          price: 3.49,
          availableQuantity: 5, // Low stock
          certificationStatus: 'Pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduce({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        availableQuantity: formData.availableQuantity,
        certificationStatus: 'Pending',
      });
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        availableQuantity: 0,
      });
      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('Failed to create product. Please try again.');
    }
  };

  const handleEdit = async (id: string) => {
    // For now, just log. In a real app, you'd open an edit modal
    console.log('Edit product:', id);
    // You could implement edit functionality here
    alert('Edit functionality would open a modal/form to update the product');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduce(id);
        // Refresh products list
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Seeds">Seeds</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Available Quantity</label>
              <input
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          data={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}