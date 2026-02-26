import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function ScreenTime({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({ logs: [] });

  // TRÍCH XUẤT TÊN CUỐI CÙNG (Ví dụ: "Kim Minh Đức" -> "Đức")
  const firstName = user.name ? user.name.split(' ').pop() : 'bạn';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/user/${user.id}/stats`);
        const data = await res.json();
        setStats(data);
      } catch (e) {}
    };
    fetchStats();
  }, [user.id]);

  const apps = [
    { 
      name: 'Facebook', 
      time: '1h 20m', 
      color: 'bg-blue-600/10', 
      logo: 'https://www.vectorlogo.zone/logos/facebook/facebook-tile.svg' 
    },
    { 
      name: 'TikTok', 
      time: '2h 15m', 
      color: 'bg-black/10', 
      logo: 'https://www.vectorlogo.zone/logos/tiktok/tiktok-icon.svg' 
    },
    { 
      name: 'YouTube', 
      time: '45m', 
      color: 'bg-red-600/10', 
      logo: 'https://www.vectorlogo.zone/logos/youtube/youtube-icon.svg' 
    },
    { 
      name: 'Instagram', 
      time: '30m', 
      color: 'bg-pink-600/10', 
      logo: 'https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg' 
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main flex items-center gap-3">
            <Clock className="text-primary" size={36} />
            Thời gian sử dụng
          </h1>
          {/* ĐÃ SỬA: Tên động ở đây */}
          <p className="text-text-muted font-black mt-1">Theo dõi và tối ưu hóa thói quen của {firstName} ✨</p>
        </div>
        <div className="glass px-6 py-4 rounded-3xl flex items-center gap-3 border-primary/20 bg-primary/5 shadow-xl">
          <TrendingDown className="text-emerald-500" size={28} />
          <div>
            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Giảm so với tuần trước</p>
            <p className="text-2xl font-black text-emerald-500">-15%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ tuần */}
        <div className="lg:col-span-2 glass p-10 rounded-[45px] space-y-10 relative overflow-hidden bg-white border-primary/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-text-main tracking-tight">Tổng quan tuần này</h2>
              {/* ĐÃ SỬA: Tên động ở đây */}
              <p className="text-sm text-text-muted font-black mt-1">Phân tích chi tiết thời gian {firstName} dùng thiết bị</p>
            </div>
            <select className="bg-primary/5 border-2 border-primary/10 rounded-2xl px-6 py-2.5 text-sm font-black text-primary outline-none hover:bg-primary/10 transition-all cursor-pointer shadow-sm">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>

          <div className="relative h-72 flex items-end justify-between gap-3 sm:gap-6 px-4 pb-2 z-10">
            {[65, 45, 80, 30, 95, 20, 55].map((h, i) => {
              const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={cn(
                      "w-full max-w-[28px] rounded-full transition-all cursor-pointer relative shadow-lg",
                      h > 70 ? "bg-red-500 shadow-red-200" : h > 40 ? "bg-primary shadow-primary/20" : "bg-emerald-500 shadow-emerald-200"
                    )}
                  />
                  <span className="text-xs font-black text-text-muted group-hover:text-primary transition-colors uppercase tracking-widest">{days[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Các thông số trung bình */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 relative z-10">
            <div className="p-5 bg-gray-50 rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase mb-0.5">Trung bình</p>
                <p className="text-xl font-black text-text-main tracking-tighter">4h 12m</p>
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-inner">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase mb-0.5">Nhiều nhất</p>
                <p className="text-xl font-black text-red-500 tracking-tighter">6h 45m</p>
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase mb-0.5">Ít nhất</p>
                <p className="text-xl font-black text-emerald-500 tracking-tighter">1h 30m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ứng dụng tiêu tốn */}
        <div className="glass p-8 rounded-[40px] space-y-8 bg-white border-primary/10 shadow-2xl">
          <h2 className="text-2xl font-black text-text-main tracking-tight">Ứng dụng tiêu tốn</h2>
          <div className="space-y-5">
            {apps.map((app) => (
              <div key={app.name} className="flex items-center gap-4 p-5 bg-gray-50/80 rounded-[30px] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-md overflow-hidden bg-white p-2.5", app.color)}>
                  <img 
                    src={app.logo} 
                    alt={app.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-black text-text-main text-lg">{app.name}</p>
                  <p className="text-sm font-black text-text-muted">{app.time}</p>
                </div>
                <ChevronRight size={20} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
          <button className="w-full py-5 bg-primary/10 text-primary font-black text-sm rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">Xem tất cả ứng dụng</button>
        </div>
      </div>

      {/* Gợi ý từ FocusAI */}
      <div className="glass p-10 rounded-[45px] border-yellow-500/20 bg-yellow-500/5 shadow-xl">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-yellow-500/20 rounded-[24px] shadow-inner">
            <AlertTriangle className="text-yellow-700" size={32} />
          </div>
          <div>
            {/* ĐÃ SỬA: Tên động ở tiêu đề gợi ý */}
            <h3 className="text-xl font-black text-text-main mb-2">Gợi ý từ FocusAI cho {firstName} ✨</h3>
            <p className="text-text-muted font-black text-lg leading-relaxed">
              {/* ĐÃ SỬA: Tên động ở nội dung lời nhắn */}
              {firstName} ơi, bạn đang dành quá nhiều thời gian cho <span className="text-black underline decoration-yellow-500 decoration-4">TikTok</span> vào buổi tối. 
              Hãy thử đặt giới hạn 30 phút cho ứng dụng này sau 9 giờ tối để có giấc ngủ ngon hơn nhé!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
