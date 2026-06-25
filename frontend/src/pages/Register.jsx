import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: urlRole || 'User',
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (urlRole && (urlRole === 'User' || urlRole === 'Artist' || urlRole === 'Admin')) {
      setFormData(prev => ({ ...prev, role: urlRole }));
    }
  }, [urlRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    
    if (result.success) {
      toast.success(result.message || 'Registration successful! You can now log in.', { duration: 4000 });
      navigate(`/login?role=${formData.role}`);
    } else {
      toast.error(result.message);
    }
    
    setLoadingLocal(false);
  };

  const activeRole = formData.role || 'User';

  const getRoleColors = (r) => {
    switch (r) {
      case 'Admin':
        return {
          bgAccent: 'bg-emerald-500/10',
          borderFocus: 'focus:ring-emerald-500/25 focus:border-emerald-500',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 hover:shadow-emerald-200',
          textLink: 'text-emerald-600',
          headingColor: 'text-emerald-600',
        };
      case 'Artist':
        return {
          bgAccent: 'bg-blue-500/10',
          borderFocus: 'focus:ring-blue-500/25 focus:border-blue-500',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200',
          textLink: 'text-blue-600',
          headingColor: 'text-blue-600',
        };
      case 'User':
      default:
        return {
          bgAccent: 'bg-primary/10',
          borderFocus: 'focus:ring-primary/25 focus:border-primary',
          buttonBg: 'bg-primary hover:bg-rose-600 shadow-rose-100 hover:shadow-rose-200',
          textLink: 'text-primary',
          headingColor: 'text-primary',
        };
    }
  };

  const colors = getRoleColors(activeRole);

  const getHeading = () => {
    if (formData.role === 'Admin') return 'Admin Registration';
    if (formData.role === 'Artist') return 'Artist Signup';
    return 'Create an Account';
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bgAccent} rounded-full -mr-12 -mt-12`}></div>
        
        <div className="relative z-10">
          <h2 className={`text-3xl font-black text-center ${colors.headingColor} mb-8 tracking-tighter uppercase`}>{getHeading()}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 ${colors.borderFocus} transition-all outline-none font-medium`}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 ${colors.borderFocus} transition-all outline-none font-medium`}
                placeholder="you@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 ${colors.borderFocus} transition-all outline-none font-medium`}
                placeholder="••••••••"
                required
              />
            </div>

            {!urlRole && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">I am a...</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'User' })}
                    className={`flex-1 py-3 border.2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                      formData.role === 'User' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    Ticket Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Artist' })}
                    className={`flex-1 py-3 border.2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                      formData.role === 'Artist' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    Creator/Artist
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLocal}
              className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest flex justify-center items-center transition-all ${
                loadingLocal ? 'bg-gray-400 cursor-not-allowed' : `${colors.buttonBg} shadow-xl`
              }`}
            >
              {loadingLocal ? 'Creating account...' : `Sign Up as ${formData.role}`}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to={`/login?role=${formData.role}`} className={`${colors.textLink} font-black hover:underline underline-offset-4 decoration-2`}>
              Log in to {formData.role} Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

