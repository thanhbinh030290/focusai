import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Sparkles, GraduationCap, Image as ImageIcon, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { getTutorStream } from '../services/geminiService';

export default function Tutor({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstName = user?.name ? user.name.split(' ').pop() : 'Linh';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;
    const userMsg = { role: 'user', parts: [{ text: input || "Phân tích ảnh này." }] };
    const aiPlaceholder = { role: 'model', parts: [{ text: '' }] };
    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    
    const currentInput = input;
    const currentImage = imageBase64?.split(',')[1];
    setInput(''); setImageBase64(null); setLoading(true);

    try {
      await getTutorStream(currentInput, messages, currentImage, (chunk) => {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].parts[0].text += chunk;
          return newMsgs;
        });
        setLoading(false);
      });
    } catch (e) { setLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-text-main flex items-center gap-3">Gia sư FocusAI <Sparkles className="text-yellow-500" /></h1>
        <div className="glass px-4 py-2 rounded-2xl bg-violet-50 flex items-center gap-2">
           <GraduationCap className="text-violet-600" /> <span className="font-black text-violet-600">PHẢN HỒI SIÊU TỐC</span>
        </div>
      </div>

      <div className="flex-1 glass rounded-[45px] overflow-hidden flex flex-col bg-white/60 shadow-2xl border-4 border-violet-50">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-[35px] bg-violet-100 flex items-center justify-center"><Bot size={48} className="text-violet-600"/></div>
              <h3 className="text-3xl font-black">Chào {firstName}! Gửi bài tập cho mình nhé.</h3>
            </div>
          )}
          {messages.map((msg, i) => msg.parts[0].text && (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white border'}`}>
                {msg.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
              </div>
              <div className={`max-w-[80%] p-5 rounded-[25px] font-bold shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                <Markdown>{msg.parts[0].text}</Markdown>
              </div>
            </div>
          ))}
          {loading && <div className="flex gap-2 p-4 bg-violet-50 rounded-2xl w-fit animate-pulse"><div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"/></div>}
        </div>

        <div className="p-8 bg-white border-t-4 border-violet-50">
          <div className="relative flex items-center gap-3 bg-violet-50 p-2 rounded-[30px] border-2 border-violet-100">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder={`Hỏi ${firstName} bất cứ điều gì...`} className="flex-1 bg-transparent py-4 pl-6 pr-16 font-black text-lg outline-none resize-none" />
            <button onClick={handleSend} className="absolute right-4 bg-violet-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"><Send size={24}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
