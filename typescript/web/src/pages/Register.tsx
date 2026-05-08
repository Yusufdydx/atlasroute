import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Globe, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SG', name: 'Singapore' },
  { code: 'OTHER', name: 'Other' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, username, password, country })
      });

      const data = await res.json();
      console.log('Register response:', data);

      if (data.success) {
        console.log('Registration successful, redirecting...');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
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
            <h1 className="text-3xl font-extrabold text-[#0e1c35] tracking-tight">Create account</h1>
            <p className="text-sm text-[#5a7499] mt-2 font-medium">Join the AtlasRoute developer network</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    pattern="[a-zA-Z0-9_]+"
                    title="Letters, numbers, underscores only"
                    className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                    placeholder="johndoe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Country</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow appearance-none"
                >
                  <option value="">Select your country</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
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
                  minLength={8}
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 pr-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                  placeholder="Min 8 characters"
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

            <div>
              <label className="block text-[10px] font-bold text-[#0e1c35] mb-2 uppercase tracking-widest pl-1">Repeat Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 pl-12 pr-12 text-sm text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" 
                  placeholder="Confirm password"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3b5bdb] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#3b5bdb]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-[#5a7499]">
              Already have an account? <Link to="/login" className="text-[#3b5bdb] font-bold">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}