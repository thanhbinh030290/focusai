import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Calendar, PieChart, Activity, ShieldCheck, AlertCircle, TrendingUp, Clock } from 'lucide-react';

export default function ParentalView({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });

  useEffect(() => {
    fetchStats();
  }, [user.id]);

  const fetchStats = async () => {
    const res = await fetch(`/api/user/${user.id}/stats`);
    const data = await res.json();
    setStats(data);
  };

  const emotionCounts = stats.logs
    .filter((l: any) => l.type === 'emotion')
    .reduce((acc: any, curr: any) => {
      acc[curr.value] = (acc[curr.value] || 0) + 1;
      return acc;
    }, {});

  const totalScreentime = stats.logs
    .filter((l: any) => l.type === 'screentime')
    .reduce((acc: number, curr: any) => acc + parseInt(curr.value), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" size={32} />
            Báo cáo dành cho Phụ huynh
          </h1>
          <p className="text-gray-400">Theo dõi tiến độ và sức khỏe tinh thần của {user.name}.</p>
        </div>
        <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-500" />
          <span className="text-sm text-emerald-400 font-bold">Tháng 2, 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-blue-400" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase">Học tập</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">{user.points}</p>
          <p className="text-xs text-gray-500 mt-1">Tổng điểm tích lũy</p>
        </div>
        
        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-emerald-400" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase">Kỷ luật</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">{user.streak}</p>
          <p className="text-xs text-gray-500 mt-1">Ngày học liên tiếp</p>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-orange-400" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase">Mạng xã hội</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">{totalScreentime}p</p>
          <p className="text-xs text-gray-500 mt-1">Tổng thời gian ghi nhận</p>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-purple-400" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase">Tâm trạng</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">
            {emotionCounts.happy || 0} <span className="text-sm font-normal text-gray-500">vui</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Dựa trên điểm danh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border-white/5">
          <h3 className="text-xl text-white mb-6">Phân tích tâm trạng</h3>
          <div className="space-y-6">
            {['happy', 'neutral', 'anxious'].map((emo) => {
              const count = emotionCounts[emo] || 0;
              const total = Object.values(emotionCounts).reduce((a:any, b:any) => a + b, 0) as number;
              const percent = total > 0 ? (count / total) * 100 : 0;
              const labels: any = { happy: 'Vui vẻ', neutral: 'Bình thường', anxious: 'Lo lắng' };
              const colors: any = { happy: 'bg-emerald-500', neutral: 'bg-blue-500', anxious: 'bg-orange-500' };
              
              return (
                <div key={emo} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{labels[emo]}</span>
                    <span className="text-white font-bold">{count} lần</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={`h-full ${colors[emo]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border-white/5">
          <h3 className="text-xl text-white mb-6">Nhận xét từ Nexus AI</h3>
          <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-emerald-500" size={20} />
              </div>
              <div>
                <p className="text-white font-bold mb-1">Tiến độ học tập tốt</p>
                <p className="text-sm text-gray-400">
                  {user.name} đang duy trì chuỗi học tập rất tốt ({user.streak} ngày). 
                  Việc hoàn thành các bài Quiz giúp cải thiện tư duy đáng kể.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-white font-bold mb-1">Cần lưu ý thời gian MXH</p>
                <p className="text-sm text-gray-400">
                  Thời gian dùng TikTok ghi nhận là {totalScreentime} phút. 
                  Hãy khuyến khích con chuyển đổi 15 phút lướt web sang 15 phút học cùng AI Tutor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
