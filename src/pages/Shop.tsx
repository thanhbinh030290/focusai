import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Check, Lock, User, Sparkles, Rocket, Car } from 'lucide-react';

const CHARACTERS = [
  { id: 1, name: 'Học giả Tập trung', price: 0, emoji: '👨‍🎓', color: '#a855f7' },
  { id: 2, name: 'Phi hành gia', price: 100, emoji: '🧑‍🚀', color: '#3b82f6' },
  { id: 3, name: 'Pháp sư Tri thức', price: 200, emoji: '🧙‍♂️', color: '#8b5cf6' },
  { id: 4, name: 'Ninja Kỷ luật', price: 300, emoji: '🥷', color: '#1f2937' },
  { id: 5, name: 'Robot Thông minh', price: 400, emoji: '🤖', color: '#94a3b8' },
  { id: 6, name: 'Người ngoài hành tinh', price: 500, emoji: '👽', color: '#22c55e' },
  { id: 7, name: 'Siêu anh hùng', price: 600, emoji: '🦸‍♂️', color: '#ef4444' },
  { id: 8, name: 'Thám tử', price: 700, emoji: '🕵️‍♂️', color: '#4b5563' },
  { id: 9, name: 'Nhà khoa học', price: 800, emoji: '👨‍🔬', color: '#06b6d4' },
  { id: 10, name: 'Nghệ sĩ', price: 900, emoji: '👩‍🎨', color: '#ec4899' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 11,
    name: `Nhân vật cao cấp ${i + 1}`,
    price: (i + 11) * 100,
    color: `hsl(${(i * 137.5 + 100) % 360}, 70%, 60%)`,
    emoji: ['🧛‍♂️', '🧟‍♂️', '🧞‍♂️', '🧜‍♂️', '🧚‍♂️', '👼', '🤴', '👸', '🤶', '🎅'][i % 10]
  }))
];

const VEHICLES = [
  { id: 1, name: 'Tàu khởi đầu', price: 0, emoji: '🚀', color: '#a855f7' },
  { id: 2, name: 'Đĩa bay UFO', price: 150, emoji: '🛸', color: '#3b82f6' },
  { id: 3, name: 'Vệ tinh quan sát', price: 300, emoji: '🛰️', color: '#8b5cf6' },
  { id: 4, name: 'Máy bay phản lực', price: 450, emoji: '✈️', color: '#1f2937' },
  { id: 5, name: 'Trực thăng tương lai', price: 600, emoji: '🚁', color: '#94a3b8' },
  { id: 6, name: 'Xe đua thiên hà', price: 750, emoji: '🏎️', color: '#22c55e' },
  { id: 7, name: 'Mô tô ánh sáng', price: 900, emoji: '🏍️', color: '#ef4444' },
  { id: 8, name: 'Thuyền không gian', price: 1050, emoji: '🚤', color: '#4b5563' },
  { id: 9, name: 'Rồng máy', price: 1200, emoji: '🐲', color: '#06b6d4' },
  { id: 10, name: 'Phượng hoàng lửa', price: 1350, emoji: '🔥', color: '#ec4899' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 11,
    name: `Tàu chiến hạng nặng ${i + 1}`,
    price: (i + 11) * 150,
    color: `hsl(${(i * 137.5 + 200) % 360}, 70%, 60%)`,
    emoji: ['🚢', '🚜', '🚛', '🚌', '🚒', '🚓', '🚕', '🚗', '🚲', '🛴'][i % 10]
  }))
];

export default function Shop({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'vehicles'>('characters');

  useEffect(() => {
    fetchUser();
  }, [user.id]);

  const fetchUser = async () => {
    const res = await fetch(`/api/user/${user.id}`);
    const data = await res.json();
    setInventory(data.inventory || []);
  };

  const handleBuy = async (item: any, type: string) => {
    if (user.points < item.price) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${user.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, price: item.price, type }),
      });
      if (res.ok) {
        const userRes = await fetch(`/api/user/${user.id}`);
        const data = await userRes.json();
        setUser(data.user);
        setInventory(data.inventory);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (itemId: number, type: string) => {
    const endpoint = type === 'character' ? 'select-character' : 'select-vehicle';
    try {
      await fetch(`/api/user/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const userRes = await fetch(`/api/user/${user.id}`);
      const data = await userRes.json();
      setUser(data.user);
    } catch (e) {}
  };

  const isOwned = (id: number, type: string) => inventory.some(item => item.item_id === id && item.type === type);

  const items = activeTab === 'characters' ? CHARACTERS : VEHICLES;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl text-text-main flex items-center gap-3">
            <ShoppingBag className="text-primary" size={32} />
            Cửa hàng FocusAI
          </h1>
          <p className="text-text-muted">Dùng điểm tích lũy để đổi nhân vật và tàu bay mới.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-primary/20">
          <Star className="text-primary fill-primary" size={24} />
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Số dư</p>
            <p className="text-xl font-display font-bold text-text-main">{user.points} pts</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border-subtle">
        <button 
          onClick={() => setActiveTab('characters')}
          className={cn(
            "pb-4 px-4 font-bold transition-all border-b-2",
            activeTab === 'characters' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-main"
          )}
        >
          Nhân vật
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          className={cn(
            "pb-4 px-4 font-bold transition-all border-b-2",
            activeTab === 'vehicles' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-main"
          )}
        >
          Tàu bay
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item) => {
          const type = activeTab === 'characters' ? 'character' : 'vehicle';
          const owned = isOwned(item.id, type);
          const selected = type === 'character' ? user.selected_character_id === item.id : user.selected_vehicle_id === item.id;
          const canAfford = user.points >= item.price;

          return (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              className={cn(
                "glass p-4 rounded-3xl flex flex-col items-center gap-4 transition-all",
                selected ? "border-primary ring-2 ring-primary/20" : "border-border-subtle"
              )}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
                style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}40` }}
              >
                {item.emoji}
              </div>
              
              <div className="text-center">
                <p className="text-sm font-bold text-text-main">{item.name}</p>
                {!owned && (
                  <p className="text-xs font-display font-bold text-primary">{item.price} pts</p>
                )}
              </div>

              {owned ? (
                <button 
                  onClick={() => handleSelect(item.id, type)}
                  disabled={selected}
                  className={cn(
                    "w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1",
                    selected ? "bg-primary/10 text-primary" : "bg-primary text-white hover:bg-primary-dark"
                  )}
                >
                  {selected ? <Check size={14} /> : null}
                  {selected ? 'Đang chọn' : 'Chọn'}
                </button>
              ) : (
                <button 
                  onClick={() => handleBuy(item, type)}
                  disabled={!canAfford || loading}
                  className={cn(
                    "w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1",
                    canAfford ? "bg-text-main text-white hover:bg-black" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {!canAfford && <Lock size={12} />}
                  Mua ngay
                </button>
              )}
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
