import { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoadingLocal(false);
  };

  const activeRole = role || 'User';

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
    if (role === 'Admin') return 'Admin Portal';
    if (role === 'Artist') return 'Artist Management';
    if (role === 'User') return 'User Login';
    return 'Secure Login';
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bgAccent} rounded-full -mr-12 -mt-12`}></div>
        
        <div className="relative z-10">
          <h2 className={`text-3xl font-black text-center ${colors.headingColor} mb-2 tracking-tighter uppercase`}>{getHeading()}</h2>
          <p className="text-center text-gray-400 text-sm font-medium mb-10">Enter your credentials to access your secure dashboard.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 ${colors.borderFocus} transition-all outline-none font-medium`}
                placeholder="identity@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 ${colors.borderFocus} transition-all outline-none font-medium`}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingLocal}
              className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] text-xs flex justify-center items-center transition-all ${
                loadingLocal ? 'bg-gray-400 cursor-not-allowed' : `${colors.buttonBg} shadow-xl hover:-translate-y-0.5`
              }`}
            >
              {loadingLocal ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-medium text-sm">
            {role ? (
              <>
                New to the {role} Portal?{' '}
                <Link 
                  to={`/register?role=${role}`} 
                  className={`${colors.textLink} font-black hover:underline underline-offset-4 decoration-2`}
                >
                  Create {role} Account
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link to="/register" className={`${colors.textLink} font-black hover:underline underline-offset-4 decoration-2`}>
                  Sign Up Here
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
