
import React, { useState } from 'react';
import { Hotel, Mail, Lock, ArrowRight, User, AlertCircle, Chrome, Globe } from 'lucide-react';
import { authService } from '../services/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await authService.signup(formData.name, formData.email, formData.password);
      } else {
        await authService.login(formData.email, formData.password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
      onLogin();
    } catch (err) {
      setError('Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100/50 skew-x-12 transform origin-top-right"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-indigo-50/50 -skew-x-12 transform origin-bottom-left"></div>
      </div>

      <div className="w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl flex relative z-10 overflow-hidden border border-slate-200">
        
        {/* Left Side - Brand / Info */}
        <div className="hidden md:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <div className="w-64 h-64 border-4 border-white rounded-full absolute -top-10 -left-10"></div>
               <div className="w-96 h-96 border-4 border-white rounded-full absolute top-1/2 -right-20"></div>
           </div>

           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-500 p-2 rounded-lg">
                  <Hotel size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">NovaStay PMS</h1>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed">
                Streamline your hotel operations with our all-in-one property management system.
              </p>
           </div>

           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Globe size={20} className="text-brand-400"/>
                 </div>
                 <div>
                    <h3 className="font-bold">Cloud Based</h3>
                    <p className="text-slate-400 text-sm">Access from anywhere, anytime.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-purple-400"/>
                 </div>
                 <div>
                    <h3 className="font-bold">Guest Centric</h3>
                    <p className="text-slate-400 text-sm">Detailed profiles & history.</p>
                 </div>
              </div>
           </div>
           
           <div className="text-xs text-slate-500">
              © 2025 NovaStay Systems Inc.
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
           <div className="max-w-sm mx-auto w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                {isSignUp ? 'Get started with your 14-day free trial.' : 'Please enter your details to sign in.'}
              </p>

              {/* Google Button */}
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all mb-6 group"
              >
                <Chrome size={20} className="text-slate-900 group-hover:text-blue-600 transition-colors" />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center mb-6">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">Or with email</span>
                  <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 {isSignUp && (
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Name</label>
                     <div className="relative group">
                       <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                       <input 
                         name="name"
                         type="text" 
                         value={formData.name}
                         onChange={handleChange}
                         className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                         placeholder="John Doe"
                         required={isSignUp}
                       />
                     </div>
                   </div>
                 )}

                 <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                     <input 
                       name="email"
                       type="email" 
                       value={formData.email}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                       placeholder="name@company.com"
                       required
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
                   <div className="relative group">
                     <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                     <input 
                       name="password"
                       type="password" 
                       value={formData.password}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                       placeholder="••••••••"
                       required
                     />
                   </div>
                 </div>

                 {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                       <AlertCircle size={14} /> {error}
                    </div>
                 )}

                 <button 
                   type="submit" 
                   disabled={isLoading}
                   className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                 >
                   {isLoading ? 'Processing...' : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
                      </>
                   )}
                 </button>
              </form>

              <div className="mt-6 text-center">
                 <button 
                   type="button"
                   onClick={() => setIsSignUp(!isSignUp)}
                   className="text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors"
                 >
                   {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an account'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
