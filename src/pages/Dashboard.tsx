import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Star, Clock, Smile, Frown, Meh, Plus, 
  TrendingDown, BookOpen, Zap, RefreshCw, Sparkles, 
  MessageSquare, Bot, UserCircle 
} from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Dashboard({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });
  const [checkingIn, setCheckingIn] = useState(false);
  const [showPsychChat, setShowPsychChat] = useState(false);
  const [psychMessage, setPsychMessage] = useState('');
  const [psychHistory, setPsychHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loadingPsych, setLoadingPsych] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [diaryEmotion, setDiaryEmotion] = useState('happy');
  const [editingDiaryId, setEditingDiaryId] = useState<number | null>(null);
  const psychScrollRef = useRef<HTMLDivElement>(null);

  // TRÍCH XUẤT TÊN CUỐI (VD: "Kim Minh Đức" -> "Đức")
  const firstName = user?.name ? user.name.split(' ').pop() : 'bạn';

  useEffect(() => {
    if (psychScrollRef.current) {
      psychScrollRef.current.scrollTop = psychScrollRef.current.scrollHeight;
    }
  }, [psychHistory, loadingPsych]);

  useEffect(() => {
    fetchStats();
    fetchDiary();
  }, [user.id]);

  const fetchDiary = async () => {
    const res = await fetch(`/api/diary/${user.id}`);
    const data = await res.json();
    setDiaryEntries(data.entries || []);
  };

  const handleSaveDiary = async () => {
    if (!newDiaryContent.trim()) return;
    const method = editingDiaryId ? 'PUT' : 'POST';
    const url = editingDiaryId ? `/api/diary/${editingDiaryId}` : '/api/diary';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, content: newDiaryContent, emotion: diaryEmotion, screentime: user.last_screentime || 0 }),
    });
    setNewDiaryContent('');
    setEditingDiaryId(null);
    setShowDiary(false);
    fetchDiary();
  };

  const openDiaryEditor = (entry?: any) => {
    if (entry) {
      setEditingDiaryId(entry.id);
      setNewDiaryContent(entry.content);
      setDiaryEmotion(entry.emotion);
    } else {
      setEditingDiaryId(null);
      setNewDiaryContent('');
      setDiaryEmotion('happy');
    }
    setShowDiary(true);
  };

  const handlePsychChat = async (directMsg?: string) => {
    const messageToSend = directMsg || psychMessage;
    if (!messageToSend.trim()) return;
    setPsychHistory(prev => [...prev, { role: 'user', text: messageToSend }]);
    setPsychMessage('');
    setLoadingPsych(true);
    try {
      const res = await fetch('/api/ai/psychology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, screentime: user.last_screentime || 0 }),
      });
      const data = await res.json();
      setPsychHistory(prev => [...prev, { role: 'ai', text: data.text || "Mình luôn ở đây để lắng nghe bạn." }]);
    } catch (e) {
      setPsychHistory(prev => [...prev, { role: 'ai', text: `Kết nối hơi yếu, ${firstName} thử lại nhé!` }]);
    } finally {
      setLoadingPsych(false);
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`/api/user/${user.id}/stats`);
    const data = await res.json();
    setStats(data);
  };

  const handleCheckIn = async (emotion: string) => {
    setSelectedEmotion(emotion);
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/user/${user.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion }),
      });
      const data = await res.json();
      if (data.success) {
        const userRes = await fetch(`/api/user/${user.id}`);
        const userData = await userRes.json();
        setUser(userData.user);
        localStorage.setItem('nexus_user', JSON.stringify(userData.user));
        fetchStats();
      }
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* ĐÃ SỬA: Tiêu đề chào mừng */}
          <h1 className="text-3xl md:text-4xl text-text-main font-black mb-2">{firstName} ơi, hôm nay thế nào? 👋</h1>
          <p className="text-text-muted font-bold italic">FocusAI đồng hành cùng bạn trên con đường tri thức.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-violet-100 shadow-lg">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            <div>
              <p className="text-[10px] text-text-muted uppercase font-black">Chuỗi</p>
              <p className="text-xl font-black text-text-main">{user.streak} ngày</p>
            </div>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-violet-100 shadow-lg">
            <Star className="text-violet-600 fill-violet-600" size={24} />
            <div>
              <p className="text-[10px] text-text-muted uppercase font-black">Điểm</p>
              <p className="text-xl font-black text-text-main">{user.points}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div whileHover={{ y: -5 }} className="lg:col-span-3 glass p-10 rounded-[45px] relative overflow-hidden bg-gradient-to-br from-white via-white to-violet-50 border-violet-100 shadow-2xl min-h-[350px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={160} className="text-violet-600" /></div>
          {/* ĐÃ SỬA: Hỏi tâm trạng */}
          <h2 className="text-3xl font-black text-text-main mb-10 text-center tracking-tight">Tâm trạng của {firstName} hiện tại? ✨</h2>
          <div className="relative flex flex-wrap justify-center items-center gap-6">
            <AnimatePresence mode="popLayout">
              {[
                { id: 'happy', label: 'Hạnh phúc', emoji: '😊', bg: 'bg-emerald-500/10' },
                { id: 'excited', label: 'Hưng phấn', emoji: '🤩', bg: 'bg-yellow-500/10' },
                { id: 'neutral', label: 'Bình thường', emoji: '😐', bg: 'bg-blue-500/10' },
                { id: 'sad', label: 'Buồn', emoji: '😢', bg: 'bg-orange-500/10' },
                { id: 'anxious', label: 'Lo âu', emoji: '😰', bg: 'bg-red-500/10' },
              ].map((item) => (
                (!selectedEmotion || selectedEmotion === item.id) && (
                  <motion.div key={item.id} layoutId={`emotion-${item.id}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }} onClick={() => !checkingIn && !selectedEmotion && handleCheckIn(item.id)}
                    className={cn("w-28 h-28 rounded-[35px] transition-all flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer border-2 border-transparent hover:border-violet-200", item.bg, selectedEmotion === item.id ? "ring-4 ring-violet-500 scale-110" : "")}
                  >
                    <span className="text-5xl">{item.emoji}</span>
                    <span className="text-[10px] font-black text-text-muted uppercase">{item.label}</span>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-12 max-w-xl mx-auto w-full">
            <div className="relative flex gap-2 bg-white border-2 border-violet-200 rounded-2xl p-2 shadow-xl">
              <input type="text" value={psychMessage} onChange={(e) => setPsychMessage(e.target.value)} placeholder="Trò chuyện với chuyên gia tâm lý..." className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main font-black" onKeyDown={(e) => e.key === 'Enter' && setShowPsychChat(true)} />
              <button onClick={() => setShowPsychChat(true)} className="bg-violet-600 text-white px-5 py-2 rounded-xl font-black shadow-lg hover:bg-violet-700 transition-all"><MessageSquare size={20} /></button>
            </div>
          </div>
        </motion.div>

        {/* Psychology Modal */}
        <AnimatePresence>
          {showPsychChat && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border-4 border-violet-100">
                <div className="p-6 border-b flex justify-between items-center bg-violet-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-violet-200 shadow-md">
                      <img src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    {/* ĐÃ SỬA: Chữ đang lắng nghe */}
                    <div><h3 className="font-black text-text-main text-xl">Chuyên gia FocusAI</h3><p className="text-[10px] text-violet-400 font-black uppercase tracking-widest">Đang lắng nghe {firstName}...</p></div>
                  </div>
                  <button onClick={() => setShowPsychChat(false)} className="bg-violet-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"><Plus className="rotate-45" size={28} /></button>
                </div>
                <div ref={psychScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#FDFDFF]">
                  {psychHistory.length > 0 ? psychHistory.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", msg.role === 'user' ? "bg-violet-600 text-white" : "bg-white border border-violet-100 text-violet-600")}>
                        {msg.role === 'user' ? <UserCircle size={24} /> : <Bot size={24} />}
                      </div>
                      <div className={cn("max-w-[80%] p-5 rounded-[25px] shadow-sm font-bold text-sm leading-relaxed", msg.role === 'user' ? "bg-violet-600 text-white rounded-tr-none" : "bg-violet-50 text-text-main border border-violet-100 rounded-tl-none")}>{msg.text}</div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-24 h-24 rounded-[35px] bg-violet-100 flex items-center justify-center text-violet-600 animate-bounce shadow-inner"><Bot size={48} /></div>
                      {/* ĐÃ SỬA: Chào tên */}
                      <h4 className="font-black text-2xl text-text-main">Chào {firstName}, mình đây!</h4>
                      <p className="text-text-muted font-bold max-w-xs text-lg">Bạn muốn tâm sự về áp lực học tập hay thói quen dùng máy không?</p>
                      <div className="flex flex-col gap-3 w-full max-w-xs">
                        {["Làm sao bớt dùng TikTok?", "Mình thấy lo khi không có điện thoại"].map(txt => (
                          <button key={txt} onClick={() => handlePsychChat(txt)} className="p-4 bg-white border-2 border-violet-50 rounded-2xl text-sm font-black text-violet-600 hover:bg-violet-600 hover:text-white transition-all shadow-sm">"{txt}"</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {loadingPsych && <div className="flex gap-2 p-4 bg-violet-50 rounded-2xl w-fit animate-pulse"><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]"/></div>}
                </div>
                <div className="p-6 border-t bg-white flex gap-3">
                  {/* ĐÃ SỬA: Placeholder input */}
                  <input type="text" value={psychMessage} onChange={(e) => setPsychMessage(e.target.value)} placeholder={`Nhập lời nhắn của ${firstName}...`} className="flex-1 bg-violet-50 border-2 border-violet-100 rounded-2xl px-6 py-4 font-black outline-none focus:border-violet-600 transition-all" onKeyDown={(e) => e.key === 'Enter' && handlePsychChat()} />
                  <button onClick={() => handlePsychChat()} className="bg-violet-600 text-white p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"><Zap size={24} className="fill-white" /></button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diary Section */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-text-main flex items-center gap-3"><BookOpen className="text-violet-600" size={28} /> Nhật ký hành trình</h2>
            <button onClick={() => openDiaryEditor()} className="bg-violet-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-violet-700 transition-all shadow-xl">Viết trang mới <Plus size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {diaryEntries.slice(0, 3).map((entry: any) => (
              <motion.div key={entry.id} whileHover={{ y: -8 }} onClick={() => openDiaryEditor(entry)} className="glass p-8 rounded-[35px] border-violet-100 cursor-pointer bg-white shadow-xl hover:shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-4xl">{entry.emotion === 'happy' ? '😊' : '😐'}</span>
                  <span className="text-[10px] font-black text-violet-400 bg-violet-50 px-3 py-1.5 rounded-full">{new Date(entry.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="text-md font-bold text-text-main line-clamp-3 italic leading-relaxed">"{entry.content}"</p>
                <div className="pt-6 mt-4 border-t border-violet-50 text-[10px] font-black text-violet-600 uppercase flex items-center gap-2"><Clock size={14} /> Dùng MXH: {entry.screentime} phút</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Diary Modal - Vintage Wood Style */}
        <AnimatePresence>
          {showDiary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div initial={{ scale: 0.8, rotateY: -20 }} animate={{ scale: 1, rotateY: 0 }} className="bg-[#fffcf0] rounded-[45px] w-full max-w-2xl h-[80vh] flex shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden border-[15px] border-[#5d4037]">
                <div className="flex-1 p-12 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                  <div className="flex justify-between items-center mb-8 border-b-4 border-[#5d4037] pb-6">
                    <h3 className="text-4xl font-serif font-black text-[#5d4037]">{editingDiaryId ? 'Sửa bản thảo' : 'Ghi chép mới'}</h3>
                    <button onClick={() => setShowDiary(false)} className="text-[#5d4037] hover:rotate-90 transition-all duration-300"><Plus className="rotate-45" size={38} /></button>
                  </div>
                  {/* ĐÃ SỬA: Placeholder nhật ký */}
                  <textarea value={newDiaryContent} onChange={(e) => setNewDiaryContent(e.target.value)} placeholder={`Hôm nay tâm trí ${firstName} đang ở đâu?...`} className="flex-1 bg-transparent border-none outline-none text-2xl font-serif font-black text-[#5d4037] resize-none leading-loose placeholder:text-[#d7ccc8]" />
                  <div className="pt-8 border-t-2 border-[#d7ccc8] flex justify-between items-center">
                    <div className="text-[10px] font-black text-[#8d6e63] uppercase tracking-widest"><p>Màn hình: <span className="text-[#5d4037]">{user.last_screentime || 0}p</span></p><p>Ngày: <span className="text-[#5d4037]">{new Date().toLocaleDateString('vi-VN')}</span></p></div>
                    <button onClick={handleSaveDiary} className="bg-[#5d4037] text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-[#4e342e] transition-all shadow-2xl active:scale-95">Lưu vào ký ức</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
