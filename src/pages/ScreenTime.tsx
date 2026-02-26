import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Smartphone, Globe, AlertTriangle, TrendingDown, Calendar, ChevronRight } from 'lucide-react';

export default function ScreenTime({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({ logs: [] });

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
    { name: 'Facebook', time: '1h 20m', color: 'bg-blue-500', icon: 'FB' },
    { name: 'TikTok', time: '2h 15m', color: 'bg-black', icon: 'TT' },
    { name: 'YouTube', time: '45m', color: 'bg-red-500', icon: 'YT' },
    { name: 'Instagram', time: '30m', color: 'bg-pink-500', icon: 'IG' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl text-text-main flex items-center gap-3">
            <Clock className="text-primary" size={32} />
            Thời gian sử dụng
          </h1>
          <p className="text-text-muted">Theo dõi và tối ưu hóa thói quen kỹ thuật số của bạn.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20 bg-primary/5">
          <TrendingDown className="text-emerald-500" size={24} />
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Giảm so với tuần trước</p>
            <p className="text-xl font-bold text-emerald-500">-15%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 glass p-10 rounded-[40px] space-y-10 relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/5 border-primary/10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">Tổng quan tuần này</h2>
              <p className="text-sm text-text-muted mt-1">Phân tích chi tiết thời gian sử dụng thiết bị</p>
            </div>
            <div className="relative group">
              <select className="appearance-none bg-primary/5 border border-primary/10 rounded-2xl px-6 py-2.5 pr-10 text-sm font-bold text-primary outline-none hover:bg-primary/10 transition-all cursor-pointer shadow-sm">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-primary pointer-events-none" size={16} />
            </div>
          </div>

          <div className="relative h-72 flex items-end justify-between gap-3 sm:gap-6 px-4 pb-2 z-10">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2 px-4 opacity-20">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-px bg-primary/20" />
              ))}
            </div>

            {[65, 45, 80, 30, 95, 20, 55].map((h, i) => {
              const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end">
                  {/* Bar Track */}
                  <div className="absolute inset-x-0 bottom-10 top-0 bg-primary/5 rounded-full pointer-events-none" />
                  
                  <div className="relative w-full flex flex-col items-center justify-end h-full pb-10">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                      className={cn(
                        "w-full max-w-[24px] rounded-full transition-all cursor-pointer relative shadow-lg",
                        h > 70 ? "bg-gradient-to-t from-red-500 to-red-400 shadow-red-200" : 
                        h > 40 ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-yellow-200" : 
                        "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-emerald-200"
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    </motion.div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-text-main text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 shadow-xl whitespace-nowrap z-20">
                      {Math.floor(h * 0.1)}h {Math.floor(h % 10 * 6)}m
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-text-main rotate-45" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-text-muted group-hover:text-primary transition-colors uppercase tracking-widest">{days[i]}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 relative z-10">
            <div className="p-5 bg-white rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-0.5">Trung bình</p>
                <p className="text-xl font-bold text-text-main tracking-tight">4h 12m</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-0.5">Nhiều nhất</p>
                <p className="text-xl font-bold text-red-500 tracking-tight">6h 45m</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-0.5">Ít nhất</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">1h 30m</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Breakdown */}
        <div className="glass p-8 rounded-[32px] space-y-6">
          <h2 className="text-xl font-bold text-text-main">Ứng dụng tiêu tốn</h2>
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.name} className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl border border-border-subtle hover:border-primary/30 transition-all cursor-pointer group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm", app.color)}>
                  {app.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-main">{app.name}</p>
                  <p className="text-xs text-text-muted">{app.time}</p>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-primary font-bold text-sm hover:underline">Xem tất cả ứng dụng</button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass p-8 rounded-[32px] border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-2xl">
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main mb-1">Gợi ý từ FocusAI</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Bạn đang dành quá nhiều thời gian cho TikTok vào buổi tối (trung bình 2h sau 10 giờ đêm). 
              Điều này ảnh hưởng đến chất lượng giấc ngủ và sự tập trung vào sáng hôm sau. 
              Hãy thử đặt giới hạn 30 phút cho ứng dụng này sau 9 giờ tối nhé!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
