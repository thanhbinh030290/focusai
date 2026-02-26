import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, Trophy, ArrowRight, RefreshCw, HelpCircle, Play, Coins, Zap, Star, Flame, Sparkles, Rocket } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const CHARACTERS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  emoji: ['👨‍🎓', '👩‍🎓', '🧑‍🚀', '🧙‍♂️', '🧛‍♂️', '🥷', '👨‍🔬', '👩‍🎨', '🤖', '👾'][i % 10]
}));

const VEHICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  emoji: ['🚀', '🛸', '🛰️', '✈️', '🚁', '🏎️', '🏍️', '🛸', '🚀', '🛸'][i % 10]
}));

export default function Quiz({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [level, setLevel] = useState('Trung học cơ sở');
  const [category, setCategory] = useState('Khoa học tự nhiên');
  const [subject, setSubject] = useState('Toán học');
  const [difficulty, setDifficulty] = useState('Trung bình');
  const [quizType, setQuizType] = useState('Trắc nghiệm');
  const [grade, setGrade] = useState('6');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'lobby' | 'running' | 'quiz' | 'result' | 'transition'>('lobby');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Quiz UI state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const playerPosRef = useRef({ lane: 1, x: 0, targetX: 0 }); // 0, 1, 2
  const obstaclesRef = useRef<any[]>([]);
  const coinsRef = useRef<any[]>([]);
  const speedRef = useRef(5);
  const starsRef = useRef<any[]>([]);
  const planetsRef = useRef<any[]>([]);

  // Use refs for values needed in the game loop to avoid closure issues
  const gameStateRef = useRef(gameState);
  const currentIdxRef = useRef(currentIdx);
  const userRef = useRef(user);
  const quizzesRef = useRef(quizzes);

  useEffect(() => {
    gameStateRef.current = gameState;
    currentIdxRef.current = currentIdx;
    userRef.current = user;
    quizzesRef.current = quizzes;
  }, [gameState, currentIdx, user, quizzes]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const data = await generateQuiz(subject, grade);
      const newQuizzes = data.quizzes || [];
      setQuizzes(newQuizzes);
      quizzesRef.current = newQuizzes;
      
      setGameState('running');
      gameStateRef.current = 'running';
      
      setSessionCorrectCount(0);
      setMaxStreak(0);
      setCurrentStreak(0);
      setCurrentIdx(0);
      currentIdxRef.current = 0;
      
      resetRunner();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetRunner = () => {
    startTimeRef.current = Date.now();
    obstaclesRef.current = [];
    coinsRef.current = [];
    speedRef.current = 5 + (currentIdxRef.current * 0.5);
    playerPosRef.current = { lane: 1, x: 0, targetX: 0 };
    
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * 600,
          y: Math.random() * 400,
          size: Math.random() * 1.5,
          speed: Math.random() * 1 + 0.5
        });
      }
      for (let i = 0; i < 3; i++) {
        planetsRef.current.push({
          x: Math.random() * 600,
          y: Math.random() * 400,
          size: Math.random() * 40 + 20,
          color: ['#4a90e2', '#f5a623', '#7ed321', '#d0021b'][i % 4],
          speed: 0.2
        });
      }
    }
  };

  useEffect(() => {
    if (gameState === 'running') {
      gameLoopRef.current = requestAnimationFrame(loop);
      window.addEventListener('keydown', handleKeyDown);
    } else {
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  const loop = () => {
    if (gameStateRef.current !== 'running') return;
    updateGame();
    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && playerPosRef.current.lane > 0) {
      playerPosRef.current.lane -= 1;
    } else if (e.key === 'ArrowRight' && playerPosRef.current.lane < 2) {
      playerPosRef.current.lane += 1;
    }
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Loop continues via 'loop' function calling requestAnimationFrame
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const laneWidth = width / 3;

    // Background: Space
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = '#ffffff';
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > height) star.y = 0;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Planets
    planetsRef.current.forEach(planet => {
      planet.y += planet.speed;
      if (planet.y > height + planet.size) {
        planet.y = -planet.size;
        planet.x = Math.random() * width;
      }
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();
      // Planet ring or detail
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, planet.size * 1.5, planet.size * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Lanes (Star Wars style)
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * laneWidth, 0);
      ctx.lineTo(i * laneWidth, height);
      ctx.stroke();
    }

    // Update Player X
    playerPosRef.current.targetX = playerPosRef.current.lane * laneWidth + laneWidth / 2;
    playerPosRef.current.x += (playerPosRef.current.targetX - playerPosRef.current.x) * 0.2;

    // Draw Player (Vehicle)
    const vehicle = VEHICLES.find(v => v.id === userRef.current.selected_vehicle_id) || VEHICLES[0];
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vehicle.emoji, playerPosRef.current.x, height - 60);

    // Scaling difficulty based on currentIdx - Reduced density by 50%
    const spawnRate = Math.max(0.005, (0.03 - (currentIdxRef.current * 0.001)) * 0.5);
    const starRate = Math.min(0.05, (0.05 + (currentIdxRef.current * 0.005)) * 0.5);

    // Spawn Obstacles (Enemy Ships / Aliens)
    if (Math.random() < spawnRate) {
      const pattern = Math.random();
      // Alien (👾) spawn rate reduced by 80% (original alien patterns were 0.3 + 0.2 = 0.5, now 0.1)
      if (pattern < 0.06) {
        obstaclesRef.current.push({ lane: Math.floor(Math.random() * 3), y: -50, emoji: '👾' });
      } else if (pattern < 0.1) {
        obstaclesRef.current.push({ lane: 0, y: -50, emoji: '👾' });
        obstaclesRef.current.push({ lane: 1, y: -50, emoji: '👾' });
      } else if (pattern < 0.55) {
        obstaclesRef.current.push({ lane: 0, y: -50, emoji: '🛸' });
        obstaclesRef.current.push({ lane: 2, y: -50, emoji: '🛸' });
      } else {
        obstaclesRef.current.push({ lane: 1, y: -50, emoji: '🛸' });
        obstaclesRef.current.push({ lane: 2, y: -50, emoji: '🛸' });
      }
    }

    // Spawn Stars (Points)
    if (Math.random() < starRate) {
      coinsRef.current.push({
        lane: Math.floor(Math.random() * 3),
        y: -50
      });
    }

    // Update & Draw Obstacles
    obstaclesRef.current.forEach((obs, idx) => {
      obs.y += speedRef.current;
      const obsX = obs.lane * laneWidth + laneWidth / 2;
      ctx.font = '60px serif'; // Double size
      ctx.fillText(obs.emoji, obsX, obs.y);

      // Collision
      if (
        Math.abs(obsX - playerPosRef.current.x) < 40 &&
        Math.abs(obs.y - (height - 60)) < 40
      ) {
        if (obs.emoji === '👾') {
          // Alien collision -> Game Over
          setGameState('result');
          gameStateRef.current = 'result';
          finishQuiz();
        } else {
          // Ship collision -> +2 Points
          setPointsCollected(prev => prev + 2);
          obstaclesRef.current.splice(idx, 1);
        }
      }
    });

    // Update & Draw Stars (Points)
    ctx.fillStyle = '#a855f7'; // Purple star
    coinsRef.current.forEach((coin, idx) => {
      coin.y += speedRef.current;
      const coinX = coin.lane * laneWidth + laneWidth / 2;
      
      // Draw a star shape
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * 15 + coinX,
                   -Math.sin((18 + i * 72) / 180 * Math.PI) * 15 + coin.y);
        ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * 7 + coinX,
                   -Math.sin((54 + i * 72) / 180 * Math.PI) * 7 + coin.y);
      }
      ctx.closePath();
      ctx.fill();

      // Collection -> +1 Point
      if (
        Math.abs(coinX - playerPosRef.current.x) < 30 &&
        Math.abs(coin.y - (height - 60)) < 30
      ) {
        setPointsCollected(prev => prev + 1);
        coinsRef.current.splice(idx, 1);
      }
    });

    // Cleanup
    obstaclesRef.current = obstaclesRef.current.filter(o => o.y < height + 50);
    coinsRef.current = coinsRef.current.filter(c => c.y < height + 50);

    // Timer check: 30 seconds run
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    if (elapsed >= 30) {
      // Add 0.5s delay before showing quiz
      setTimeout(() => {
        setGameState('quiz');
        gameStateRef.current = 'quiz';
      }, 500);
      // Stop loop temporarily to avoid multiple triggers
      gameStateRef.current = 'transition';
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const correct = idx === quizzes[currentIdx % quizzes.length].correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
      setSessionCorrectCount(prev => prev + 1);
      setCurrentStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setCurrentStreak(0);
    }
  };

  const handleAutoWin = () => {
    if (user.auto_win_tokens <= 0 || selectedOption !== null) return;
    
    // Consume token locally
    setUser((prev: any) => ({ ...prev, auto_win_tokens: prev.auto_win_tokens - 1 }));
    
    // Select correct option
    handleOptionSelect(quizzes[currentIdx % quizzes.length].correctIndex);
  };

  const nextQuestion = async () => {
    if (currentIdx + 1 < questionCount) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setGameState('running');
      resetRunner();
    } else {
      finishQuiz();
    }
  };

  const [showReward, setShowReward] = useState(false);

  const finishQuiz = async () => {
    setGameState('result');
    setShowReward(true);
    const pointsEarned = (score * 20) + pointsCollected; // Direct conversion
    try {
      await fetch(`/api/user/${user.id}/quiz-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          count: questionCount, 
          points: pointsEarned,
          correctStreak: maxStreak,
          correctCount: sessionCorrectCount
        }),
      });
      const userRes = await fetch(`/api/user/${user.id}`);
      const userData = await userRes.json();
      setUser(userData.user);
      localStorage.setItem('nexus_user', JSON.stringify(userData.user));
    } catch (e) {}
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-text-main flex items-center gap-3">
            <Zap className="text-primary" size={32} />
            FocusAI Space Runner
          </h1>
          <p className="text-text-muted">Vượt qua thử thách vũ trụ!</p>
        </div>
        {gameState === 'quiz' && user.auto_win_tokens > 0 && (
          <button 
            onClick={handleAutoWin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 primary-glow transition-all"
          >
            <Star size={20} className="fill-white" />
            Auto Win ({user.auto_win_tokens})
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (() => {
          const LEVELS: any = {
            'Trung học cơ sở': {
              grades: ['6', '7', '8', '9'],
              categories: {
                'Khoa học tự nhiên': ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học'],
                'Khoa học xã hội': ['Ngữ văn', 'Lịch sử', 'Địa lý'],
                'Ngoại ngữ': ['Tiếng Anh']
              }
            },
            'Trung học phổ thông': {
              grades: ['10', '11', '12'],
              categories: {
                'Khoa học tự nhiên': ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học'],
                'Khoa học xã hội': ['Ngữ văn', 'Lịch sử', 'Địa lý'],
                'Ngoại ngữ': ['Tiếng Anh']
              }
            },
            'Đại học': {
              grades: ['Đại học'],
              categories: {
                'Khoa học tự nhiên': ['Toán cao cấp', 'Vật lý đại cương', 'Hóa đại cương'],
                'Khoa học xã hội': ['Triết học', 'Xã hội học', 'Tâm lý học'],
                'Pháp luật': ['Luật dân sự', 'Luật hình sự', 'Luật kinh tế'],
                'Truyền thông': ['Báo chí', 'Marketing', 'PR'],
                'Kinh tế': ['Kinh tế vĩ mô', 'Kinh tế vi mô', 'Tài chính', 'Kế toán']
              }
            }
          };

          const handleLevelChange = (newLevel: string) => {
            setLevel(newLevel);
            const newGrades = LEVELS[newLevel].grades;
            setGrade(newGrades[0]);
            const newCategories = Object.keys(LEVELS[newLevel].categories);
            setCategory(newCategories[0]);
            setSubject(LEVELS[newLevel].categories[newCategories[0]][0]);
          };

          const handleCategoryChange = (newCategory: string) => {
            setCategory(newCategory);
            setSubject(LEVELS[level].categories[newCategory][0]);
          };

          return (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-10 rounded-3xl text-center space-y-8"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Rocket className="text-primary" size={40} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Cấp độ</label>
                  <select 
                    value={level}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {Object.keys(LEVELS).map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Khối lớp</label>
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {LEVELS[level].grades.map((g: string) => (
                      <option key={g} value={g}>{g === 'Đại học' ? g : `Lớp ${g}`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Lĩnh vực</label>
                  <select 
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {Object.keys(LEVELS[level].categories).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Môn học</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {LEVELS[level].categories[category].map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Loại câu hỏi</label>
                  <select 
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {["Trắc nghiệm", "Điền từ", "Đúng/Sai"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Mức độ</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  >
                    {["Dễ", "Trung bình", "Khó"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase">Số câu hỏi</label>
                  <input 
                    type="number" 
                    min="1" max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-left">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <HelpCircle size={16} /> Hướng dẫn chơi:
                  </h4>
                  <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
                    <li>Sử dụng phím mũi tên <b>Trái/Phải</b> để di chuyển tàu bay.</li>
                    <li>Tránh các tàu địch và quái vật ngoài hành tinh.</li>
                    <li>Thu thập đồng xu vàng để nhận thêm điểm.</li>
                    <li>Mỗi 5 câu trả lời đúng sẽ nhận được 1 <b>Auto Win</b> token.</li>
                  </ul>
                </div>

                <button 
                  onClick={startQuiz}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-12 py-4 rounded-2xl transition-all primary-glow-strong text-lg flex items-center gap-2 mx-auto"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Play />}
                  {loading ? 'Đang chuẩn bị...' : 'Bắt đầu bay'}
                </button>
              </div>
            </motion.div>
          );
        })()}

        {gameState === 'running' && (
          <motion.div 
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                <span className="font-bold text-text-main">{pointsCollected}</span>
              </div>
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                <span className="font-bold text-text-main">Chuỗi: {currentStreak}</span>
              </div>
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                <Zap className="text-primary" size={20} />
                <span className="font-bold text-text-main">Câu {currentIdx + 1}/{questionCount}</span>
              </div>
            </div>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={400} 
              className="w-full h-[500px] bg-black rounded-3xl border border-primary/20 shadow-2xl mx-auto"
            />
          </motion.div>
        )}

        {gameState === 'quiz' && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-start p-4 bg-[#f8f7ff] overflow-y-auto"
          >
            <div className="w-full max-w-2xl space-y-6 py-8">
              {/* Minimalist Progress */}
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Câu {currentIdx + 1} / {questionCount}</span>
                <div className="flex gap-1">
                  {Array.from({ length: questionCount }).map((_, i) => (
                    <div key={i} className={cn("h-1 w-4 rounded-full transition-all", i <= currentIdx ? "bg-primary" : "bg-primary/10")} />
                  ))}
                </div>
              </div>

              {/* Question - iOS Style */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-primary/5">
                <h3 className="text-xl md:text-2xl text-text-main font-semibold leading-tight text-center">
                  {quizzes[currentIdx % quizzes.length]?.question}
                </h3>
              </div>

              {/* Options Grid - Minimalist */}
              <div className="grid grid-cols-1 gap-3">
                {quizzes[currentIdx % quizzes.length]?.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={cn(
                      "p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group relative overflow-hidden",
                      selectedOption === null 
                        ? "bg-white border-primary/5 hover:border-primary/20" 
                        : idx === quizzes[currentIdx % quizzes.length].correctIndex
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : selectedOption === idx
                            ? "bg-red-50 border-red-500 text-red-700"
                            : "bg-white border-primary/5 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      selectedOption === null ? "bg-primary/5 text-primary" : "bg-white/20 text-current"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-base font-medium">{option}</span>
                  </button>
                ))}
              </div>

              {selectedOption !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 p-6 rounded-[24px] border border-primary/10 space-y-3"
                >
                  <p className="text-sm text-primary/80 leading-relaxed font-medium">{quizzes[currentIdx % quizzes.length].explanation}</p>
                  <button 
                    onClick={nextQuestion}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {currentIdx + 1 === questionCount ? 'Xem kết quả' : 'Tiếp tục'}
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-12 rounded-3xl text-center space-y-8"
          >
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto primary-glow-strong">
              <Trophy className="text-white" size={48} />
            </div>
            <div>
              <h2 className="text-4xl text-text-main mb-2 font-bold">Nhiệm vụ hoàn thành!</h2>
              <p className="text-text-muted">Bạn đã chinh phục môn {subject}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase font-bold mb-1">Đúng</p>
                <p className="text-3xl font-display font-bold text-emerald-500">{score}/{questionCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase font-bold mb-1">Chuỗi cao nhất</p>
                <p className="text-3xl font-display font-bold text-orange-500">{maxStreak}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase font-bold mb-1">Điểm ăn được</p>
                <p className="text-3xl font-display font-bold text-yellow-500">{pointsCollected}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase font-bold mb-1">Tổng điểm</p>
                <p className="text-3xl font-display font-bold text-primary">+{ (score * 20) + pointsCollected }</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => setGameState('lobby')}
                className="bg-bg-main hover:bg-primary/5 border border-border-subtle text-text-main font-bold px-8 py-3 rounded-xl transition-all"
              >
                Về sảnh chờ
              </button>
              <button 
                onClick={startQuiz}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all primary-glow"
              >
                Bay lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-400" />
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="text-primary" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-text-main">Tuyệt vời!</h3>
                <p className="text-text-muted">Bạn đã hoàn thành xuất sắc nhiệm vụ. Hãy tiếp tục duy trì phong độ nhé!</p>
              </div>
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Điểm nhận được</p>
                <p className="text-4xl font-bold text-primary">+{ (score * 20) + pointsCollected }</p>
              </div>
              <button 
                onClick={() => setShowReward(false)}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Nhận thưởng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
