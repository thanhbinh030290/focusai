import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, BookOpen, GraduationCap, Image as ImageIcon, X, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import { getTutorStream } from '../services/geminiService';

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

  const firstName = user?.name ? user.name.split(' ').pop() : 'Linh';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input || "Phân tích ảnh này giúp mình." }] };
    const aiPlaceholder: Message = { role: 'model', parts: [{ text: '' }] };
    
    setMessages(prev => [...prev, userMessage, aiPlaceholder]);
    
    const currentInput = input;
    const currentImage = imageBase64?.split(',')[1];
    const history = messages;

    setInput(''); 
    setImageBase64(null); 
    setLoading(true);

    try {
      await getTutorStream(currentInput, history, currentImage, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.parts[0].text += chunk;
          }
          return newMessages;
        });
        setLoading(false);
      });
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'model' && !lastMsg.parts[0].text) {
          lastMsg.parts[0].text = `Xin lỗi ${firstName}, đang bị lỗi mạng. Thử lại nhé!`;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-violet-100 shadow-xl">
            <img src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" alt="FocusAI Robot" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tight flex items-center gap-3">Gia sư FocusAI <Sparkles className="text-yellow-500 animate-pulse" /></h1>
            <p className="text-text-muted font-bold italic text-lg">Học tập thông minh hơn cùng AI, {firstName} nhé!</p>
          </div>
        </div>
        <div className="glass px-5 py-2.5 rounded-2xl border-violet-100 bg-violet-50 flex items-center gap-3 shadow-sm">
          <GraduationCap className="text-violet-600" size={24} />
          <span className="text-sm font-black text-violet-600 uppercase tracking-widest">Phản hồi tức thì</span>
        </div>
      </div>

      <div className="flex-1 glass rounded-[45px] overflow-hidden flex flex-col relative border-violet-100 shadow-2xl bg-white/60 backdrop-blur-xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-8 py-12">
              <div className="w-32 h-32 rounded-[40px] bg-violet-100 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white">
                <img src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" alt="Robot" className="w-full h-full object-cover drop-shadow-xl" />
              </div>
              <h3 className="text-3xl font-black text-text-main">Chào {firstName}! 👋 Mình đã sẵn sàng.</h3>
              <p className="text-text-muted text-xl font-bold italic leading-relaxed">Gửi câu hỏi hoặc chụp ảnh bài tập cho mình ngay nào!</p>
              <div className="grid grid-cols-2 gap-6 w-full pt-6">
                <div onClick={() => setInput("Giải bài tập này giúp mình...")} className="p-6 bg-white rounded-3xl border-2 border-violet-50 text-left hover:border-violet-300 transition-all cursor-pointer shadow-sm group">
                  <BookOpen className="text-violet-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <p className="font-black text-text-main">Giải bài tập</p>
                </div>
                <div onClick={() => setInput("Tóm tắt kiến thức phần...")} className="p-6 bg-white rounded-3xl border-2 border-violet-50 text-left hover:border-violet-300 transition-all cursor-pointer shadow-sm group">
                  <Zap className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <p className="font-black text-text-main">Tóm tắt kiến thức</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg ${msg.role === 'user' ? 'bg-violet-600' : 'bg-white border-2 border-violet-100'}`}>
                {msg.role === 'user' ? <User size={24} className="text-white" /> : <img src="/Images/Gemini_Generated_Image_lmzhbclmzhbclmzh.png" className="w-full h-full object-cover" />}
              </div>
              <div className={`max-w-[85%] p-6 rounded-[35px] shadow-md relative ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none font-bold' : 'bg-white text-text-main border border-violet-100 rounded-tl-none font-bold'}`}>
                <div className="markdown-body"><Markdown>{msg.parts[0].text}</Markdown></div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-5 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-violet-100" />
              <div className="bg-violet-50 p-6 rounded-[35px] rounded-tl-none border-2 border-violet-100 flex gap-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"/>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"/>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]"/>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-violet-100 backdrop-blur-md">
          {imageBase64 && (
            <div className="mb-4 relative inline-block">
              <img src={imageBase64} className="h-24 w-24 object-cover rounded-2xl border-4 border-violet-200" />
              <button onClick={() => setImageBase64(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl hover:scale-110 transition-all"><X size={16} /></button>
            </div>
          )}
          <div className="relative flex items-center gap-3 bg-violet-50 p-2 rounded-[30px] border-2 border-violet-100 focus-within:border-violet-400 transition-all shadow-inner">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-4 text-violet-400 hover:text-violet-600 hover:bg-white rounded-2xl transition-all shadow-sm"><ImageIcon size={28} /></button>
            <textarea 
              rows={1} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} 
              placeholder={`Hỏi ${firstName} về bài tập nhé...`} 
              className="flex-1 bg-transparent py-4 pl-4 pr-16 font-black text-lg outline-none resize-none placeholder:text-violet-300" 
            />
            <button onClick={handleSend} disabled={loading || (!input.trim() && !imageBase64)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95">
              <Send size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
