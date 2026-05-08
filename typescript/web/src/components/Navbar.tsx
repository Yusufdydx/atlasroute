import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, User, LogIn, LogOut } from 'lucide-react';
import Logo from './Logo';

const API_BASE = '';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/me`, { 
        credentials: 'include' 
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUserName(data.user?.name || 'User');
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (e) {}
    setIsAuthenticated(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Stories', href: '/stories' },
    { name: 'Tools', href: '/tools' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 h-18 flex items-center justify-between border-b ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md border-gray-100' 
          : 'bg-[#fafaf7]/0 border-transparent'
      }`}
    >
      <Link to="/" className="no-underline">
        <Logo />
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-10">
        <ul className="flex gap-8 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.href}
                className="text-sm font-semibold text-[#2a3f5f] hover:text-[#3b5bdb] transition-colors no-underline"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-[#0e1c35] hover:text-[#3b5bdb] transition-colors no-underline"
            >
              <User size={18} />
              {userName}
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-xl"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-[#0e1c35] hover:text-[#3b5bdb] transition-colors no-underline">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-[#3b5bdb] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#2f4ac4] transition-all transform hover:-translate-y-0.5 no-underline shadow-lg shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>


      {/* Mobile Toggle */}
      <button 
        className="md:hidden text-[#0e1c35] p-2 bg-gray-50 rounded-xl"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 right-6 w-64 bg-white z-[60] flex flex-col md:hidden shadow-2xl rounded-[2rem] border border-gray-100 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className="text-base font-bold text-[#0e1c35] no-underline py-2.5 hover:text-[#3b5bdb] transition-colors border-b border-gray-50 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-2" />
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 py-3 text-[#0e1c35] font-bold no-underline hover:text-[#3b5bdb] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} /> Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 py-3 text-red-500 font-bold no-underline hover:text-red-600 transition-colors text-left"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center gap-3 py-3 text-[#0e1c35] font-bold no-underline hover:text-[#3b5bdb] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn size={18} /> Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#3b5bdb] text-white font-bold no-underline shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="p-5 bg-gray-50/50 border-t border-gray-50">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">AtlasRoute Protocol</div>
              <p className="text-[10px] text-[#5a7499] leading-tight">
                MCP-ready geospatial intelligence.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}