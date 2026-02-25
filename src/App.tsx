import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Trophy, 
  User, 
  LogOut, 
  Flame, 
  Star,
  Settings,
  Clock,
  ChevronRight,
  Menu,
  X,
  ShoppingBag,
  UserCircle,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Pages
import Dashboard from './pages/Dashboard';
import Tutor from './pages/Tutor';
import Quiz from './pages/Quiz';
import Achievements from './pages/Achievements';
import ParentalView from './pages/ParentalView';
import Auth from './pages/Auth';
import Shop from './pages/Shop';
import Profile from './pages/Profile';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUser(null);
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-bg-main text-primary">Loading FocusAI...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-bg-main text-text-main selection:bg-primary/30">
        <AnimatePresence mode="wait">
          {!user ? (
            <Routes>
              <Route path="/auth" element={<Auth onLogin={setUser} />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          ) : (
            <div className="flex h-screen overflow-hidden">
              <Sidebar onLogout={handleLogout} user={user} />
              <main className="flex-1 overflow-y-auto relative">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} setUser={setUser} />} />
                    <Route path="/tutor" element={<Tutor user={user} />} />
                    <Route path="/quiz" element={<Quiz user={user} setUser={setUser} />} />
                    <Route path="/achievements" element={<Achievements user={user} />} />
                    <Route path="/shop" element={<Shop user={user} setUser={setUser} />} />
                    <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                    <Route path="/parental" element={<ParentalView user={user} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <MobileNav />
              </main>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

function Sidebar({ onLogout, user }: { onLogout: () => void, user: any }) {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'AI Tutor', path: '/tutor' },
    { icon: BookOpen, label: 'Quizzes', path: '/quiz' },
    { icon: ShoppingBag, label: 'FocusAI Shop', path: '/shop' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: User, label: 'Parental View', path: '/parental' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-card border-r border-border-subtle p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center primary-glow overflow-hidden">
          <img 
            src="Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" 
            alt="FocusAI Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-main">FocusAI</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-text-muted hover:text-text-main hover:bg-primary/5"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-transform group-hover:scale-110",
              location.pathname === item.path && "text-primary"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/30">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-text-main truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">Level {user.level || 1} Student</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();
  const navItems = [
    { icon: LayoutDashboard, path: '/' },
    { icon: MessageSquare, path: '/tutor' },
    { icon: BookOpen, path: '/quiz' },
    { icon: ShoppingBag, path: '/shop' },
    { icon: UserCircle, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card/80 backdrop-blur-lg border-t border-border-subtle px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "p-2 rounded-xl transition-all",
            location.pathname === item.path ? "text-primary bg-primary/10" : "text-text-muted"
          )}
        >
          <item.icon size={24} />
        </Link>
      ))}
    </nav>
  );
}

