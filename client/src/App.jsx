import { useEffect, useState } from 'react';
import API from './api';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { ShoppingBag, ShoppingCart, Search, LogOut, Package, ShieldCheck, X, Plus, Minus } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Accessories', 'Books'];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState('store');
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const fetchProducts = () => {
    API.get('/products', { params: { search, category } })
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    let ignore = false;
    API.get('/products', { params: { search, category } })
      .then(({ data }) => {
        if (!ignore) setProducts(data);
      })
      .catch((err) => console.error(err));
    return () => {
      ignore = true;
    };
  }, [search, category]);

  useEffect(() => {
    let ignore = false;
    if (user && tab === 'orders') {
      API.get('/orders/my-orders')
        .then(({ data }) => {
          if (!ignore) setMyOrders(data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      ignore = true;
    };
  }, [user, tab]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) => (i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      setShowCart(false);
      setShowAuth(true);
      return;
    }
    try {
      const items = cart.map((i) => ({
        productId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      await API.post('/orders', { items, totalAmount: cartTotal });
      setCart([]);
      setShowCart(false);
      setTab('orders');
      alert('Order placed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTab('store');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="bg-white shadow-sm px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30">
        <div onClick={() => setTab('store')} className="flex items-center gap-2 cursor-pointer">
          <ShoppingBag className="w-7 h-7 text-indigo-600" />
          <span className="text-xl font-bold">ShopNova</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setTab('store')} className={`text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer ${tab === 'store' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100'}`}>
            Store
          </button>
          {user && (
            <button onClick={() => setTab('orders')} className={`text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${tab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100'}`}>
              <Package className="w-4 h-4" /> My Orders
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setTab('admin')} className={`text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${tab === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100'}`}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </button>
          )}
          <button onClick={() => setShowCart(true)} className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg cursor-pointer">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">
              Login
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {tab === 'store' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border rounded-xl"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                      category === c ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center text-slate-500">
                No products yet. Sign up as <strong>Admin</strong> and add products from the Admin tab!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <img src={p.image} alt={p.name} className="h-48 w-full object-cover" />
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 uppercase">{p.category}</span>
                        <h3 className="text-lg font-bold mt-1">{p.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold">₹{p.price.toLocaleString()}</span>
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
            {myOrders.length === 0 ? (
              <p className="text-slate-400">You have not placed any orders yet.</p>
            ) : (
              <div className="divide-y">
                {myOrders.map((o) => (
                  <div key={o._id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{o._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">
                        {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{o.totalAmount.toLocaleString()}</p>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'admin' && user?.role === 'admin' && (
          <AdminPanel products={products} refreshProducts={fetchProducts} />
        )}
      </main>

      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="cursor-pointer"><X /></button>
              </div>
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="divide-y mt-4 max-h-[65vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item._id, -1)} className="p-1 bg-slate-100 rounded cursor-pointer"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, 1)} className="p-1 bg-slate-100 rounded cursor-pointer"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold cursor-pointer">
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={setUser} />}
    </div>
  );
}