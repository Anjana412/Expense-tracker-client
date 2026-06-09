import { useState } from 'react';
import { userLogin, userRegister, getRoleRedirect } from '../api/api';
import { FaClipboardList } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BrandingPanel = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center gap-5 overflow-hidden p-10">
    <div className="absolute top-7 left-7 flex items-center gap-2.5">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
        <FaClipboardList className="text-violet-600 text-xl" />
      </div>
      <span className="text-[22px] font-extrabold text-white tracking-tight">Expense Meter</span>
    </div>

    <div className="absolute w-80 h-80 rounded-full bg-white/8 -bottom-20 -right-20 pointer-events-none" />
    <div className="absolute w-44 h-44 rounded-full bg-white/8 -top-10 -right-10 pointer-events-none" />

    <div className="w-56 h-56 shrink-0 animate-[floatUp_4s_ease-in-out_infinite]">
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="60" width="200" height="240" rx="18" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
        <rect x="120" y="44" width="80" height="36" rx="10" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        <rect x="90" y="130" width="140" height="12" rx="6" fill="rgba(255,255,255,0.5)" />
        <rect x="90" y="158" width="110" height="12" rx="6" fill="rgba(255,255,255,0.35)" />
        <rect x="90" y="186" width="130" height="12" rx="6" fill="rgba(255,255,255,0.5)" />
        <rect x="90" y="214" width="90" height="12" rx="6" fill="rgba(255,255,255,0.35)" />
        <circle cx="82" cy="136" r="10" fill="rgba(255,255,255,0.6)" />
        <circle cx="82" cy="164" r="10" fill="rgba(255,255,255,0.35)" />
        <circle cx="82" cy="192" r="10" fill="rgba(255,255,255,0.6)" />
        <circle cx="82" cy="220" r="10" fill="rgba(255,255,255,0.35)" />
        <circle cx="248" cy="248" r="40" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        <path d="M235 248 Q248 228 261 248 Q248 268 235 248Z" fill="rgba(255,255,255,0.7)" />
      </svg>
    </div>

    <p className="text-white/85 text-[15px] font-medium text-center leading-relaxed">Track smarter.<br />Spend wiser.</p>
  </div>
);

const LoginForm = ({ onSwitch }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await userLogin(formData);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(getRoleRedirect(user.role));
    } 
    catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid email or password');
    } 
    finally {
      setLoading(false);
    }
   };

  return (
    <div className="w-full flex items-center justify-center p-8 md:p-12">
      <div className="w-full max-w-85">
        <h2 className="text-[26px] font-extrabold text-indigo-950 mb-1.5 tracking-tight">Welcome Back!</h2>
        <p className="text-[13.5px] text-gray-500 mb-6">Don't have an account?{' '}
          <button type="button" onClick={onSwitch} className="bg-transparent border-none p-0 cursor-pointer text-violet-600 font-semibold text-[13.5px] underline underline-offset-2 hover:text-violet-800 transition-colors">Create account</button>
       </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">Email</label>
            <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-2.75 text-[13.5px] text-gray-800 bg-gray-50 outline-none transition-all focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] placeholder:text-gray-400"/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required
                className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 pr-10 py-2.75 text-[13.5px] text-gray-800 bg-gray-50 outline-none transition-all focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] placeholder:text-gray-400"/>
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-700 transition-colors p-0">
                <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} text-base`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-1">
            <button type="button" className="bg-transparent border-none p-0 cursor-pointer text-[12.5px] text-violet-600 font-medium hover:text-violet-800 transition-colors"> Forgot password?</button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-linear-to-br from-violet-600 to-purple-500 text-white text-[14.5px] font-bold py-3.25 border-none rounded-xl cursor-pointer transition-all shadow-[0_4px_16px_rgba(124,58,237,0.35)] mt-1 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] active:translate-y-0 disabled:opacity-65 disabled:cursor-not-allowed">
            {loading? <span className="w-4.5 h-4.5 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin inline-block" />: 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const RegisterForm = ({ onSwitch }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmpassword: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmpassword: false });
  const toggleShow = (field) => setShowPasswords(p => ({ ...p, [field]: !p[field] }));

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmpassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await userRegister({ name: formData.name, email: formData.email, password: formData.password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Account created! Welcome aboard!');
      navigate(getRoleRedirect(user.role));
    } 
    catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } 
    finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full flex items-center justify-center p-8 md:p-12">
    <div className="w-full max-w-85">
      <h2 className="text-[26px] font-extrabold text-indigo-950 mb-1.5 tracking-tight">Create Account!</h2>
      <p className="text-[13.5px] text-gray-500 mb-6"> Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="bg-transparent border-none p-0 cursor-pointer text-violet-600 font-semibold text-[13.5px] underline underline-offset-2 hover:text-violet-800 transition-colors">Log in</button>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-xl mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-semibold text-gray-700">Full Name</label>
          <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required
            className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-2.75 text-[13.5px] text-gray-800 bg-gray-50 outline-none transition-all focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] placeholder:text-gray-400" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-semibold text-gray-700">Email</label>
          <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required
            className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-2.75 text-[13.5px] text-gray-800 bg-gray-50 outline-none transition-all focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] placeholder:text-gray-400" />
        </div>

        {[
          { label: "Password", name: "password" },
          { label: "Confirm Password", name: "confirmpassword" },
        ].map(({ label, name }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">{label}</label>
            <div className="relative">
              <input type={showPasswords[name] ? "text" : "password"} name={name} placeholder="••••••••" value={formData[name]} onChange={handleChange} required
                className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 pr-10 py-2.75 text-[13.5px] text-gray-800 bg-gray-50 outline-none transition-all focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] placeholder:text-gray-400" />
              <button type="button" onClick={() => toggleShow(name)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-700 transition-colors p-0">
                <i className={`ti ${showPasswords[name] ? "ti-eye-off" : "ti-eye"} text-base`} />
              </button>
            </div>
          </div>
        ))}

        <button type="submit" disabled={loading}
          className="w-full bg-linear-to-br from-violet-600 to-purple-500 text-white text-[14.5px] font-bold py-3.25 border-none rounded-xl cursor-pointer transition-all shadow-[0_4px_16px_rgba(124,58,237,0.35)] mt-1 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] active:translate-y-0 disabled:opacity-65 disabled:cursor-not-allowed">
          {loading ? <span className="w-4.5 h-4.5 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin inline-block" /> : 'Create Account'}
        </button>

      </form>
    </div>
  </div>
);
};

 const AuthPage = () => {
  
  const [isLogin, setIsLogin] = useState(true);

  const [bannerGone, setBannerGone] = useState(false);

  const handleSwitch = (toLogin) => {
    setBannerGone(false);
    setIsLogin(toLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f0ebff] to-[#e8f4fd] p-4 md:p-6 font-[Inter,sans-serif]">

      <div className="md:hidden w-full max-w-105 flex flex-col rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(124,58,237,0.18)] bg-white">

        {!bannerGone && (
          <div key={isLogin ? 'login-banner' : 'register-banner'} onAnimationEnd={() => setBannerGone(true)}
            className={[ "w-full bg-linear-to-br from-violet-600 to-violet-400 overflow-hidden", "animate-[mobileBannerSlideUp_0.7s_cubic-bezier(0.77,0,0.18,1)_0.15s_both]",].join(' ')}
            style={{ minHeight: '200px' }} >
            <BrandingPanel />
          </div>
        )}

      <div
          key={isLogin ? 'login-form' : 'register-form'} className="animate-[mobileFormSlideUp_0.55s_cubic-bezier(0.22,1,0.36,1)_0.5s_both]">{isLogin? <LoginForm    onSwitch={() => handleSwitch(false)} /> : <RegisterForm onSwitch={() => handleSwitch(true)}  />}
      </div>
      </div>

      <div className="hidden md:flex relative w-full max-w-225 min-h-140 rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(124,58,237,0.18),0_8px_24px_rgba(0,0,0,0.08)] bg-white">

        <div className="absolute inset-0 overflow-hidden rounded-[28px] z-10 pointer-events-none">
          <div className={`pointer-events-auto absolute top-0 left-0 w-1/2 h-full bg-linear-to-br from-violet-600 to-violet-900 rounded-[28px] will-change-transform transition-transform duration-650 ease-[cubic-bezier(0.77,0,0.18,1)] ${isLogin ? '' : 'translate-x-full'}`}>
            <BrandingPanel />
          </div>
        </div>

        <div className={`w-1/2 flex items-stretch order-1 transition-opacity duration-450ms ${!isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <RegisterForm onSwitch={() => handleSwitch(true)} />
        </div>

        <div className={`w-1/2 flex items-stretch order-2 transition-opacity duration-450ms ${isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <LoginForm onSwitch={() => handleSwitch(false)} />
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }

        /* Banner slides up and fades out */
        @keyframes mobileBannerSlideUp {
          0%   { transform: translateY(0);     opacity: 1; max-height: 280px; }
          70%  { transform: translateY(-30px); opacity: 0.4; }
          100% { transform: translateY(-100%); opacity: 0;   max-height: 0;  }
        }

        /* Form rises smoothly from slightly below */
        @keyframes mobileFormSlideUp {
          0%   { transform: translateY(28px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
