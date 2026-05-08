import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Key, Settings, LogOut, User, 
  Activity, Shield, Copy, Check, Trash2, Edit2, 
  Plus, Calendar, Clock, Globe, Zap, AlertCircle, 
  ChevronRight, ExternalLink, HardDrive, Cpu, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  isActive: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  username: string;
  country: string;
  createdAt: string;
}

const API_BASE = '';

export default function Dashboard() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<ApiKey | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [keyMenuKey, setKeyMenuKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'tools' | 'settings'>('keys');
  
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('never');
  const [editKeyName, setEditKeyName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    console.log('Checking auth...');
    try {
      // Check if user is logged in by fetching profile
      const [profileRes, keysRes] = await Promise.all([
        fetch(`${API_BASE}/api/me`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/keys`, { credentials: 'include' })
      ]);
      
      console.log('profileRes.ok:', profileRes.ok, 'keysRes.ok:', keysRes.ok);
      
      if (!profileRes.ok || !keysRes.ok) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Load user data from backend
      const profileData = await profileRes.json();
      console.log('profileData:', profileData);
      setUserProfile(profileData.user);
      
      // Load API keys
      const keysData = await keysRes.json();
      console.log('keysData:', keysData);
      setKeys(keysData.keys || []);
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {}
    navigate('/login');
  };

  const handleCopy = (id: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateKey = async () => {
    console.log('Generate key clicked, name:', newKeyName, 'expiry:', newKeyExpiry);
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }
    
    let daysUntilExpiry: number | undefined;
    if (newKeyExpiry !== 'never') {
      daysUntilExpiry = parseInt(newKeyExpiry);
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newKeyName, daysUntilExpiry })
      });
      
      console.log('Generate key response:', res.ok, res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('New key data:', data);
        setKeys(prevKeys => [data.apiKey, ...prevKeys]);
        setIsCreateModalOpen(false);
        setNewKeyName('');
        setNewKeyExpiry('never');
      } else {
        const errData = await res.json();
        console.log('Error:', errData);
        setError('Failed to create key: ' + (errData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Generate key error:', err);
      setError('Failed to create key: ' + err);
    }
  };

  const deleteKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/keys/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      } else {
        setError('Failed to delete key');
      }
    } catch (err) {
      setError('Failed to delete key');
    }
  };

  const updateKey = async () => {
    if (!isEditModalOpen || !editKeyName.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/keys/${isEditModalOpen.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editKeyName })
      });
      
      if (res.ok) {
        setKeys(keys.map(k => k.id === isEditModalOpen.id ? { ...k, name: editKeyName } : k));
        setIsEditModalOpen(null);
      } else {
        setError('Failed to update key');
      }
    } catch (err) {
      setError('Failed to update key');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Password updated successfully!');
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to update password');
    }
  };

  const activeKeysCount = keys.filter(k => k.isActive).length;
  const lastGeneratedTime = keys.length > 0 
    ? new Date(Math.max(...keys.map(k => new Date(k.createdAt).getTime()))).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'None';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="text-[#3b5bdb] font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Dashboard Header */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#3b5bdb]/10 text-[#3b5bdb] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Enterprise Node
                </div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System Operational</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#0e1c35] tracking-tighter">
                Control <span className="text-[#3b5bdb]">Center.</span>
              </h1>
              <p className="text-[#5a7499] text-base font-medium max-w-xl leading-relaxed">
                Management portal for geospatial graph connectivity, secure credentialing, and MCP agent permissions.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#3b5bdb] text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 hover:bg-[#2f4ac4] transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Generate Key
              </button>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
              <button onClick={() => setError('')} className="ml-4 font-bold">✕</button>
            </div>
          )}

          {/* Metrics Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
            {[
              { label: 'Active Keys', val: activeKeysCount, icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'bg-green-500', desc: 'Connected nodes' },
              { label: 'Total Keys', val: keys.length, icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'bg-blue-500', desc: 'All credentials' },
              { label: 'Last Generation', val: lastGeneratedTime, icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'bg-amber-500', desc: 'Latest credential' },
              { label: 'Active Tools', val: '4/4', icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'bg-purple-500', desc: 'MCP Protocol status' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-40 sm:h-56"
              >
                <div className={`${stat.color} text-white w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl sm:text-3xl font-black text-[#0e1c35] tracking-tight">{stat.val}</div>
                  <div className="text-[9px] sm:text-[10px] text-[#3b5bdb] font-black uppercase tracking-[0.2em] mb-0.5 sm:mb-1">{stat.label}</div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">{stat.desc}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Management Area */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: 'keys', label: 'API Credentials', icon: <Key size={18} /> },
                { id: 'tools', label: 'MCP Tools', icon: <Cpu size={18} /> },
                { id: 'settings', label: 'Organization', icon: <Settings size={18} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeTab === item.id 
                    ? 'bg-[#3b5bdb] text-white shadow-xl shadow-blue-500/10' 
                    : 'text-[#5a7499] hover:bg-white hover:text-[#0e1c35]'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold text-sm">
                    {item.icon} {item.label}
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${activeTab === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-between p-4 rounded-2xl transition-all group text-red-500 hover:bg-red-50"
              >
                <div className="flex items-center gap-3 font-bold text-sm">
                  <LogOut size={18} /> Logout
                </div>
              </button>
            </div>

            {/* Main Table/Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 bg-[#fafaf7] rounded-2xl flex items-center justify-center text-[#3b5bdb] shrink-0">
                      {activeTab === 'keys' && <Shield size={24} />}
                      {activeTab === 'tools' && <Cpu size={24} />}
                      {activeTab === 'settings' && <Settings size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0e1c35]">
                        {activeTab === 'keys' && 'Access Tokens'}
                        {activeTab === 'tools' && 'MCP Suite'}
                        {activeTab === 'settings' && 'User Profile'}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {activeTab === 'keys' && 'Global Secret Management'}
                        {activeTab === 'tools' && 'Medical Context Protocol'}
                        {activeTab === 'settings' && 'Account Configuration'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                     {activeTab === 'keys' && <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Filtering: Active First</span>}
                  </div>
                </div>

                <div className="flex-1">
                  {activeTab === 'keys' && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-[#fafaf7]">
                            <tr>
                              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">API Key</th>
                              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Header</th>
                              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {keys.map((k) => (
                              <tr key={k.id} className="group hover:bg-[#fafaf7]/50 transition-colors">
                                <td className="px-3 py-4">
                                  <div className="font-black text-[#0e1c35] text-sm">{k.name}</div>
                                </td>
                                <td className="px-3 py-4 font-mono">
                                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 max-w-[120px]">
                                    <span className="text-[9px] text-[#5a7499] truncate">{k.key}</span>
                                    <button 
                                      onClick={() => handleCopy(k.id, k.key)}
                                      className="text-[#3b5bdb] hover:scale-110 transition-transform shrink-0"
                                    >
                                      {copiedId === k.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-4 font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-[#5a7499]">X-API-Key</span>
                                    <button 
                                      onClick={() => handleCopy(k.id, 'X-API-Key')}
                                      className="text-[#3b5bdb] hover:scale-110 transition-transform"
                                      title="Copy header name"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <span className="text-[10px] font-bold text-[#0e1c35]">
                                    {new Date(k.createdAt).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                      k.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                      {k.isActive ? 'Active' : 'Revoked'}
                                    </span>
                                    
                                    {k.isActive && (
                                      <button 
                                        className="p-2 text-gray-400 hover:text-[#0e1c35] transition-colors bg-gray-50 rounded-lg hover:bg-gray-100"
                                        onClick={() => setKeyMenuKey(k.id)}
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                          <circle cx="12" cy="5" r="2"/>
                                          <circle cx="12" cy="12" r="2"/>
                                          <circle cx="12" cy="19" r="2"/>
                                        </svg>
                                      </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {keys.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                          <div className="w-20 h-20 bg-[#fafaf7] rounded-[2rem] flex items-center justify-center text-gray-200 mb-6">
                            <Key size={40} />
                          </div>
                          <h4 className="text-xl font-black text-[#0e1c35]">No API Keys</h4>
                          <p className="text-sm text-[#5a7499] mt-2 max-w-xs mx-auto">No active API credentials found. Generate one to get started.</p>
                          <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-8 bg-[#3b5bdb] text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center gap-2"
                          >
                            <Plus size={16} /> Generate Key
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'tools' && (
                    <div className="p-10 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { name: 'Hospital Discovery', status: 'Core', desc: 'Queries decentralized node registry for medical facility coordinates.', icon: <HardDrive className="text-blue-500" /> },
                            { name: 'Routing Engine', status: 'Core', desc: 'Computes optimal clinical travel paths based on live traffic buffers.', icon: <Activity className="text-green-500" /> },
                            { name: 'Triage Logic', status: 'Pro', desc: 'AI-driven patient classification for resource allocation priority.', icon: <Zap className="text-amber-500" /> },
                            { name: 'Registry Sync', status: 'Enterprise', desc: 'Secure verification of clinical staff credentials via blockchain.', icon: <Globe className="text-purple-500" /> },
                          ].map((tool, i) => (
                            <div key={i} className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl transition-all group">
                               <div className="flex items-start justify-between mb-6">
                                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {tool.icon}
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-gray-50 text-gray-400 rounded-lg">{tool.status}</span>
                               </div>
                               <h4 className="font-black text-[#0e1c35] text-lg mb-2">{tool.name}</h4>
                               <p className="text-sm text-[#5a7499] leading-relaxed mb-6">{tool.desc}</p>
                               <div className="flex items-center justify-between">
                                 <button className="text-[10px] font-black text-[#3b5bdb] uppercase tracking-widest flex items-center gap-2 hover:underline">
                                    Docs <ExternalLink size={12} />
                                 </button>
                                 <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                                 </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeTab === 'settings' && userProfile && (
                    <div className="p-10 max-w-2xl mx-auto space-y-12">
                       <div className="text-center space-y-4">
                          <div className="w-24 h-24 bg-[#3b5bdb] text-white rounded-[2rem] flex items-center justify-center mx-auto text-4xl font-black shadow-2xl shadow-blue-500/20">
                             {userProfile.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-[#0e1c35]">{userProfile.name}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">@{userProfile.username || 'username'}</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="bg-[#fafaf7] rounded-3xl p-8 border border-gray-50">
                             <h5 className="text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-8">Identity Details</h5>
                             
                             <div className="space-y-6">
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</p>
                                   <p className="text-sm font-bold text-[#0e1c35]">{userProfile.name}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Username</p>
                                   <p className="text-sm font-bold text-[#0e1c35]">@{userProfile.username || 'N/A'}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</p>
                                   <p className="text-sm font-bold text-[#0e1c35]">{userProfile.email}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Country</p>
                                   <p className="text-sm font-bold text-[#0e1c35]">{userProfile.country || 'Not specified'}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
                                   <p className="text-sm font-bold text-[#0e1c35]">{userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                             </div>
                          </div>

                          <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-6 text-center">
                             <h5 className="text-[11px] font-black text-[#0e1c35] uppercase tracking-widest">Security Access</h5>
                             <button 
                               onClick={() => setIsPasswordModalOpen(true)}
                               className="w-full bg-[#0e1c35] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                             >
                                Change Password
                             </button>
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#5a7499]">
                      <div className="flex items-center gap-2 hover:text-[#3b5bdb] cursor-pointer">
                        <ExternalLink size={12} /> Documentation
                      </div>
                      <div className="flex items-center gap-2 hover:text-[#3b5bdb] cursor-pointer">
                        <Activity size={12} /> Live Status
                      </div>
                   </div>
                   <div className="text-[10px] font-bold text-gray-400">
                      Total Tokens: <span className="text-[#3b5bdb]">{keys.length}</span>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Create Key Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0e1c35]/80 backdrop-blur-md"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3b5bdb]">
                    <Plus size={28} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-[#0e1c35] tracking-tight">Credential Sync</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Generate New Access Token</p>
                 </div>
              </div>
              
              <div className="space-y-10">
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">Key Name</label>
                  <input 
                    type="text" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production, Development"
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35] placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">Expiry</label>
                  <select 
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35] appearance-none cursor-pointer"
                  >
                    <option value="never">Never (Permanent)</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-5 text-sm font-black text-[#5a7499] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateKey}
                  className="flex-1 bg-[#3b5bdb] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  Generate Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Key Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0e1c35]/80 backdrop-blur-md"
              onClick={() => setIsEditModalOpen(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#3b5bdb]">
                    <Settings size={28} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-[#0e1c35] tracking-tight">Edit API Key</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Update Key Name</p>
                 </div>
              </div>
              
              <div className="space-y-10">
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">Key Name</label>
                  <input 
                    type="text" 
                    value={editKeyName}
                    onChange={(e) => setEditKeyName(e.target.value)}
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35]"
                  />
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsEditModalOpen(null)}
                  className="flex-1 py-5 text-sm font-black text-[#5a7499] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateKey}
                  className="flex-1 bg-[#0e1c35] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-transform"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0e1c35]/80 backdrop-blur-md"
              onClick={() => setIsPasswordModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#3b5bdb]">
                    <Lock size={28} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-[#0e1c35] tracking-tight">Change Password</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Update your password</p>
                 </div>
              </div>
              
              <form onSubmit={changePassword} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">Current Password</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#0e1c35] uppercase tracking-widest mb-4">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-[#fafaf7] border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-[#3b5bdb] transition-all font-bold text-[#0e1c35]"
                  />
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="flex-1 py-5 text-sm font-black text-[#5a7499] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#0e1c35] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-transform"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Key Actions Modal */}
      <AnimatePresence>
        {keyMenuKey && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0e1c35]/80 backdrop-blur-md"
              onClick={() => setKeyMenuKey(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-[#0e1c35] mb-6">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const key = keys.find(k => k.id === keyMenuKey);
                    if (key) {
                      setEditKeyName(key.name);
                      setIsEditModalOpen(key);
                    }
                    setKeyMenuKey(null);
                  }}
                  className="w-full py-4 px-6 text-left font-bold text-[#0e1c35] bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <Edit2 size={18} /> Edit Name
                </button>
                <button 
                  onClick={() => {
                    deleteKey(keyMenuKey);
                    setKeyMenuKey(null);
                  }}
                  className="w-full py-4 px-6 text-left font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={18} /> Delete Key
                </button>
              </div>
              <button 
                onClick={() => setKeyMenuKey(null)}
                className="w-full mt-6 py-3 text-sm font-bold text-gray-400 uppercase tracking-widest"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}