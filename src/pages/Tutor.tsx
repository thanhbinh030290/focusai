import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, BookOpen, GraduationCap, Image as ImageIcon, X, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import { getTutorResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function Tutor({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC TRÍCH XUẤT TÊN NGƯỜI DÙNG ---
  const firstName = user?.name ? user.name.split(' ').pop() : 'Linh';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      parts: [{ text: input || (imageBase64 ? "Hãy phân tích hình ảnh này giúp mình." : "") }] 
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = imageBase64?.split(',')[1];
    
    setInput('');
    setImageBase64(null);
    setLoading(true);

    try {
      const response = await getTutorResponse(currentInput, messages, currentImage);
      const botMessage: Message = { 
        role: 'model', 
        parts: [{ text: response.text || `Xin lỗi ${firstName}, mình gặp chút trục trặc. Thử lại nhé!` }] 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-main flex items-center gap-3">
            <Bot className="text-primary" size={40} />
            Gia sư FocusAI
          </h1>
          <p className="text-text-muted font-bold italic">Học tập thông minh hơn cùng AI, {firstName} nhé!</p>
        </div>
      </div>

      <div className="flex-1 glass rounded-[40px] overflow-hidden flex flex-col relative border-primary/10 shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8">
              <div className="w-24 h-24 rounded-[35px] bg-primary/10 flex items-center justify-center primary-glow">
                <Bot className="text-primary" size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-text-main mb-2">Chào {firstName}! 👋</h3>
                <p className="text-text-muted text-lg">Mình đã sẵn sàng. Gửi câu hỏi hoặc tải ảnh bài tập cho mình ngay nào!</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg ${
                msg.role === 'user' ? 'bg-primary' : 'bg-bg-card border-2 border-primary/30'
              }`}>
                {msg.role === 'user' ? (
                  <User size={24} className="text-white" />
                ) : (
                  <Bot size={24} className="text-primary" />
                )}
              </div>
              <div className={`max-w-[85%] p-6 rounded-[35px] shadow-md ${
                msg.role === 'user' 
                  ? 'bg-primary/10 text-text-main border border-primary/20 rounded-tr-none' 
                  : 'bg-white text-text-main border border-border-subtle rounded-tl-none font-bold'
              }`}>
                <div className="markdown-body">
                  <Markdown>{msg.parts[0].text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && <div className="text-primary font-bold animate-pulse px-4 italic">FocusAI đang suy nghĩ...</div>}
        </div>

        <div className="p-8 bg-bg-card/80 border-t border-border-subtle backdrop-blur-md">
          {imageBase64 && (
            <div className="mb-4 relative inline-block">
              <img src={imageBase64} alt="Preview" className="h-24 w-24 object-cover rounded-2xl border-4 border-primary" />
              <button 
                onClick={() => setImageBase64(null)}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="relative flex items-center gap-3 bg-bg-main p-2 rounded-[30px] border-2 border-border-subtle focus-within:border-primary transition-all shadow-inner">
    {/* Input file - ẩn đi */}
    <input 
        type="file" 
        ref={fileNameRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
    />
    
    {/* Nút chọn file */}
    <button 
        onClick={() => fileNameRef.current?.click()}
        className="p-2 hover:bg-border-subtle rounded-full transition"
    >
        📷
    </button>
    
    {/* THÊM MỚI: Input để nhập tin nhắn */}
    <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Nhập câu hỏi của bạn..."
        className="flex-1 bg-transparent outline-none text-foreground px-2"
    />
    
    {/* THÊM MỚI: Nút gửi */}
    <button
        onClick={handleSendMessage}
        disabled={loading}
        className="p-2 bg-primary text-white rounded-full hover:opacity-80 transition disabled:opacity-50"
    >
        Gửi
    </button>
</div>
        </div>
      </div>
    </div>
  );
}
