import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <Ticket className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tighter">ShowTix</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary transition">Events</Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-black uppercase tracking-widest transition-all ${
                    window.location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {user.role === 'User' ? 'My Tickets' : 'Dashboard'}
                </Link>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-600 font-medium hover:text-primary mt-2">Login</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-primary">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary px-2" onClick={() => setIsMenuOpen(false)}>Events</Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-900 font-black uppercase tracking-widest text-xs px-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.role === 'User' ? 'My Tickets' : 'Dashboard'}
                  </Link>
                  <div className="px-2 py-3 bg-slate-900 rounded-xl">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active: {user.name}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-rose-500 font-black uppercase tracking-widest text-xs px-2">
                    Terminate Session
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary px-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="text-primary font-medium px-2" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
