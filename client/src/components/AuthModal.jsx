import { useState } from 'react';
import API from '../api';
import { X } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await API.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login to ShopNova' : 'Create Account'}</h2>
        {error && <p className="bg-red-50 text-red-600 text-sm p-2.5 rounded-lg mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {!isLogin && (
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="user">Customer (User)</option>
              <option value="admin">Store Manager (Admin)</option>
            </select>
          )}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold cursor-pointer">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-4">
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-semibold hover:underline cursor-pointer">
            {isLogin ? 'Create Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}