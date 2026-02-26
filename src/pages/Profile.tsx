import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Star, Clock, BookOpen, Trophy, Calendar, CheckCircle2, Flame, Edit2, Camera, Rocket, Search, Users, UserPlus, Plus, MessageCircle, Send, Sparkles, MapPin } from 'lucide-react';

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

  // Lấy tên rút gọn
  const firstName = user?.name ? user.name.split(' ').pop() : 'Bạn';

  useEffect(() => {
    fetchSuggestions();
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/friends/${user.id}`);
      const data = await res.json();
      if(data.friends) setFriends(data.friends);
    } catch(e) {}
  };

  const fetchMessages = async (friendId: number) => {
    try {
      const res = await fetch(`/api/messages/${user.id}/${friendId}`);
      const data = await res.json();
      if(data.messages) setChatMessages(data.messages);
    } catch(e) {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !viewingUser) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: viewingUser.user.id,
          content: newMessage
        }),
      });
      setNewMessage('');
      fetchMessages(viewingUser.user.id);
    } catch(e) {}
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/users/suggestions?userId=${user.id}`);
      const data = await res.json();
      if(data.users) setSuggestions(data.users);
    } catch(e) {}
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${q}&userId=${user.id}`);
      const data = await res.json();
      if(data.users) setSearchResults(data.users);
    } catch(e) {}
  };

  const viewPublicProfile = async (id: number) => {
    try {
      const res = await fetch(`/api/user/${id}/public`);
      const data = await res.json();
      setViewingUser(data);
      fetchMessages(id);
    } catch(e) {}
  };

  const addFriend = async (friendId: number) => {
    try {
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId }),
      });
      alert('Đã gửi lời mời kết bạn!');
    } catch(e) {}
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}`);
      const data = await res.json();
      if(data.inventory) setInventory(data.inventory);
      
      const statsRes = await fetch(`/api/user/${user.id}/stats`);
      const statsData = await statsRes.json();
      if(statsData) setStats(statsData);
    } catch(e) {}
  };

  const handleRename = async () => {
    const cost = Math.min(20, ((user.rename_count || 0) + 1) * 2);
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

  const screentimeLogs = stats?.logs?.filter((l: any) => l.type === 'screentime') || [];
  
  const timeMilestones = [
    { label: '< 15p', value: 15 },
    { label: '< 30p', value: 30 },
    { label: '< 1h', value: 60 },
    { label: '< 2h', value: 120 },
    { label: '< 3h', value: 180 },
    { label: '< 5h', value: 300 },
    { label: '< 7h', value: 420 },
    { label: '> 7h', value: 999 },
  ];

  const screentimeStats = timeMilestones.map((m, idx) => {
    const count = screentimeLogs.filter((l: any) => {
      const val = parseInt(l.value) || 0;
      if (m.value === 999) return val > 420;
      if (m.value === 15) return val <= 15;
      const prevVal = timeMilestones[idx-1].value;
      return val > prevVal && val <= m.value;
    }).length;
    return { ...m, count };
  });

  const selectedChar = CHARACTERS.find(c => c.id === user.selected_character_id);
  const renameCost = Math.min(20, ((user.rename_count || 0) + 1) * 2);

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      
      {/* HEADER SIÊU CẤP PRO */}
      <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border-4 border-violet-50">
        {/* Ảnh bìa gradient vũ trụ */}
        <div className="h-56 md:h-72 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden group">
          {/* Hiệu ứng mờ ảo */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-[80px] rounded-full"></div>
          
          <img 
            src="https://picsum.photos/seed/cover/1200/400" 
            className="w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            alt="Cover"
          />
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-sm font-black flex items-center gap-2 border border-white/30 transition-all shadow-lg">
            <Camera size={16} /> Đổi ảnh bìa
          </button>
        </div>

        {/* Thông tin Profile */}
        <div className="px-6 md:px-12 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-20 md:-mt-24">
            {/* Avatar Cực chất */}
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

            {/* Tên và Danh hiệu */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight">{user.name}</h1>
                <button onClick={() => setIsRenaming(true)} className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all shadow-sm w-fit mx-auto md:mx-0">
                  <Edit2 size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Flame size={14}/> Cấp độ {user.level || 1}
                </span>
                <span className="text-text-muted font-bold flex items-center gap-1">
                  <Users size={16}/> {friends.length} Bạn bè
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 mb-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-violet-600 text-white px-8 py-4 rounded-[20px] font-black text-sm hover:bg-violet-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                <Sparkles size={18} /> Kho Khoe Thành Tích
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ---------------- CỘT TRÁI: GIỚI THIỆU & BẠN BÈ ---------------- */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Box Giới thiệu */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <h3 className="text-2xl font-black text-text-main mb-6">Trang bị</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-inner"><Star className="text-yellow-600 fill-yellow-600" size={24} /></div>
                <div>
                  <p className="text-xs font-black text-text-muted uppercase tracking-wider">Tài sản</p>
                  <p className="text-lg font-black text-text-main">{user.points || 0} điểm</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner"><Flame className="text-orange-600 fill-orange-600" size={24} /></div>
                <div>
                  <p className="text-xs font-black text-text-muted uppercase tracking-wider">Kỷ luật</p>
                  <p className="text-lg font-black text-text-main">{user.streak || 0} ngày liên tiếp</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner"><Trophy className="text-emerald-600" size={24} /></div>
                <div>
                  <p className="text-xs font-black text-text-muted uppercase tracking-wider">Trí tuệ</p>
                  <p className="text-lg font-black text-text-main">Chuỗi {user.max_correct_streak || 0} câu Quiz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Box Tìm Bạn & Gợi Ý */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <h3 className="text-2xl font-black text-text-main mb-6 flex items-center gap-2"><Search size={24} className="text-violet-600"/> Tìm đồng đội</h3>
            <div className="relative mb-6">
              <input 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Nhập tên người dùng..."
                className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 pl-4 pr-12 font-bold text-text-main outline-none focus:border-violet-600 transition-all placeholder:text-violet-300"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-xl shadow-md"><Search size={18}/></button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Gợi ý kết bạn</p>
              {(searchResults.length > 0 ? searchResults : suggestions).slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white border-2 border-violet-50 p-3 rounded-2xl hover:border-violet-200 transition-all group">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewPublicProfile(u.id)}>
                    <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-12 h-12 rounded-xl bg-violet-100 object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div>
                      <span className="text-sm font-black text-text-main block">{u.name}</span>
                      <span className="text-[10px] font-bold text-text-muted">Lv. {u.level || 1}</span>
                    </div>
                  </div>
                  <button onClick={() => addFriend(u.id)} className="p-2.5 bg-violet-100 rounded-xl hover:bg-violet-600 hover:text-white text-violet-600 transition-all shadow-sm">
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ---------------- CỘT PHẢI: THỐNG KÊ & BỘ SƯU TẬP ---------------- */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Khung Thống kê Nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Star size={80}/></div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Điểm số</p>
              <p className="text-4xl font-black">{user.points || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><CheckCircle2 size={80}/></div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Nhiệm vụ</p>
              <p className="text-4xl font-black">{stats?.achievements?.length || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Flame size={80}/></div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Kỷ luật</p>
              <p className="text-4xl font-black">{user.streak || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-6 rounded-[30px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform"><Rocket size={80}/></div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Sưu tầm</p>
              <p className="text-4xl font-black">{inventory.length}</p>
            </div>
          </div>

          {/* Bạn bè */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-text-main flex items-center gap-2"><Users size={24} className="text-violet-600"/> Danh sách bạn bè</h3>
              <span className="text-sm font-black text-violet-600 bg-violet-100 px-4 py-1.5 rounded-full">{friends.length} người</span>
            </div>
            {friends.length === 0 ? (
              <p className="text-center text-text-muted font-bold py-8">Chưa có ai ở đây cả. Hãy kết bạn thêm nhé!</p>
            ) : (
              <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                {friends.map(f => (
                  <div key={f.id} className="min-w-[100px] flex flex-col items-center gap-2 cursor-pointer group" onClick={() => viewPublicProfile(f.id)}>
                    <div className="w-20 h-20 rounded-[24px] bg-violet-100 p-1 border-2 border-transparent group-hover:border-violet-500 transition-all shadow-md">
                      <img src={f.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`} className="w-full h-full object-cover rounded-[18px]" />
                    </div>
                    <p className="text-sm font-black text-text-main truncate w-full text-center group-hover:text-violet-600">{f.name.split(' ').pop()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bộ Sưu Tập - Card Style */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-violet-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-text-main">Kho Đồ Của {firstName}</h3>
              <Link to="/shop" className="bg-violet-100 text-violet-600 font-black px-5 py-2 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                Đến Cửa Hàng <ArrowRight size={16}/>
              </Link>
            </div>
            
            {inventory.length === 0 ? (
              <div className="text-center py-10 bg-violet-50 rounded-[30px] border-2 border-dashed border-violet-200">
                <p className="text-lg font-bold text-violet-400">Kho đồ đang trống trơn.</p>
                <Link to="/shop" className="text-violet-600 font-black hover:underline mt-2 inline-block">Mua sắm ngay!</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {inventory.map((item: any) => {
                  const isVehicle = item.type === 'vehicle';
                  const itemData = isVehicle ? VEHICLES.find(v => v.id === item.item_id) : CHARACTERS.find(c => c.id === item.item_id);
                  return (
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.05 }}
                      key={`${item.type}-${item.item_id}`} 
                      className="group relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer border-2 border-violet-100"
                    >
                      {/* Background Gradient theo loại */}
                      <div className={cn(
                        "absolute inset-0 opacity-80",
                        isVehicle ? "bg-gradient-to-b from-blue-300 to-indigo-600" : "bg-gradient-to-b from-emerald-300 to-teal-600"
                      )}></div>
                      
                      {/* Emoji To đùng ở giữa */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className="text-6xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">{itemData?.emoji}</span>
                      </div>

                      {/* Tên Item ở dưới đáy */}
                      <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[10px] font-black text-white text-center uppercase tracking-widest truncate">{itemData?.name}</p>
                      </div>

                      {/* Tag Phân loại */}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <p className="text-[8px] font-black text-text-main uppercase">{isVehicle ? 'Phương tiện' : 'Nhân vật'}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- MODALS ---------------- */}
      <AnimatePresence>
        {isRenaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 rounded-[40px] max-w-md w-full space-y-8 shadow-2xl border-4 border-violet-50">
              <h3 className="text-3xl font-black text-text-main text-center">Tên mới, vận hội mới</h3>
              <div className="space-y-4">
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Nhập tên mới..."
                  className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 px-6 outline-none focus:border-violet-600 font-black text-lg text-center text-text-main" 
                />
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl text-center">
                  <p className="text-sm font-bold text-yellow-700">Lệ phí đổi tên: <span className="font-black text-yellow-600 text-xl">{renameCost}</span> Điểm</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsRenaming(false)} className="flex-1 bg-gray-100 text-text-muted py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">Hủy</button>
                  <button onClick={handleRename} className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-violet-700 active:scale-95 transition-all">Xác nhận</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isUpdatingAvatar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 rounded-[40px] max-w-md w-full space-y-8 shadow-2xl border-4 border-violet-50">
              <h3 className="text-3xl font-black text-text-main text-center">Đổi Ảnh Đại Diện</h3>
              <div className="space-y-4">
                <input 
                  value={newAvatar} 
                  onChange={(e) => setNewAvatar(e.target.value)} 
                  placeholder="Dán URL ảnh vào đây..." 
                  className="w-full bg-violet-50 border-2 border-violet-100 rounded-2xl py-4 px-6 outline-none focus:border-violet-600 font-bold text-text-main" 
                />
                {newAvatar && (
                  <div className="flex justify-center pt-4">
                    <img src={newAvatar} alt="Preview" className="w-32 h-32 rounded-[24px] object-cover border-4 border-violet-100 shadow-xl" onError={(e) => e.currentTarget.src = 'https://picsum.photos/seed/error/200/200'} />
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsUpdatingAvatar(false)} className="flex-1 bg-gray-100 text-text-muted py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">Hủy</button>
                  <button onClick={handleAvatarUpdate} className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-violet-700 active:scale-95 transition-all">Cập nhật</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] max-w-5xl w-full h-[85vh] flex flex-col md:flex-row shadow-2xl overflow-hidden relative border-4 border-violet-100">
              <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 text-violet-300 hover:text-red-500 z-50 bg-white p-2 rounded-full shadow-md transition-all"><Plus className="rotate-45" size={28} /></button>
              
              {/* Cột trái: Thông tin bạn bè */}
              <div className="w-full md:w-5/12 p-10 bg-violet-50 overflow-y-auto border-r-2 border-violet-100">
                <div className="text-center space-y-4">
                  <img src={viewingUser.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.user.name}`} className="w-32 h-32 rounded-[30px] mx-auto bg-white border-4 border-white shadow-xl object-cover" />
                  <h3 className="text-3xl font-black text-text-main">{viewingUser.user.name}</h3>
                  <div className="flex justify-center gap-2">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-xl text-xs font-black uppercase">Lv. {viewingUser.user.level || 1}</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-xl text-xs font-black uppercase">{viewingUser.user.points || 0} Điểm</span>
                  </div>
                  <button onClick={() => addFriend(viewingUser.user.id)} className="w-full bg-violet-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-violet-700 shadow-lg active:scale-95 transition-all mt-4">
                    <UserPlus size={20} /> Gửi lời mời kết bạn
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-violet-100">
                    <p className="text-[10px] text-text-muted uppercase font-black">Chuỗi Quizzes</p>
                    <p className="text-2xl font-black text-violet-600">{viewingUser.user.max_correct_streak || 0}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-violet-100">
                    <p className="text-[10px] text-text-muted uppercase font-black">Thành tựu</p>
                    <p className="text-2xl font-black text-emerald-500">{viewingUser.achievements?.length || 0}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="font-black text-text-main">Tủ đồ nổi bật</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {viewingUser.inventory?.slice(0, 6).map((item: any) => (
                      <div key={`${item.type}-${item.item_id}`} className="aspect-square bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-violet-100 hover:scale-110 transition-transform cursor-help" title={item.type}>
                        {item.type === 'character' ? CHARACTERS.find(c => c.id === item.item_id)?.emoji : VEHICLES.find(v => v.id === item.item_id)?.emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cột phải: Chat */}
              <div className="w-full md:w-7/12 flex flex-col bg-white">
                <div className="p-6 border-b-2 border-violet-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600"><MessageCircle size={20} /></div>
                  <h4 className="font-black text-text-main text-lg">Trò chuyện với {viewingUser.user.name.split(' ').pop()}</h4>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f7ff]">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <MessageCircle size={48} className="text-violet-300 mb-4" />
                      <p className="font-bold text-violet-400">Chưa có tin nhắn nào.<br/>Hãy gửi lời chào nhé!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg: any) => (
                      <div key={msg.id} className={cn("flex flex-col max-w-[75%]", msg.sender_id === user.id ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                          "px-5 py-3 rounded-[24px] font-bold text-sm shadow-sm",
                          msg.sender_id === user.id ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white text-text-main border border-violet-100 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-violet-400 font-bold mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-white border-t-2 border-violet-50">
                  <div className="flex items-center gap-3 bg-violet-50 p-2 rounded-[24px] border-2 border-violet-100 focus-within:border-violet-500 transition-all">
                    <input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Gửi tin nhắn..."
                      className="flex-1 bg-transparent px-4 py-2 outline-none font-bold text-text-main placeholder:text-violet-300"
                    />
                    <button onClick={sendMessage} className="w-12 h-12 bg-violet-600 text-white flex items-center justify-center rounded-[18px] hover:bg-violet-700 shadow-md transition-all active:scale-95">
                      <Send size={20} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
