import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const hasRun = useRef(false);
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 1. Prevent double execution (React Strict Mode guard)
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      console.log('Sending verification request to backend...');
      try {
        const res = await axios.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (error) {
        // Only set error if not already successful
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-500">
        {status === 'loading' && (
          <div className="py-10">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Verifying Identity</h2>
            <p className="text-gray-400 font-medium mt-4">Pulsing neural link to secure servers...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">IDENTITY VERIFIED</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">{message}</p>
            <Link to="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-slate-100">
              Access Your Portal
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">VERIFICATION FAILED</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">{message}</p>
            <div className="space-y-4">
              <Link to="/register" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-slate-100">
                Retry Registration
              </Link>
              <Link to="/" className="block text-sm font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
