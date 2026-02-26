import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // Thêm state cho con mắt
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
          setError('Sai mật khẩu hoặc email rồi bạn ơi!');
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
        className="w-full max-w-md bg-white p-10 rounded-[45px] shadow-2xl border-4 border-violet-50"
      >
        <div className="flex flex-col items-center mb-10">
          {/* 1. LOGO ĐÃ BO VIỀN (rounded-2xl) */}
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-xl border-4 border-violet-100">
            <img 
              src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" 
              alt="FocusAI Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 2. CHỮ ĐẬM LÊN (font-black) */}
          <p className="text-violet-600 font-black text-2xl text-center">
            {isLogin ? 'Chào mừng Học giả quay lại' : 'Bắt đầu hành trình tập trung'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={24} />
              <input 
                type="text" 
                placeholder="Họ và tên"
                className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-5 pl-14 pr-5 focus:border-violet-600 focus:bg-white outline-none transition-all text-violet-950 font-black placeholder:text-violet-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={24} />
            <input 
              type="email" 
              placeholder="Địa chỉ Email"
              className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-5 pl-14 pr-5 focus:border-violet-600 focus:bg-white outline-none transition-all text-violet-950 font-black placeholder:text-violet-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-5 text-violet-500" size={24} />
            <input 
              type={showPassword ? 'text' : 'password'} // Điều khiển hiện/ẩn pass
              placeholder="Mật khẩu"
              className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-5 pl-14 pr-14 focus:border-violet-600 focus:bg-white outline-none transition-all text-violet-950 font-black placeholder:text-violet-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Nút bấm con mắt */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 text-violet-400 hover:text-violet-700 transition-colors"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 rounded-xl">
              <p className="text-red-700 text-sm font-black text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-800 text-white font-black text-xl py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-violet-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản')}
            <ArrowRight size={24} strokeWidth={4} />
          </button>
        </form>

        <div className="mt-12 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setShowPassword(false); // Tắt mật khẩu khi chuyển form
            }}
            /* 3. ĐÃ BỎ GẠCH CHÂN (Remove underline/border-b) */
            className="text-violet-400 hover:text-violet-900 text-base font-black transition-all uppercase tracking-widest"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
