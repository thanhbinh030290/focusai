import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Đã sửa lại đúng thư viện chuẩn trong file của Linh
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCircle, Star, Clock, BookOpen, Trophy, Calendar, 
  CheckCircle2, Flame, Edit2, Camera, Rocket, Search, 
  Users, UserPlus, Plus, MessageCircle, Send, ArrowRight, Sparkles 
} from 'lucide-react';

const CHARACTERS = [
  { id: 1, name: 'Học giả Tập trung', emoji: '👨‍🎓' },
  { id: 2, name: 'Phi hành gia', emoji: '🧑‍🚀' },
  { id: 3, name: 'Pháp sư Tri thức', emoji: '🧙‍♂️' },
  { id: 4, name: 'Ninja Kỷ luật', emoji: '🥷' },
  { id: 5, name: 'Robot Thông minh', emoji: '🤖' },
  { id: 6, name: 'Người ngoài hành tinh', emoji: '👽' },
  { id: 7, name: 'Siêu anh hùng', emoji: '🦸‍♂️' },
  { id: 8, name: 'Thám tử', emoji: '🕵️‍♂️' },
  { id: 9, name: 'Nhà khoa học', emoji: '👨‍🔬' },
  { id: 10, name: 'Nghệ sĩ', emoji: '👩‍🎨' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 11,
    name: `Nhân vật cao cấp ${i + 1}`,
    emoji: ['🧛‍♂️', '🧟‍♂️', '🧞‍♂️', '🧜‍♂️', '🧚‍♂️', '👼', '🤴', '👸', '🤶', '🎅'][i % 10]
  }))
];

const VEHICLES = [
  { id: 1, name: 'Tàu khởi đầu', emoji: '🚀' },
  { id: 2, name: 'Đĩa bay UFO', emoji: '🛸' },
  { id: 3, name: 'Vệ tinh quan sát', emoji: '🛰️' },
  { id: 4, name: 'Máy bay phản lực', emoji: '✈️' },
  { id: 5, name: 'Trực thăng tương lai', emoji: '🚁' },
  { id: 6, name: 'Xe đua thiên hà', emoji: '🏎️' },
  { id: 7, name: 'Mô tô ánh sáng', emoji: '🏍️' },
  { id: 8, name: 'Thuyền không gian', emoji: '🚤' },
  { id: 9, name: 'Rồng máy', emoji: '🐲' },
  { id: 10, name: 'Phượng hoàng lửa', emoji: '🔥' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 11,
    name: `Tàu chiến hạng nặng ${i + 1}`,
    emoji: ['🚢', '🚜', '🚛', '🚌', '🚒', '🚓', '🚕', '🚗', '🚲', '🛴'][i % 10]
  }))
];

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Profile({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [stats, setStats] = useState<any>({ logs: [], achievements: [] });
  const [inventory, setInventory] = useState<any[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [newAvatar, setNewAvatar] = useState(user.avatar_url || '');

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Lấy tên rút gọn chuẩn theo logic của Linh
  const firstName = user?.name ? user.name.split(' ').pop() : 'Bạn';

  useEffect(() => {
    fetchSuggestions();
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/friends/${user.id}`);
      const data = await res.json();
      setFriends(data.friends || []);
    } catch(e) { setFriends([]); }
  };

  const fetchMessages = async (friendId: number) => {
    try {
      const res = await fetch(`/api/messages/${user.id}/${friendId}`);
      const data = await res.json();
      setChatMessages(data.messages || []);
    } catch(e) { setChatMessages([]); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !viewingUser) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: user.id, receiverId: viewingUser.user.id, content: newMessage }),
    });
    setNewMessage('');
    fetchMessages(viewingUser.user.id);
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/users/suggestions?userId=${user.id}`);
      const data = await res.json();
      setSuggestions(data.users || []);
    } catch(e) { setSuggestions([]); }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/users/search?q=${q}&userId=${user.id}`);
    const data = await res.json();
    setSearchResults(data.users || []);
  };

  const viewPublicProfile = async (id: number) => {
    const res = await fetch(`/api/user/${id}/public`);
    const data = await res.json();
    setViewingUser(data);
    fetchMessages(id);
  };

  const addFriend = async (friendId: number) => {
    await fetch('/api/friends/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, friendId }),
    });
    alert('Đã gửi lời mời kết bạn!');
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}`);
      const data = await res.json();
      setInventory(data.inventory || []);
      
      const statsRes = await fetch(`/api/user/${user.id}/stats`);
      const statsData = await statsRes.json();
      setStats(statsData || { logs: [], achievements: [] });
    } catch(e) {}
  };

  const handleRename = async () => {
    const cost = Math.min(20, (user.rename_count + 1) * 2);
    if (user.points < cost) return;
    try {
      const res = await fetch(`/api/user/${user.id}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) {
        const userRes = await fetch(`/api/user/${user.id}`);
        const data = await userRes.json();
        setUser(data.user);
        setIsRenaming(false);
      }
    } catch (e) {}
  };

  const handleAvatarUpdate = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: newAvatar }),
      });
      if (res.ok) {
        const userRes = await fetch(`/api/user/${user.id}`);
        const data = await userRes.json();
        setUser(data.user);
        setIsUpdatingAvatar(false);
      }
    } catch (e) {}
  };

  // Tính toán screentime an toàn
  const screentimeLogs = stats?.logs?.filter((l: any) => l.type === 'screentime') || [];
  const selectedChar = CHARACTERS.find(c => c.id === user.selected_character_id);
  const renameCost = Math.min(20, (user.rename_count + 1) * 2);

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      
      {/* HEADER GIAO DIỆN MỚI SIÊU CHẤT */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-violet-50">
        <div className="h-56 md:h-72 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/cover/1200/400" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white text-sm font-black flex items-center gap-2 border border-white/30 shadow-lg transition-all">
            <Camera size={16} /> Ảnh bìa
          </button>
        </div>

        <div className="px-6 md:px-12 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-20 md:-mt-24">
            {/* Avatar Pro */}
            <div className="relative group z-10">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-[40px] border-[6px] border-white bg-violet-100 shadow-2xl overflow-hidden flex items-center justify-center text-7xl relative rotate-3 hover:rotate-0 transition-transform duration-300">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center relative">
                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-2xl scale-125">
                      {selectedChar?.emoji || '👤'}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsUpdatingAvatar(true)}
                className="absolute -bottom-2 -right-2 p-3 bg-violet-600 hover:bg-violet-800 text-white rounded-2xl shadow-xl border-4 border-white transition-all hover:scale-110 active:scale-95"
              >
                <Camera size={20} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight">{user.name}</h1>
                <button onClick={() => setIsRenaming(true)} className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all shadow-sm">
                  <Edit2 size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Flame size={14}/> Cấp {user.level}
                </span>
                <span className="text-text-muted font-bold flex items-center gap-1">
                  <Users size={16}/> {friends.length} Bạn bè
                </span>
              </div>
            </div>

            <div className="flex gap-3 mb-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-violet-600 text-white px-8 py-4 rounded-[20px] font-black text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">
                <Sparkles size={18} /> Kho Thành Tích
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CỘT TRÁI: GIỚI THIỆU & TÌM KIẾM */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <h3 className="text-2xl font-black text-text-main mb-6">Trang bị</h3>
            <div className="space-y-5 font-bold text-text-muted">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-inner"><Star className="text-yellow-600 fill-yellow-600" size={24} /></div>
                <span>Sở hữu <b>{user.points}</b> điểm tích lũy</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner"><Flame className="text-orange-600 fill-orange-600" size={24} /></div>
                <span>Chuỗi học tập <b>{user.streak}</b> ngày</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner"><Trophy className="text-emerald-600" size={24} /></div>
                <span>Kỷ lục <b>{user.max_correct_streak}</b> câu Quiz</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <h3 className="text-2xl font-black text-text-main mb-6 flex items-center gap-2"><Search size={24} className="text-violet-600"/> Đồng đội</h3>
            <div className="relative mb-6">
              <input 
                value={searchQuery} 
                onChange={(e) => handleSearch(e.target.value)} 
                placeholder="Tìm bạn bè..."
                className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 pl-4 pr-12 font-black outline-none focus:border-violet-600 transition-all placeholder:text-violet-300"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-xl shadow-md"><Search size={18}/></button>
            </div>
            <div className="space-y-4">
              {(searchResults.length > 0 ? searchResults : suggestions).slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white border-2 border-violet-50 p-3 rounded-2xl hover:border-violet-200 transition-all group">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewPublicProfile(u.id)}>
                    <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-12 h-12 rounded-xl bg-violet-100 object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div><span className="text-sm font-black text-text-main block">{u.name}</span><span className="text-[10px] font-bold text-text-muted">Lv. {u.level}</span></div>
                  </div>
                  <button onClick={() => addFriend(u.id)} className="p-2.5 bg-violet-100 rounded-xl hover:bg-violet-600 hover:text-white text-violet-600 transition-all"><UserPlus size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THỐNG KÊ & BỘ SƯU TẬP */}
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Star size={80}/></div>
              <p className="text-xs font-black uppercase opacity-80 mb-1">Điểm số</p><p className="text-4xl font-black">{user.points}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><CheckCircle2 size={80}/></div>
              <p className="text-xs font-black uppercase opacity-80 mb-1">Thành tựu</p><p className="text-4xl font-black">{stats.achievements.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Flame size={80}/></div>
              <p className="text-xs font-black uppercase opacity-80 mb-1">Kỷ luật</p><p className="text-4xl font-black">{user.streak}</p>
            </div>
            <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Rocket size={80}/></div>
              <p className="text-xs font-black uppercase opacity-80 mb-1">Sưu tầm</p><p className="text-4xl font-black">{inventory.length}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-text-main">Kho Đồ Của {firstName}</h3>
              <Link to="/shop" className="bg-violet-100 text-violet-600 font-black px-5 py-2 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm flex items-center gap-2">Cửa hàng <ArrowRight size={16}/></Link>
            </div>
            {inventory.length === 0 ? (
              <div className="text-center py-10 bg-violet-50 rounded-[30px] border-2 border-dashed border-violet-200"><p className="text-lg font-bold text-violet-400">Kho đồ trống.</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {inventory.map((item: any) => {
                  const isVehicle = item.type === 'vehicle';
                  const itemData = isVehicle ? VEHICLES.find(v => v.id === item.item_id) : CHARACTERS.find(c => c.id === item.item_id);
                  return (
                    <motion.div whileHover={{ y: -5, scale: 1.05 }} key={`${item.type}-${item.item_id}`} className="group relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-md border-2 border-violet-100">
                      <div className={cn("absolute inset-0 opacity-80", isVehicle ? "bg-gradient-to-b from-blue-300 to-indigo-600" : "bg-gradient-to-b from-emerald-300 to-teal-600")}></div>
                      <div className="absolute inset-0 flex items-center justify-center"><span className="text-6xl drop-shadow-2xl">{itemData?.emoji}</span></div>
                      <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-md p-2 translate-y-full group-hover:translate-y-0 transition-transform"><p className="text-[10px] font-black text-white text-center truncate">{itemData?.name}</p></div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isRenaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 rounded-[40px] max-w-md w-full space-y-8 shadow-2xl border-4 border-violet-50">
              <h3 className="text-3xl font-black text-text-main text-center">Tên mới, vận hội mới</h3>
              <div className="space-y-4">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 px-6 outline-none focus:border-violet-600 font-black text-lg text-center" />
                <div className="bg-yellow-50 p-4 rounded-2xl text-center"><p className="text-sm font-bold text-yellow-700">Lệ phí: <span className="font-black text-xl">{renameCost}</span> Điểm</p></div>
                <div className="flex gap-4"><button onClick={() => setIsRenaming(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black">Hủy</button><button onClick={handleRename} className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black">Xác nhận</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Modal xem Profile người khác chuẩn cấu trúc của Linh */}
        {viewingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] max-w-5xl w-full h-[85vh] flex flex-col md:flex-row shadow-2xl overflow-hidden relative border-4 border-violet-100">
              <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 text-violet-300 hover:text-red-500 z-50 bg-white p-2 rounded-full shadow-md"><Plus className="rotate-45" size={28} /></button>
              <div className="w-full md:w-5/12 p-10 bg-violet-50 overflow-y-auto border-r-2 border-violet-100 flex flex-col items-center justify-center">
                <img src={viewingUser.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.user.name}`} className="w-32 h-32 rounded-[30px] border-4 border-white shadow-xl object-cover" />
                <h3 className="text-3xl font-black text-text-main mt-4">{viewingUser.user.name}</h3>
                <button onClick={() => addFriend(viewingUser.user.id)} className="w-full bg-violet-600 text-white py-3 rounded-2xl font-black mt-6 shadow-lg">Kết bạn</button>
              </div>
              <div className="w-full md:w-7/12 flex flex-col bg-white">
                <div className="p-6 border-b-2 border-violet-50 flex items-center gap-3"><MessageCircle className="text-violet-600"/><h4 className="font-black text-lg">Trò chuyện với {viewingUser.user.name.split(' ').pop()}</h4></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f7ff]">
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[75%]", msg.sender_id === user.id ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={cn("px-5 py-3 rounded-[24px] font-bold text-sm shadow-sm", msg.sender_id === user.id ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white text-text-main border border-violet-100 rounded-tl-sm")}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-white border-t-2 border-violet-50 flex gap-3">
                  <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Gửi tin nhắn..." className="flex-1 bg-violet-50 border-2 border-violet-100 rounded-2xl px-6 py-4 font-black outline-none" />
                  <button onClick={sendMessage} className="w-14 h-14 bg-violet-600 text-white flex items-center justify-center rounded-2xl hover:bg-violet-700 shadow-xl transition-all"><Send size={24} /></button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
