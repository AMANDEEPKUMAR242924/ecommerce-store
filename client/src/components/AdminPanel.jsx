import { useEffect, useState } from 'react';
import API from '../api';
import { Trash2, PlusCircle } from 'lucide-react';

export default function AdminPanel({ products, refreshProducts }) {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: 10,
  });

  const fetchOrders = () => {
    API.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock) });
      setForm({ name: '', description: '', price: '', category: 'Electronics', image: '', stock: 10 });
      refreshProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product');
    }
  };

  const handleDeleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    refreshProducts();
  };

  const handleStatusChange = async (orderId, status) => {
    await API.patch(`/orders/${orderId}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Product */}
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" /> Add New Product
          </h2>
          <input
            type="text"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Short Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Accessories">Accessories</option>
              <option value="Books">Books</option>
            </select>
          </div>
          <input
            type="url"
            placeholder="Image URL (e.g., https://images.unsplash.com/...)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold cursor-pointer">
            Add Product
          </button>
        </form>

        {/* Manage Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">Inventory ({products.length})</h2>
          <div className="divide-y max-h-80 overflow-y-auto">
            {products.map((p) => (
              <div key={p._id} className="py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">₹{p.price} • {p.category}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(p._id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manage All Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold mb-4">Customer Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders placed yet.</p>
        ) : (
          <div className="divide-y">
            {orders.map((o) => (
              <div key={o._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{o.userId?.name || 'Customer'} ({o.userId?.email})</p>
                  <p className="text-xs text-slate-500">
                    {o.items.length} items • Total: ₹{o.totalAmount}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o._id, e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}