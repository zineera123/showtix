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

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    
    if (result.success) {
      toast.success(result.message, { duration: 6000 });
      setIsSuccess(true);
    } else {
      toast.error(result.message);
    }
    
    setLoadingLocal(false);
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">VERIFY YOUR IDENTITY</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            We've sent a high-security activation link to <span className="text-primary font-bold">{formData.email}</span>. 
            Please check your inbox to activate your account.
          </p>
          <Link to="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  const getHeading = () => {
    if (formData.role === 'Admin') return 'Admin Registration';
    if (formData.role === 'Artist') return 'Artist Signup';
    return 'Create an Account';
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{getHeading()}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="you@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {!urlRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'User' })}
                  className={`flex-1 py-3 border rounded-lg transition-all ${
                    formData.role === 'User' 
                    ? 'border-primary bg-primary/10 text-primary font-semibold' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Ticket Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Artist' })}
                  className={`flex-1 py-3 border rounded-lg transition-all ${
                    formData.role === 'Artist' 
                    ? 'border-primary bg-primary/10 text-primary font-semibold' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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
              loadingLocal ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-rose-600 shadow-xl shadow-rose-200'
            }`}
          >
            {loadingLocal ? 'Creating account...' : `Sign Up as ${formData.role}`}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Already verified?{' '}
          <Link to={`/login?role=${formData.role}`} className="text-primary font-black hover:underline underline-offset-4 decoration-2">
            Log in to {formData.role} Portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
