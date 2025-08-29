const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize SQLite database
const db = new sqlite3.Database('./data/mooc.db');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_task INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    task_id INTEGER,
    content TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT,
    task_id INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATETIME,
    PRIMARY KEY(user_id, task_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register/login user
app.post('/api/auth/register', (req, res) => {
  const { username } = req.body;
  
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  const userId = uuidv4();
  
  db.run('INSERT INTO users (id, username) VALUES (?, ?)', [userId, username], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username, userId, lastTask: 1 });
  });
});

// Login existing user
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ 
      token, 
      username: user.username, 
      userId: user.id, 
      lastTask: user.last_task || 1 
    });
  });
});

// Get user progress
app.get('/api/user/progress', verifyToken, (req, res) => {
  db.get('SELECT username, last_task FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.all('SELECT task_id, completed FROM progress WHERE user_id = ?', [req.userId], (err, progress) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        username: user.username, 
        lastTask: user.last_task || 1, 
        progress: progress || [] 
      });
    });
  });
});

// Update last task
app.post('/api/user/last-task', verifyToken, (req, res) => {
  const { taskId } = req.body;
  
  db.run('UPDATE users SET last_task = ? WHERE id = ?', [taskId, req.userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Save text for task
app.post('/api/tasks/:taskId/text', verifyToken, (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  
  db.run(`INSERT OR REPLACE INTO texts (user_id, task_id, content, updated_at) 
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, 
         [req.userId, taskId, content], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Get text for task
app.get('/api/tasks/:taskId/text', verifyToken, (req, res) => {
  const { taskId } = req.params;
  
  db.get('SELECT content FROM texts WHERE user_id = ? AND task_id = ?', 
         [req.userId, taskId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ content: result ? result.content : '' });
  });
});

// Mark task as completed
app.post('/api/tasks/:taskId/complete', verifyToken, (req, res) => {
  const { taskId } = req.params;
  
  db.run(`INSERT OR REPLACE INTO progress (user_id, task_id, completed, completion_date) 
          VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)`, 
         [req.userId, taskId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Serve main page for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`MOOC server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});