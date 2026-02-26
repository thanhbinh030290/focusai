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
          .insert([{ 
            email, 
            password, 
            name,
            level: 1,
            exp: 0,
            coins: 0
          }])
          .select()
          .single();

        if (regError) {
          if (regError.code === '23505') {
            throw new Error('Email này đã được đăng ký rồi Linh ơi!');
          }
          throw regError;
        }

        alert("Đăng ký thành công! Giờ hãy đăng nhập nhé.");
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl violet-glow border border-white/20"
      >
        <div className="flex flex-col items-center mb-8">
          {/* ĐÃ THAY NGÔI SAO BẰNG LOGO CỦA LINH */}
          <div className="w-20 h-20 mb-4 flex items-center justify-center">
            <img 
              src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" 
              alt="FocusAI Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wider">NEXUS</h1>
          {/* CHỮ HẾT MỜ (Xóa /60 opacity) */}
          <p className="text-violet-200 text-center mt-2 font-semibold">
            {isLogin ? 'Chào mừng Học giả quay trở lại' : 'Bắt đầu hành trình rèn luyện sự tập trung'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
              <input 
                type="text" 
                placeholder="Họ và tên"
                /* CHỮ NHẬP VÀO ĐÃ THÀNH MÀU TÍM NHẠT (text-violet-100) */
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-all text-violet-100 placeholder:text-violet-300/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
            <input 
              type="email" 
              placeholder="Địa chỉ Email"
              className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-all text-violet-100 placeholder:text-violet-300/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
            <input 
              type="password" 
              placeholder="Mật khẩu"
              className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-all text-violet-100 placeholder:text-violet-300/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-red-400 text-sm text-center font-bold bg-red-900/20 py-2 rounded-lg border border-red-400/20"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-violet-900/40"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            /* CHỮ DƯỚI CÙNG HẾT MỜ */
            className="text-violet-200 hover:text-white text-sm transition-colors font-bold underline underline-offset-4"
          >
            {isLogin ? "Bạn chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản rồi? Đăng nhập"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
