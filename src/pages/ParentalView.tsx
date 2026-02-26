import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Calendar, Activity, TrendingUp, 
  Clock, PieChart, AlertCircle, Bot 
} from 'lucide-react';

export default function ParentalView({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });

  useEffect(() => {
    fetchStats();
  }, [user.id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Lỗi lấy dữ liệu:", e);
    }
  };

  // Tính toán an toàn để tránh màn hình trắng
  const logs = stats?.logs || [];
  
  const emotionCounts = logs
    .filter((l: any) => l.type === 'emotion')
    .reduce((acc: any, curr: any) => {
      acc[curr.value] = (acc[curr.value] || 0) + 1;
      return acc;
    }, {});

  const totalScreentime = logs
    .filter((l: any) => l.type === 'screentime')
    .reduce((acc: number, curr: any) => acc + (parseInt(curr.value) || 0), 0);

  const statCards = [
    { label: 'Học tập', val: user.points || 0, icon: Activity, col: 'text-blue-500', sub: 'Tổng điểm tích lũy' },
    { label: 'Kỷ luật', val: user.streak || 0, icon: TrendingUp, col: 'text-emerald-500', sub: 'Ngày học liên tiếp' },
    { label: 'Mạng xã hội', val: `${totalScreentime}p`, icon: Clock, col: 'text-orange-500', sub: 'Thời gian ghi nhận' },
    { label: 'Tâm trạng', val: `${emotionCounts.happy || 0} vui`, icon: PieChart, col: 'text-violet-600', sub: 'Dựa trên điểm danh' }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main flex items-center gap-4">
            <ShieldCheck className="text-violet-600" size={40} /> 
            Báo cáo Phụ huynh
          </h1>
          <p className="text-text-muted font-bold mt-2 text-lg italic">
            Theo dõi tiến độ và sức khỏe tinh thần của {user.name}.
          </p>
        </div>
        <div className="bg-violet-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
          <Calendar size={22} className="text-violet-200" />
          <span className="text-md font-black uppercase tracking-tighter">Tháng 2, 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((box, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50 hover:border-violet-200 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <box.icon className={box.col} size={28} />
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{box.label}</span>
            </div>
            <p className="text-4xl font-black text-text-main">{box.val}</p>
            <p className="text-xs font-bold text-violet-400 mt-2">{box.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Phân tích tâm trạng */}
        <div className="bg-white p-10 rounded-[45px] shadow-2xl border-2 border-violet-50">
          <h3 className="text-2xl font-black text-text-main mb-8 flex items-center gap-3">
            <PieChart className="text-violet-600" size={28}/> Phân tích tâm trạng
          </h3>
          <div className="space-y-8">
            {['happy', 'neutral', 'anxious'].map((emo) => {
              const count = emotionCounts[emo] || 0;
              const total = Object.values(emotionCounts).reduce((a:any, b:any) => a + b, 0) as number;
              const percent = total > 0 ? (count / total) * 100 : 0;
              const labels: any = { happy: 'Vui vẻ', neutral: 'Bình thường', anxious: 'Lo lắng' };
              const colors: any = { happy: 'bg-emerald-500', neutral: 'bg-blue-500', anxious: 'bg-orange-500' };
              
              return (
                <div key={emo} className="space-y-3">
                  <div className="flex justify-between font-black text-md">
                    <span className="text-text-muted">{labels[emo]}</span>
                    <span className="text-text-main">{count} lần</span>
                  </div>
                  <div className="h-4 bg-violet-50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      className={`h-full ${colors[emo]} shadow-lg`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nhận xét AI */}
        <div className="bg-white p-10 rounded-[45px] shadow-2xl border-4 border-violet-600/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl" />
          <h3 className="text-2xl font-black text-text-main mb-8 flex items-center gap-3">
            <Bot className="text-violet-600" size={28}/> Nhận xét từ FocusAI
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100 flex items-start gap-4">
              <AlertCircle className="text-emerald-600 shrink-0" size={28} />
              <div>
                <p className="text-emerald-900 font-black text-lg mb-1">Tiến độ rất tốt</p>
                <p className="text-emerald-700/80 font-bold leading-relaxed">
                  {user.name} duy trì chuỗi học tập cực đỉnh ({user.streak} ngày). Tích cực khuyến khích Linh giữ vững phong độ nhé!
                </p>
              </div>
            </div>
            <div className="p-6 bg-orange-50 rounded-3xl border-2 border-orange-100 flex items-start gap-4">
              <Clock className="text-orange-600 shrink-0" size={28} />
              <div>
                <p className="text-orange-900 font-black text-lg mb-1">Cần lưu ý TikTok</p>
                <p className="text-orange-700/80 font-bold leading-relaxed">
                  Thời gian dùng mạng xã hội ghi nhận là {totalScreentime} phút. Hãy nhắc Linh bớt 15 phút lướt web để dành cho AI Tutor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
