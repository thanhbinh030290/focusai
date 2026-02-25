import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserCircle, Star, Clock, BookOpen, Trophy, Calendar, CheckCircle2, Flame, Edit2, Camera, Rocket, Search, Users, UserPlus, Plus, MessageCircle, Send } from 'lucide-react';

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

  useEffect(() => {
    fetchSuggestions();
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const res = await fetch(`/api/friends/${user.id}`);
    const data = await res.json();
    setFriends(data.friends);
  };

  const fetchMessages = async (friendId: number) => {
    const res = await fetch(`/api/messages/${user.id}/${friendId}`);
    const data = await res.json();
    setChatMessages(data.messages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !viewingUser) return;
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
  };

  const fetchSuggestions = async () => {
    const res = await fetch(`/api/users/suggestions?userId=${user.id}`);
    const data = await res.json();
    setSuggestions(data.users);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/users/search?q=${q}&userId=${user.id}`);
    const data = await res.json();
    setSearchResults(data.users);
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
    const res = await fetch(`/api/user/${user.id}`);
    const data = await res.json();
    setInventory(data.inventory || []);
    
    const statsRes = await fetch(`/api/user/${user.id}/stats`);
    const statsData = await statsRes.json();
    setStats(statsData);
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

  const screentimeLogs = stats.logs.filter((l: any) => l.type === 'screentime');
  
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

  const screentimeStats = timeMilestones.map(m => {
    const count = screentimeLogs.filter((l: any) => {
      const val = parseInt(l.value);
      if (m.value === 999) return val > 420;
      if (m.value === 15) return val <= 15;
      const idx = timeMilestones.indexOf(m);
      const prevVal = timeMilestones[idx-1].value;
      return val > prevVal && val <= m.value;
    }).length;
    return { ...m, count };
  });

  const selectedChar = CHARACTERS.find(c => c.id === user.selected_character_id);
  const renameCost = Math.min(20, (user.rename_count + 1) * 2);

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      {/* Facebook Style Header */}
      <div className="bg-white rounded-b-3xl shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-purple-400/20 relative">
          <img 
            src="https://picsum.photos/seed/cover/1200/400" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-black/5 shadow-sm">
            <Camera size={14} /> Chỉnh sửa ảnh bìa
          </button>
        </div>

        {/* Profile Info Bar */}
        <div className="px-4 md:px-8 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-bg-main shadow-xl overflow-hidden flex items-center justify-center text-7xl relative group">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center relative">
                    <img 
                      src="https://picsum.photos/seed/character/400/400" 
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg">
                      {selectedChar?.emoji || '👤'}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsUpdatingAvatar(true)}
                className="absolute bottom-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 text-text-main rounded-full shadow-md border border-black/5 transition-all"
              >
                <Camera size={20} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold text-text-main">{user.name}</h1>
                <button onClick={() => setIsRenaming(true)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                  <Edit2 size={16} />
                </button>
              </div>
              <p className="text-text-muted font-medium mt-1">{friends.length} bạn bè • Cấp độ {user.level}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {friends.slice(0, 5).map(f => (
                  <img key={f.id} src={f.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-2 first:ml-0" />
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                <Plus size={18} /> Thêm vào tin
              </button>
              <button className="bg-gray-100 text-text-main px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                <Edit2 size={18} /> Chỉnh sửa trang cá nhân
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sidebar: Intro & Friends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intro Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-text-main">Giới thiệu</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-text-main">
                <Star className="text-yellow-500" size={20} />
                <span>Sở hữu <b>{user.points}</b> điểm tích lũy</span>
              </div>
              <div className="flex items-center gap-3 text-text-main">
                <Flame className="text-orange-500" size={20} />
                <span>Chuỗi học tập <b>{user.streak}</b> ngày</span>
              </div>
              <div className="flex items-center gap-3 text-text-main">
                <Trophy className="text-primary" size={20} />
                <span>Chuỗi Quiz đúng <b>{user.max_correct_streak}</b> câu</span>
              </div>
              <div className="flex items-center gap-3 text-text-main">
                <Clock className="text-blue-500" size={20} />
                <span>Tham gia từ {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Friends Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-text-main">Bạn bè</h3>
                <p className="text-sm text-text-muted">{friends.length} người bạn</p>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {friends.map(f => (
                <div key={f.id} className="space-y-1 cursor-pointer group" onClick={() => viewPublicProfile(f.id)}>
                  <img src={f.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`} className="w-full aspect-square object-cover rounded-lg group-hover:opacity-80 transition-opacity" />
                  <p className="text-xs font-bold text-text-main truncate">{f.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Suggestions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-text-main">Tìm kiếm bạn mới</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm bạn bè..."
                className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              {(searchResults.length > 0 ? searchResults : suggestions).slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewPublicProfile(u.id)}>
                    <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-10 h-10 rounded-full bg-primary/10" />
                    <span className="text-sm font-bold text-text-main">{u.name}</span>
                  </div>
                  <button onClick={() => addFriend(u.id)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <UserPlus size={16} className="text-primary" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Main Content: Stats & Collection */}
          <div className="lg:col-span-3 space-y-6">
            {/* Achievement Stats Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-text-main mb-6">Thống kê thành tích</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Tổng điểm</p>
                  <p className="text-2xl font-bold text-primary">{user.points}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Cấp độ</p>
                  <p className="text-2xl font-bold text-primary">{user.level}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Thành tựu</p>
                  <p className="text-2xl font-bold text-primary">{stats.achievements.length}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Chuỗi ngày</p>
                  <p className="text-2xl font-bold text-primary">{user.streak}</p>
                </div>
              </div>
            </div>

            {/* Screentime Timeline - Weekly/Monthly View */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-main">Thời gian sử dụng MXH</h3>
                <div className="flex gap-2">
                  <button className="text-xs font-bold px-3 py-1 bg-primary text-white rounded-full">Tuần</button>
                  <button className="text-xs font-bold px-3 py-1 bg-gray-100 text-text-muted rounded-full">Tháng</button>
                </div>
              </div>
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {[45, 30, 60, 20, 90, 15, 40].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        h > 60 ? "bg-red-400" : h > 30 ? "bg-yellow-400" : "bg-emerald-400"
                      )}
                    />
                    <span className="text-[10px] font-bold text-text-muted">T{i+2}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Grid - With Car Images */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-main">Bộ sưu tập xe & nhân vật</h3>
                <Link to="/shop" className="text-primary text-sm font-bold hover:underline">Cửa hàng</Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {inventory.map((item: any) => {
                  const isVehicle = item.type === 'vehicle';
                  const itemData = isVehicle ? VEHICLES.find(v => v.id === item.item_id) : CHARACTERS.find(c => c.id === item.item_id);
                  return (
                    <div key={`${item.type}-${item.item_id}`} className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-all">
                      <img 
                        src={isVehicle ? `https://picsum.photos/seed/car-${item.item_id}/200/200` : `https://picsum.photos/seed/char-${item.item_id}/200/200`}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl drop-shadow-md">{itemData?.emoji}</span>
                        <span className="text-[10px] font-bold text-text-main bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {itemData?.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isRenaming && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-8 rounded-3xl max-w-md w-full space-y-6">
              <h3 className="text-xl font-bold text-text-main">Đổi tên nhân vật</h3>
              <div className="space-y-4">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary" />
                <p className="text-xs text-text-muted">Chi phí: <span className="text-primary font-bold">{renameCost} pts</span></p>
                <div className="flex gap-4">
                  <button onClick={handleRename} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Lưu</button>
                  <button onClick={() => setIsRenaming(false)} className="flex-1 bg-gray-100 text-text-muted py-3 rounded-xl font-bold">Hủy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isUpdatingAvatar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-8 rounded-3xl max-w-md w-full space-y-6">
              <h3 className="text-xl font-bold text-text-main">Cập nhật ảnh đại diện</h3>
              <div className="space-y-4">
                <input value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} placeholder="URL ảnh..." className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary" />
                <div className="flex gap-4">
                  <button onClick={handleAvatarUpdate} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Cập nhật</button>
                  <button onClick={() => setIsUpdatingAvatar(false)} className="flex-1 bg-gray-100 text-text-muted py-3 rounded-xl font-bold">Hủy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] max-w-4xl w-full h-[90vh] flex shadow-2xl overflow-hidden relative">
              <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 text-text-muted hover:text-text-main z-10"><Plus className="rotate-45" size={24} /></button>
              
              {/* Left: User Info */}
              <div className="w-1/2 p-8 border-r overflow-y-auto space-y-8">
                <div className="text-center space-y-4">
                  <img src={viewingUser.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.user.name}`} className="w-24 h-24 rounded-full mx-auto bg-primary/10 border-4 border-white shadow-xl" />
                  <h3 className="text-2xl font-bold text-text-main">{viewingUser.user.name}</h3>
                  <p className="text-text-muted">Cấp độ {viewingUser.user.level} • {viewingUser.user.points} điểm</p>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => addFriend(viewingUser.user.id)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                      <UserPlus size={18} /> Kết bạn
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/5 rounded-2xl text-center">
                    <p className="text-xs text-text-muted uppercase font-bold">Quizzes</p>
                    <p className="text-xl font-bold text-primary">{viewingUser.user.total_quizzes_answered}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl text-center">
                    <p className="text-xs text-text-muted uppercase font-bold">Chuỗi</p>
                    <p className="text-xl font-bold text-primary">{viewingUser.user.max_correct_streak}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl text-center">
                    <p className="text-xs text-text-muted uppercase font-bold">Thành tựu</p>
                    <p className="text-xl font-bold text-primary">{viewingUser.achievements.length}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-text-main">Bộ sưu tập</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {viewingUser.inventory.map((item: any) => (
                      <div key={`${item.type}-${item.item_id}`} className="aspect-square bg-primary/5 rounded-xl flex items-center justify-center text-xl border border-primary/10">
                        {item.type === 'character' ? CHARACTERS.find(c => c.id === item.item_id)?.emoji : VEHICLES.find(v => v.id === item.item_id)?.emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Messages */}
              <div className="w-1/2 flex flex-col bg-gray-50">
                <div className="p-6 border-b bg-white flex items-center gap-3">
                  <MessageCircle className="text-primary" size={20} />
                  <h4 className="font-bold text-text-main">Trò chuyện</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.sender_id === user.id ? "ml-auto items-end" : "mr-auto items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-sm",
                        msg.sender_id === user.id ? "bg-primary text-white rounded-tr-none" : "bg-white text-text-main rounded-tl-none shadow-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-text-muted mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-white border-t">
                  <div className="flex gap-2">
                    <input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-primary/20"
                    />
                    <button 
                      onClick={sendMessage}
                      className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
