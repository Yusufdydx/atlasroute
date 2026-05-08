import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEmail = emailOrUsername.includes('@');
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: isEmail ? emailOrUsername : null,
          username: isEmail ? null : emailOrUsername,
          password
        })
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login successful, redirecting...');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again. ' + err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Logo className="w-16 h-16 rounded-[1.5rem]" hideText />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0e1c35] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#5a7499] mt-2 font-medium">Access your AtlasRoute developer portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                  placeholder="name@example.com or username"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 pr-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0e1c35] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-[#5a7499]">
              Don't have an account? <Link to="/register" className="text-[#3b5bdb] font-bold">Register</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}