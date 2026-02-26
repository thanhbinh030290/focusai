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

  // Tự động cuộn xuống khi có tin nhắn mới
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
      body: JSON.stringify({
        userId: user.id,
        content: newDiaryContent,
        emotion: diaryEmotion,
        screentime: user.last_screentime || 0
      }),
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
        body: JSON.stringify({ 
          message: messageToSend,
          screentime: user.last_screentime || 0 
        }),
      });
      const data = await res.json();
      setPsychHistory(prev => [...prev, { role: 'ai', text: data.text || "Mình đã nhận được thông tin, hãy tiếp tục chia sẻ nhé!" }]);
    } catch (e) {
      setPsychHistory(prev => [...prev, { role: 'ai', text: "Có chút gián đoạn kết nối, Linh thử lại nhé!" }]);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl text-text-main font-black mb-2">{user.name} ơi, hôm nay thế nào? 👋</h1>
          <p className="text-text-muted font-medium">FocusAI luôn đồng hành cùng bạn trên con đường chinh phục tri thức.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20 shadow-lg">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            <div>
              <p className="text-[10px] text-text-muted uppercase font-black">Chuỗi</p>
              <p className="text-xl font-bold text-text-main">{user.streak} ngày</p>
            </div>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20 shadow-lg">
            <Star className="text-primary fill-primary" size={24} />
            <div>
              <p className="text-[10px] text-text-muted uppercase font-black">Điểm</p>
              <p className="text-xl font-bold text-text-main">{user.points}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in Section */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-3 glass p-10 rounded-[40px] relative overflow-hidden group min-h-[350px] flex flex-col justify-center border-primary/10 bg-gradient-to-br from-white via-white to-primary/5 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Sparkles size={160} className="text-primary" />
          </div>
          <div className="absolute bottom-0 left-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Zap size={140} className="text-purple-500" />
          </div>
          
          <h2 className="text-3xl font-black text-text-main mb-10 text-center tracking-tight">Tâm trạng của bạn hiện tại? ✨</h2>
          
          <div className="relative flex flex-wrap justify-center items-center gap-6 min-h-32">
            <AnimatePresence mode="popLayout">
              {[
                { icon: Smile, id: 'happy', label: 'Hạnh phúc', emoji: '😊', bg: 'bg-emerald-500/10' },
                { icon: Sparkles, id: 'excited', label: 'Hưng phấn', emoji: '🤩', bg: 'bg-yellow-500/10' },
                { icon: Meh, id: 'neutral', label: 'Bình thường', emoji: '😐', bg: 'bg-blue-500/10' },
                { icon: Frown, id: 'sad', label: 'Buồn', emoji: '😢', bg: 'bg-orange-500/10' },
                { icon: Zap, id: 'anxious', label: 'Lo âu', emoji: '😰', bg: 'bg-red-500/10' },
                { icon: RefreshCw, id: 'confused', label: 'Hoang mang', emoji: '😵‍💫', bg: 'bg-purple-500/10' },
              ].map((item) => (
                (!selectedEmotion || selectedEmotion === item.id) && (
                  <motion.div
                    key={item.id}
                    layoutId={`emotion-${item.id}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    onClick={() => !checkingIn && !selectedEmotion && handleCheckIn(item.id)}
                    className={cn(
                      "w-24 h-24 md:w-28 md:h-28 rounded-[32px] transition-all flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer",
                      item.bg,
                      selectedEmotion === item.id ? "ring-4 ring-primary ring-offset-4 scale-110" : "hover:shadow-xl",
                      (checkingIn || !!selectedEmotion) && selectedEmotion !== item.id && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    <span className="text-4xl md:text-5xl">{item.emoji}</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{item.label}</span>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Chat Bar Integrated */}
          <div className="mt-12 max-w-xl mx-auto w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex gap-2 bg-white border-2 border-primary/30 rounded-2xl p-2 shadow-lg">
                <input 
                  type="text"
                  value={psychMessage}
                  onChange={(e) => setPsychMessage(e.target.value)}
                  placeholder="Trò chuyện với chuyên gia tâm lý..."
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main font-bold"
                  onKeyDown={(e) => e.key === 'Enter' && handlePsychChat()}
                />
                <button 
                  onClick={() => setShowPsychChat(true)}
                  className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 font-black shadow-md"
                >
                  <MessageSquare size={18} />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Psychology Modal - Chat History Version */}
        <AnimatePresence>
          {showPsychChat && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[32px] w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b flex justify-between items-center bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white">
                      <img src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-text-main">Chuyên gia FocusAI</h3>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Đang lắng nghe bạn...</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPsychChat(false)} className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                <div ref={psychScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {psychHistory.length > 0 ? (
                    psychHistory.map((msg, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                        className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", 
                          msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-primary/20 text-primary")}>
                          {msg.role === 'user' ? <UserCircle size={22} /> : <Bot size={22} />}
                        </div>
                        <div className={cn("max-w-[80%] p-4 rounded-2xl shadow-sm font-medium text-sm leading-relaxed", 
                          msg.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-primary/5 text-text-main border border-primary/10 rounded-tl-none")}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                        <Bot size={40} />
                      </div>
                      <div className="max-w-xs">
                        <h4 className="font-black text-xl text-text-main mb-2">Chào Linh, mình đây!</h4>
                        <p className="text-sm text-text-muted font-medium">Bạn muốn tâm sự về thói quen dùng mạng xã hội hay áp lực gì hôm nay không?</p>
                      </div>
                      <div className="flex flex-col gap-2 w-full max-w-xs">
                        {["Làm sao bớt dùng TikTok?", "Tôi thấy lo khi thiếu điện thoại"].map(txt => (
                          <button key={txt} onClick={() => handlePsychChat(txt)} className="p-3 bg-white border-2 border-primary/10 rounded-xl text-xs font-black text-primary hover:bg-primary hover:text-white transition-all">"{txt}"</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {loadingPsych && (
                    <div className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center animate-pulse"><Bot size={22} className="text-primary"/></div>
                    <div className="bg-primary/5 p-4 rounded-2xl flex gap-1 items-center"><span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"/><span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"/><span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"/></div></div>
                  )}
                </div>

                <div className="p-6 border-t bg-white">
                  <div className="flex gap-2 bg-bg-main p-2 rounded-2xl border-2 border-border-subtle focus-within:border-primary transition-all">
                    <input type="text" value={psychMessage} onChange={(e) => setPsychMessage(e.target.value)} placeholder="Nhập tâm sự của bạn..." className="flex-1 bg-transparent px-2 py-2 outline-none font-bold" onKeyDown={(e) => e.key === 'Enter' && handlePsychChat()} />
