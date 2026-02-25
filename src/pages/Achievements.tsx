import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Zap, Target, Flame, Award, BookOpen, Clock, ShieldCheck, CheckCircle2, Sparkles, Calendar, XCircle, Smile } from 'lucide-react';

export default function Achievements({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });

  useEffect(() => {
    fetchStats();
  }, [user.id]);

  const fetchStats = async () => {
    const res = await fetch(`/api/user/${user.id}/stats`);
    const data = await res.json();
    setStats(data);
  };

  const allAchievements = [
    { id: 'first_quiz', title: 'Người mới bắt đầu', desc: 'Hoàn thành Quiz đầu tiên', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'mood_streak_3', title: 'Tâm hồn tích cực', desc: 'Duy trì tâm trạng tốt trong 3 ngày', icon: Smile, color: 'bg-pink-500' },
    { id: 'streak_3', title: 'Kiên trì', desc: 'Đạt chuỗi 3 ngày học tập', icon: Flame, color: 'bg-orange-500' },
    { id: 'quiz_5', title: 'Tập sự Runner', desc: 'Trả lời đúng 5 câu hỏi Quiz', icon: Zap, color: 'bg-yellow-500' },
    { id: 'quiz_25', title: 'Chuyên gia đường đua', desc: 'Trả lời đúng 25 câu hỏi Quiz', icon: Zap, color: 'bg-primary' },
    { id: 'quiz_100', title: 'Huyền thoại Focus', desc: 'Trả lời đúng 100 câu hỏi Quiz', icon: Trophy, color: 'bg-indigo-600' },
    { id: 'screentime_low', title: 'Kỷ luật thép', desc: 'Giảm thời gian dùng MXH xuống dưới 1h', icon: ShieldCheck, color: 'bg-emerald-500' },
  ];

  const weeklyStatus = [
    { day: 'T2', status: 'positive' },
    { day: 'T3', status: 'positive' },
    { day: 'T4', status: 'average' },
    { day: 'T5', status: 'negative' },
    { day: 'T6', status: 'positive' },
    { day: 'T7', status: 'positive' },
    { day: 'CN', status: 'positive' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl text-text-main flex items-center gap-3">
            <Trophy className="text-primary" size={32} />
            Bảng thành tích FocusAI
          </h1>
          <p className="text-text-muted">Những cột mốc đáng tự hào trên hành trình của bạn.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20 bg-primary/5">
          <Award className="text-primary" size={24} />
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Đã mở khóa</p>
            <p className="text-xl font-display font-bold text-text-main">{stats.achievements.length} / {allAchievements.length}</p>
          </div>
        </div>
      </div>

      {/* Weekly Tracker */}
      <div className="glass p-8 rounded-[32px] border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            Thành tích tuần này
          </h2>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={14} /> Tích cực</div>
            <div className="flex items-center gap-1 text-yellow-500"><CheckCircle2 size={14} /> Trung bình</div>
            <div className="flex items-center gap-1 text-red-500"><XCircle size={14} /> Chưa đạt</div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {weeklyStatus.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm",
                day.status === 'positive' ? "bg-emerald-50 border-emerald-200 text-emerald-500" :
                day.status === 'average' ? "bg-yellow-50 border-yellow-200 text-yellow-500" :
                "bg-red-50 border-red-200 text-red-500"
              )}>
                {day.status === 'positive' ? <CheckCircle2 size={24} /> : 
                 day.status === 'average' ? <CheckCircle2 size={24} className="opacity-60" /> : 
                 <XCircle size={24} />}
              </div>
              <span className="text-sm font-bold text-text-muted">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map((ach) => {
          const isUnlocked = stats.achievements.some((a: any) => a.achievement_id === ach.id);
          return (
            <motion.div 
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass p-6 rounded-3xl border flex items-center gap-6 transition-all",
                isUnlocked ? "border-primary/30 bg-primary/5" : "border-border-subtle opacity-50 grayscale"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                ach.color
              )}>
                <ach.icon size={32} />
              </div>
              <div>
                <h3 className="font-bold text-text-main">{ach.title}</h3>
                <p className="text-sm text-text-muted">{ach.desc}</p>
                {isUnlocked && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <CheckCircle2 size={12} />
                    Đã hoàn thành
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

