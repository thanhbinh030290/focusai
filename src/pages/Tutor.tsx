import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, BookOpen, GraduationCap, ChevronRight, Image as ImageIcon, Paperclip, X } from 'lucide-react';
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    const currentImage = imageBase64?.split(',')[1]; // Remove prefix
    
    setInput('');
    setImageBase64(null);
    setLoading(true);

    try {
      const response = await getTutorResponse(currentInput, messages, currentImage);
      const botMessage: Message = { 
        role: 'model', 
        parts: [{ text: response.text || "Xin lỗi, mình gặp chút trục trặc. Bạn thử lại nhé!" }] 
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
          <h1 className="text-3xl text-text-main flex items-center gap-3">
            <Bot className="text-primary" size={32} />
            AI Tutor
          </h1>
          <p className="text-text-muted">Understand the universe.</p>
        </div>

      </div>

      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col relative">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center primary-glow">
                <Bot className="text-primary" size={40} />
              </div>
              <div>
                <h3 className="text-xl text-text-main mb-2">Bắt đầu buổi học thôi!</h3>
                <p className="text-text-muted text-sm">FocusAI có thể giải bài tập qua hình ảnh, tóm tắt kiến thức hoặc thảo luận về vũ trụ.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ${
                msg.role === 'user' ? 'bg-primary' : 'bg-bg-card border border-primary/30'
              }`}>
                {msg.role === 'user' ? (
                  <User size={20} className="text-white" />
                ) : (
                  <Bot size={20} className="text-primary" />
                )}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary/10 text-text-main border border-primary/20' 
                  : 'bg-primary/5 text-text-main border border-border-subtle'
              }`}>
                <div className="markdown-body">
                  <Markdown>{msg.parts[0].text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-bg-card border-t border-border-subtle">
          {imageBase64 && (
            <div className="mb-4 relative inline-block">
              <img src={imageBase64} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-primary" />
              <button 
                onClick={() => setImageBase64(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              <ImageIcon size={24} />
            </button>
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Nhập câu hỏi hoặc tải ảnh bài tập..."
              className="flex-1 bg-bg-main border border-border-subtle rounded-2xl py-4 pl-6 pr-16 focus:border-primary outline-none resize-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading || (!input.trim() && !imageBase64)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary rounded-xl flex items-center justify-center transition-all primary-glow"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

