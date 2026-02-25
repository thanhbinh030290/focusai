import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const db = new Database("focusai.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_check_in TEXT,
    level INTEGER DEFAULT 1,
    selected_character_id INTEGER DEFAULT 1,
    selected_vehicle_id INTEGER DEFAULT 1,
    total_quizzes_answered INTEGER DEFAULT 0,
    max_correct_streak INTEGER DEFAULT 0,
    rename_count INTEGER DEFAULT 0,
    avatar_url TEXT,
    auto_win_tokens INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'emotion', 'screentime', 'quiz'
    value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    emotion TEXT,
    screentime INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    achievement_id TEXT,
    title TEXT,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item_type TEXT, -- 'character', 'skin'
    item_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial character for new users
const seedInventory = (userId: number) => {
  const exists = db.prepare("SELECT * FROM inventory WHERE user_id = ? AND item_id = 1").get(userId);
  if (!exists) {
    db.prepare("INSERT INTO inventory (user_id, item_type, item_id) VALUES (?, 'character', 1)").run(userId);
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

// AI Psychology Endpoint
app.post('/api/ai/psychology', async (req, res) => {
  const { message, screentime } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một chuyên gia tâm lý học chuyên về mảng giảm thời gian sử dụng mạng xã hội. 
      Người dùng hiện đang sử dụng mạng xã hội khoảng ${screentime} phút mỗi ngày.
      Hãy phân tích nguyên nhân tâm lý (như FOMO, dopamine loop, escapism) và đề xuất các giải pháp khoa học (như digital detox, habit stacking, mindfulness).
      Hãy trả lời một cách sâu sắc, đồng cảm và mang tính chuyên môn cao.
      Câu hỏi của người dùng: ${message}`,
    });
    res.json({ text: response.text });
  } catch (e) {
    res.status(500).json({ error: 'AI failed' });
  }
});

  // Mock Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password, name } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name || email.split('@')[0]);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      seedInventory(user.id);
    }
    
    res.json({ user });
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    const inventory = db.prepare("SELECT * FROM inventory WHERE user_id = ?").all(req.params.id);
    res.json({ user, inventory });
  });

  app.post("/api/user/:id/rename", (req, res) => {
    const { newName } = req.body;
    const userId = req.params.id;
    const user = db.prepare("SELECT rename_count, points FROM users WHERE id = ?").get(userId) as any;
    
    const count = user.rename_count || 0;
    const cost = Math.min(20, (count + 1) * 2);
    
    if (user.points < cost) {
      return res.status(400).json({ error: "Không đủ điểm" });
    }
    
    db.prepare("UPDATE users SET name = ?, points = points - ?, rename_count = rename_count + 1 WHERE id = ?").run(newName, cost, userId);
    res.json({ success: true });
  });

  app.post("/api/user/:id/avatar", (req, res) => {
    const { avatarUrl } = req.body;
    db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatarUrl, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/user/:id/quiz-complete", (req, res) => {
    const { count, points, correctStreak, correctCount } = req.body;
    const userId = req.params.id;
    
    const user = db.prepare("SELECT total_quizzes_answered, max_correct_streak, auto_win_tokens FROM users WHERE id = ?").get(userId) as any;
    const newTotal = (user.total_quizzes_answered || 0) + count;
    const newMaxStreak = Math.max(user.max_correct_streak || 0, correctStreak || 0);
    
    // Auto-win tokens: 1 for every 5 correct answers in session
    const newTokens = (user.auto_win_tokens || 0) + Math.floor((correctCount || 0) / 5);

    db.prepare("UPDATE users SET points = points + ?, total_quizzes_answered = ?, max_correct_streak = ?, auto_win_tokens = ? WHERE id = ?")
      .run(points, newTotal, newMaxStreak, newTokens, userId);
    
    // First quiz achievement
    if ((user.total_quizzes_answered || 0) === 0 && count > 0) {
      db.prepare("INSERT INTO achievements (user_id, achievement_id, title, description) VALUES (?, ?, ?, ?)").run(
        userId,
        'first_quiz',
        'Người mới bắt đầu',
        'Hoàn thành Quiz đầu tiên'
      );
    }

    // Check for milestones
    const milestones = [5, 10, 25, 50, 100, 150];
    milestones.forEach(m => {
      if (newTotal >= m && (user.total_quizzes_answered || 0) < m) {
        db.prepare("INSERT INTO achievements (user_id, achievement_id, title, description) VALUES (?, ?, ?, ?)").run(
          userId, 
          `quiz_${m}`,
          `Quiz Master ${m}`, 
          `Đã trả lời đúng ${m} câu hỏi!`
        );
      }
    });

    res.json({ success: true, pointsEarned: points, newTotal });
  });

  app.post("/api/user/:id/select-vehicle", (req, res) => {
    const { itemId } = req.body;
    db.prepare("UPDATE users SET selected_vehicle_id = ? WHERE id = ?").run(itemId, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/user/:id/buy", (req, res) => {
    const { itemId, price, type } = req.body;
    const userId = req.params.id;
    
    const user = db.prepare("SELECT points FROM users WHERE id = ?").get(userId) as any;
    if (user.points >= price) {
      db.prepare("UPDATE users SET points = points - ? WHERE id = ?").run(price, userId);
      db.prepare("INSERT INTO inventory (user_id, item_type, item_id) VALUES (?, ?, ?)").run(userId, type, itemId);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Không đủ điểm" });
    }
  });

  app.post("/api/user/:id/select-character", (req, res) => {
    const { itemId } = req.body;
    const userId = req.params.id;
    db.prepare("UPDATE users SET selected_character_id = ? WHERE id = ?").run(itemId, userId);
    res.json({ success: true });
  });

  app.post("/api/user/:id/checkin", (req, res) => {
    const { emotion } = req.body;
    const userId = req.params.id;
    const today = new Date().toISOString().split('T')[0];
    
    const user = db.prepare("SELECT last_check_in, streak FROM users WHERE id = ?").get(userId) as any;
    
    let newStreak = user.streak;
    if (user.last_check_in !== today) {
      // Check if yesterday was the last check in
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (user.last_check_in === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      
      db.prepare("UPDATE users SET last_check_in = ?, streak = ?, points = points + 10 WHERE id = ?").run(today, newStreak, userId);
      db.prepare("INSERT INTO logs (user_id, type, value) VALUES (?, 'emotion', ?)").run(userId, emotion);
      
      res.json({ success: true, newStreak, pointsEarned: 10 });
    } else {
      res.json({ success: false, message: "Already checked in today" });
    }
  });

  app.post("/api/user/:id/log-screentime", (req, res) => {
    const { minutes } = req.body;
    const userId = req.params.id;
    db.prepare("INSERT INTO logs (user_id, type, value) VALUES (?, 'screentime', ?)").run(userId, minutes.toString());
    // Reward for logging
    db.prepare("UPDATE users SET points = points + 5 WHERE id = ?").run(userId);
    res.json({ success: true, pointsEarned: 5 });
  });

  app.get("/api/user/:id/stats", (req, res) => {
    const userId = req.params.id;
    const logs = db.prepare("SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20").all(userId);
    const achievements = db.prepare("SELECT * FROM achievements WHERE user_id = ? ORDER BY timestamp DESC").all(userId);
    res.json({ logs, achievements });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Social & Public Profiles
app.get('/api/users/search', (req, res) => {
  const { q, userId } = req.query;
  const users = db.prepare('SELECT id, name, avatar_url, level FROM users WHERE name LIKE ? AND id != ? LIMIT 10').all(`%${q}%`, userId);
  res.json({ users });
});

app.get('/api/users/suggestions', (req, res) => {
  const { userId } = req.query;
  const users = db.prepare('SELECT id, name, avatar_url, level FROM users WHERE id != ? ORDER BY RANDOM() LIMIT 5').all(userId);
  res.json({ users });
});

app.get('/api/user/:id/public', (req, res) => {
  const user = db.prepare('SELECT id, name, avatar_url, level, points, total_quizzes_answered, max_correct_streak, selected_character_id, selected_vehicle_id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const inventory = db.prepare('SELECT item_id, type FROM inventory WHERE user_id = ?').all(req.params.id);
  const achievements = db.prepare('SELECT achievement_id FROM achievements WHERE user_id = ?').all(req.params.id);
  const logs = db.prepare('SELECT type, value, timestamp FROM logs WHERE user_id = ? AND type = "screentime"').all(req.params.id);

  res.json({ user, inventory, achievements, logs });
});

app.post('/api/friends/add', (req, res) => {
  const { userId, friendId } = req.body;
  const existing = db.prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(userId, friendId, friendId, userId);
  if (existing) return res.status(400).json({ error: 'Already friends or pending' });
  
  db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")').run(userId, friendId);
  res.json({ success: true });
});

app.get('/api/friends/:userId', (req, res) => {
  const friends = db.prepare(`
    SELECT u.id, u.name, u.avatar_url, u.level, f.status 
    FROM friends f 
    JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id) 
    WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ? AND f.status = 'accepted'
  `).all(req.params.userId, req.params.userId, req.params.userId);
  res.json({ friends });
});

// Diary Endpoints
app.post('/api/diary', (req, res) => {
  const { userId, content, emotion, screentime } = req.body;
  db.prepare('INSERT INTO diary (user_id, content, emotion, screentime) VALUES (?, ?, ?, ?)').run(userId, content, emotion, screentime);
  res.json({ success: true });
});

app.get('/api/diary/:userId', (req, res) => {
  const entries = db.prepare('SELECT * FROM diary WHERE user_id = ? ORDER BY timestamp DESC').all(req.params.userId);
  res.json({ entries });
});

app.put('/api/diary/:id', (req, res) => {
  const { content, emotion } = req.body;
  db.prepare('UPDATE diary SET content = ?, emotion = ? WHERE id = ?').run(content, emotion, req.params.id);
  res.json({ success: true });
});

// Messaging Endpoints
app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, content } = req.body;
  db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run(senderId, receiverId, content);
  res.json({ success: true });
});

app.get('/api/messages/:userId/:friendId', (req, res) => {
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `).all(req.params.userId, req.params.friendId, req.params.friendId, req.params.userId);
  res.json({ messages });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
