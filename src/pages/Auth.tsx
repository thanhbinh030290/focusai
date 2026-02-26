import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin) {
        const { data, error: regError } = await supabase
          .from('users')
          .insert([{ email, password, name, level: 1, exp: 0, coins: 0 }])
          .select()
          .single();

        if (regError) {
          if (regError.code === '23505') throw new Error('Email này đã có người dùng rồi Linh ơi!');
          throw regError;
        }
        alert("Đăng ký thành công! Đăng nhập thôi nào.");
        setIsLogin(true);
      } else {
        const { data, error: loginError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (loginError || !data) {
          setError('Sai email hoặc mật khẩu rồi bạn ơi!');
        } else {
          localStorage.setItem('nexus_user', JSON.stringify(data));
          onLogin(data);
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 slytherin-gradient">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-[40px] shadow-2xl border border-violet-100"
      >
        <div className="flex flex-col items-center mb-10">
          {/* LOGO ĐÃ CÓ BORDER RADIUS VÀ SHADOW */}
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-violet-200">
            <img 
              src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" 
              alt="FocusAI Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* CHỮ NEXUS ĐÃ ĐẬM VÀ RÕ NÉT */}
          <h1 className="text-4xl font-black text-violet-600 tracking-tighter mb-2">NEXUS</h1>
          
          <p className="text-violet-500 font-bold text-lg">
            {isLogin ? 'Chào mừng Học giả quay trở lại' : 'Bắt đầu hành trình tập trung'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
              <input 
                type="text" 
                placeholder="Họ và tên"
                className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 pl-12 pr-4 focus:border-violet-500 focus:bg-white outline-none transition-all text-violet-900 font-bold placeholder:text-violet-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
            <input 
              type="email" 
              placeholder="Địa chỉ Email"
              className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 pl-12 pr-4 focus:border-violet-500 focus:bg-white outline-none transition-all text-violet-900 font-bold placeholder:text-violet-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
            <input 
              type="password" 
              placeholder="Mật khẩu"
              className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 pl-12 pr-4 focus:border-violet-500 focus:bg-white outline-none transition-all text-violet-900 font-bold placeholder:text-violet-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
              <p className="text-red-600 text-sm font-black text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-lg py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản ngay')}
            <ArrowRight size={22} strokeWidth={3} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            {/* HOVER ĐÃ SỬA: CHUYỂN SANG TÍM ĐẬM, KHÔNG CÒN TRẮNG XÓA */}
            className="text-violet-400 hover:text-violet-800 text-sm font-black transition-colors uppercase tracking-widest border-b-2 border-violet-100 hover:border-violet-800 pb-1"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
