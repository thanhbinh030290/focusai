import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Clock, Smile, Frown, Meh, Plus, TrendingDown, BookOpen, Zap, RefreshCw, Sparkles, ChevronRight, Trophy, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Dashboard({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [screentime, setScreentime] = useState('');
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });
  const [checkingIn, setCheckingIn] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showPsychChat, setShowPsychChat] = useState(false);
  const [psychMessage, setPsychMessage] = useState('');
  const [psychResponse, setPsychResponse] = useState('');
  const [loadingPsych, setLoadingPsych] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [diaryEmotion, setDiaryEmotion] = useState('happy');
  const [editingDiaryId, setEditingDiaryId] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
    fetchDiary();
  }, [user.id]);

  const fetchDiary = async () => {
    const res = await fetch(`/api/diary/${user.id}`);
    const data = await res.json();
    setDiaryEntries(data.entries);
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

  const handlePsychChat = async () => {
    if (!psychMessage.trim()) return;
    setLoadingPsych(true);
    try {
      const res = await fetch('/api/ai/psychology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: psychMessage,
          screentime: user.last_screentime || 0 
        }),
      });
      const data = await res.json();
      setPsychResponse(data.text);
    } catch (e) {
      console.error(e);
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

  const handleAutoExtract = () => {
    setExtracting(true);
    // Simulate extraction from screenshot or system
    setTimeout(async () => {
      const randomMinutes = Math.floor(Math.random() * 120) + 15;
      try {
        await fetch(`/api/user/${user.id}/log-screentime`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes: randomMinutes }),
        });
        const userRes = await fetch(`/api/user/${user.id}`);
        const userData = await userRes.json();
        setUser(userData.user);
        localStorage.setItem('nexus_user', JSON.stringify(userData.user));
        fetchStats();
      } finally {
        setExtracting(false);
      }
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl text-text-main mb-2">Thắng ơi, hôm nay bạn cảm thấy thế nào? 👋</h1>
          <p className="text-text-muted">FocusAI luôn đồng hành cùng bạn trên con đường chinh phục tri thức.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            <div>
              <p className="text-xs text-text-muted uppercase font-bold">Chuỗi</p>
              <p className="text-xl font-display font-bold text-text-main">{user.streak} ngày</p>
            </div>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20">
            <Star className="text-primary fill-primary" size={24} />
            <div>
              <p className="text-xs text-text-muted uppercase font-bold">Điểm</p>
              <p className="text-xl font-display font-bold text-text-main">{user.points}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Check-in */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-2 glass p-8 rounded-3xl relative overflow-hidden group min-h-[250px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Smile size={120} className="text-primary" />
          </div>
          
          <h2 className="text-2xl text-text-main mb-6 text-center">Tâm trạng của bạn hiện tại?</h2>
          
          <div className="relative flex flex-wrap justify-center items-center gap-4 min-h-24">
            <AnimatePresence mode="popLayout">
              {[
                { icon: Smile, color: 'text-emerald-500', id: 'happy', label: 'Hạnh phúc', emoji: '😊' },
                { icon: Sparkles, color: 'text-yellow-500', id: 'excited', label: 'Hưng phấn', emoji: '🤩' },
                { icon: Meh, color: 'text-blue-500', id: 'neutral', label: 'Bình thường', emoji: '😐' },
                { icon: Frown, color: 'text-orange-500', id: 'sad', label: 'Buồn', emoji: '😢' },
                { icon: Zap, color: 'text-red-500', id: 'anxious', label: 'Lo âu', emoji: '😰' },
                { icon: RefreshCw, color: 'text-purple-500', id: 'confused', label: 'Hoang mang', emoji: '😵‍💫' },
                { icon: TrendingDown, color: 'text-gray-500', id: 'unmotivated', label: 'Mất động lực', emoji: '😴' },
              ].map((item) => (
                (!selectedEmotion || selectedEmotion === item.id) && (
                  <motion.button
                    key={item.id}
                    layoutId={`emotion-${item.id}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    disabled={checkingIn || !!selectedEmotion}
                    onClick={() => handleCheckIn(item.id)}
                    className={cn(
                      "w-16 h-16 md:w-20 md:h-20 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full transition-all flex flex-col items-center justify-center group/btn",
                      selectedEmotion === item.id && "bg-primary/20 border-primary scale-125"
                    )}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    {selectedEmotion === item.id && (
                      <>
                        <motion.span 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] font-bold mt-1 text-primary uppercase"
                        >
                          {item.label}
                        </motion.span>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmotion(null);
                          }}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary hover:underline bg-white px-2 py-1 rounded-full shadow-sm border border-primary/10 whitespace-nowrap"
                        >
                          Thay đổi
                        </motion.button>
                      </>
                    )}
                  </motion.button>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Integrated Psychology Chat Bar */}
          <div className="mt-12 max-w-xl mx-auto w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex gap-2 bg-white border-2 border-primary/30 rounded-2xl p-2 shadow-lg">
                <input 
                  type="text"
                  value={psychMessage}
                  onChange={(e) => setPsychMessage(e.target.value)}
                  placeholder="Trò chuyện với chuyên gia tâm lý FocusAI..."
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main placeholder:text-text-muted/50"
                  onKeyDown={(e) => e.key === 'Enter' && handlePsychChat()}
                />
                <button 
                  onClick={() => {
                    if (psychMessage.trim()) {
                      setShowPsychChat(true);
                      handlePsychChat();
                    } else {
                      setShowPsychChat(true);
                    }
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 font-bold shadow-md shadow-primary/20"
                >
                  <MessageSquare size={18} />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-text-muted mt-3 uppercase font-bold tracking-widest opacity-60">
              Chuyên gia AI luôn lắng nghe và chia sẻ cùng bạn
            </p>
          </div>
          
          {!selectedEmotion && (
            <p className="mt-6 text-sm text-text-muted italic text-center">* Điểm danh mỗi ngày để duy trì chuỗi và nhận 10 điểm!</p>
          )}
        </motion.div>

        {/* Screen Time Auto-Extract */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-8 rounded-3xl border-primary/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-primary" size={24} />
            <h2 className="text-xl text-text-main">Thời gian sử dụng</h2>
          </div>
          <p className="text-sm text-text-muted mb-6">Tự động trích xuất thời gian sử dụng mạng xã hội từ hệ thống.</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleAutoExtract}
              disabled={extracting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 primary-glow"
            >
              {extracting ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
              {extracting ? 'Đang trích xuất...' : 'Trích xuất tự động'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingDown size={18} />
              <span className="text-sm font-bold uppercase">Gợi ý</span>
            </div>
            <p className="text-xs text-text-muted mb-3">Hệ thống sẽ phân tích thời gian dùng mạng xã hội, chơi game của bạn để đưa ra lời khuyên.</p>
            <button 
              onClick={() => setShowPsychChat(true)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Trò chuyện với chuyên gia tâm lý <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Psychology AI Chat Modal */}
        <AnimatePresence>
          {showPsychChat && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[32px] w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b flex justify-between items-center bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-primary/20">
                      <img 
                        src="https://lh3.googleusercontent.com/gg/AMW1TPq20fwUh3ggnf-W9BQEdZAK2Obb3XjVMsEEpVdx-Qt6NBcyOlX0fKyhvL6oKpxdO4Ij602JFOSpxZB9HeXlKQOso4OGeT978d3hzh-G4L1w0sOSudGiE2O6FEkWDFFad7hKrCN8SICGMJcYXWmN604Eu8QzVhJcNxm6s0ZtQaPKPnzEVSoYOqDkI6LxL-0lNwJBqNNfTKMKTwr8NwnBwLi1cnSGFstOkFa8JdgGJZoakTXfr5IDqK2wwm9VYowlhxghW5qfZSPDEP05iL8n6FiBjPv02W5TIS_dcJ9kM4uxdQ16daKrBYUkxwV1VLeJv8zRHQIXKwXOlj3JNyZ2dhOS=s1024-rj" 
                        alt="FocusAI Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main">Chuyên gia tâm lý FocusAI</h3>
                      <p className="text-xs text-text-muted">Đồng hành cùng bạn giảm thời gian MXH</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPsychChat(false)} className="text-text-muted hover:text-text-main">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {psychResponse ? (
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{psychResponse}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-4 opacity-20 grayscale">
                        <img 
                          src="https://lh3.googleusercontent.com/gg/AMW1TPq20fwUh3ggnf-W9BQEdZAK2Obb3XjVMsEEpVdx-Qt6NBcyOlX0fKyhvL6oKpxdO4Ij602JFOSpxZB9HeXlKQOso4OGeT978d3hzh-G4L1w0sOSudGiE2O6FEkWDFFad7hKrCN8SICGMJcYXWmN604Eu8QzVhJcNxm6s0ZtQaPKPnzEVSoYOqDkI6LxL-0lNwJBqNNfTKMKTwr8NwnBwLi1cnSGFstOkFa8JdgGJZoakTXfr5IDqK2wwm9VYowlhxghW5qfZSPDEP05iL8n6FiBjPv02W5TIS_dcJ9kM4uxdQ16daKrBYUkxwV1VLeJv8zRHQIXKwXOlj3JNyZ2dhOS=s1024-rj" 
                          alt="FocusAI Logo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-text-muted">Hãy đặt câu hỏi về thói quen sử dụng MXH của bạn.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t bg-white">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={psychMessage}
                      onChange={(e) => setPsychMessage(e.target.value)}
                      placeholder="Tại sao tôi lại nghiện TikTok?"
                      className="flex-1 bg-bg-main border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-primary"
                      onKeyDown={(e) => e.key === 'Enter' && handlePsychChat()}
                    />
                    <button 
                      onClick={handlePsychChat}
                      disabled={loadingPsych}
                      className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                      {loadingPsych ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Diary Section */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-text-main flex items-center gap-2">
              <BookOpen className="text-primary" size={20} />
              Nhật ký
            </h2>
            <button 
              onClick={() => openDiaryEditor()}
              className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
            >
              Viết nhật ký mới <Plus size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diaryEntries.length > 0 ? diaryEntries.slice(0, 3).map((entry: any) => (
              <motion.div 
                key={entry.id}
                whileHover={{ scale: 1.02 }}
                className="glass p-6 rounded-3xl border-primary/10 space-y-4 cursor-pointer"
                onClick={() => openDiaryEditor(entry)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {entry.emotion === 'happy' ? '😊' : entry.emotion === 'neutral' ? '😐' : '😟'}
                  </div>
                  <span className="text-xs text-text-muted">{new Date(entry.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="text-sm text-text-main line-clamp-3 italic">"{entry.content}"</p>
                <div className="pt-2 border-t border-primary/5 flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span className="text-xs text-text-muted">Dùng MXH: {entry.screentime}p</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full glass p-8 rounded-3xl text-center border-dashed border-2 border-primary/10">
                <p className="text-text-muted italic">Bạn chưa có nhật ký nào. Hãy bắt đầu viết ngay hôm nay!</p>
              </div>
            )}
          </div>
        </div>

        {/* Diary Modal */}
        <AnimatePresence>
          {showDiary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, rotateY: -20 }}
                animate={{ scale: 1, rotateY: 0 }}
                className="bg-[#fffcf0] rounded-[32px] w-full max-w-2xl h-[70vh] flex shadow-2xl overflow-hidden border-8 border-[#5d4037]"
              >
                {/* Single Page: Entry Editor */}
                <div className="flex-1 p-8 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-serif font-bold text-[#5d4037] border-b-2 border-[#5d4037] pb-2">
                      {editingDiaryId ? 'Chỉnh sửa nhật ký' : 'Trang mới'}
                    </h3>
                    <button onClick={() => setShowDiary(false)} className="text-[#5d4037] hover:scale-110 transition-transform">
                      <Plus className="rotate-45" size={24} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8d6e63] uppercase">Cảm xúc hôm nay</label>
                      <div className="flex gap-4">
                        {['happy', 'neutral', 'anxious'].map(e => (
                          <button 
                            key={e}
                            onClick={() => setDiaryEmotion(e)}
                            className={cn(
                              "text-3xl p-2 rounded-xl transition-all",
                              diaryEmotion === e ? "bg-[#5d4037] scale-110" : "bg-transparent grayscale opacity-50"
                            )}
                          >
                            {e === 'happy' ? '😊' : e === 'neutral' ? '😐' : '😟'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-2">
                      <label className="text-xs font-bold text-[#8d6e63] uppercase">Suy nghĩ của bạn</label>
                      <textarea 
                        value={newDiaryContent}
                        onChange={(e) => setNewDiaryContent(e.target.value)}
                        placeholder="Hôm nay của bạn thế nào?..."
                        className="flex-1 bg-transparent border-none outline-none text-lg font-serif text-[#5d4037] resize-none placeholder:text-[#d7ccc8]"
                      />
                    </div>

                    <div className="pt-4 border-t border-[#d7ccc8] flex justify-between items-center">
                      <div className="text-xs text-[#8d6e63]">
                        <p>Thời gian MXH: <b>{user.last_screentime || 0}p</b></p>
                        <p>Ngày: <b>{new Date().toLocaleDateString('vi-VN')}</b></p>
                      </div>
                      <button 
                        onClick={handleSaveDiary}
                        className="bg-[#5d4037] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4e342e] transition-all shadow-lg"
                      >
                        {editingDiaryId ? 'Cập nhật' : 'Lưu vào sổ'}
                      </button>
                    </div>
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

