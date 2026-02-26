import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Nếu đang ở form đăng nhập thì gọi login, nếu form đăng ký thì gọi register
      const apiEndpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await res.json();
      // ... phần còn lại giữ nguyên
      
      if (data.user) {
        localStorage.setItem('nexus_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 slytherin-gradient">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl emerald-glow"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 emerald-glow-strong">
            <Star className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">NEXUS</h1>
          <p className="text-gray-400 text-center mt-2">
            {isLogin ? 'Welcome back, Scholar' : 'Begin your journey to focus'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
