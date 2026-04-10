const express = require("express");
const Database = require("./db-mock");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Enable CORS with detailed options
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ---------- ROOT ROUTE ----------
app.get("/", (req, res) => {
  res.json({
    message: "🏥 Health Tracker Backend API",
    apiVersion: "1.0",
    status: "✅ Running",
    info: "This is the BACKEND server. Don't open this in browser!",
    instructions: "Open http://localhost:5000 in your browser instead",
    availableEndpoints: {
      GET: ["/test", "/profile/:user_id", "/health/:user_id", "/alerts/:user_id", "/trends/:user_id/:type"],
      POST: ["/user", "/profile", "/health"]
    }
  });
});

// ---------- TEST ENDPOINT ----------
app.get("/test", (req, res) => {
  res.json({ status: "✅ Backend is working!", timestamp: new Date() });
});

// ---------- DB SETUP ----------
let db;

try {
  db = new Database("./health.db");
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  
  console.log("✅ Database connected successfully");
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER
    );

    CREATE TABLE IF NOT EXISTS health_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      conditions TEXT,
      bp_threshold INTEGER DEFAULT 140,
      sugar_threshold INTEGER DEFAULT 180,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      value INTEGER,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      message TEXT,
      severity TEXT,
      requires_doctor_visit BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("✅ Database tables initialized");
  
} catch (err) {
  console.error("❌ Failed to initialize database:", err.message);
  process.exit(1);
}

// ---------- ADD USER ----------
app.post("/user", (req, res) => {
  try {
    const { name, age } = req.body;
    
    // Validate inputs
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!age || age < 0 || age > 150) {
      return res.status(400).json({ error: "Valid age is required (0-150)" });
    }

    const stmt = db.prepare("INSERT INTO users (name, age) VALUES (?, ?)");
    const result = stmt.run(name.trim(), parseInt(age));
    
    console.log(`✅ User created: ID ${result.lastInsertRowid} - ${name}`);
    res.json({ id: result.lastInsertRowid, name, age });
  } catch (error) {
    console.error("❌ Unexpected error in /user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- SET HEALTH PROFILE ----------
app.post("/profile", (req, res) => {
  try {
    const { user_id, conditions, bp_threshold, sugar_threshold, email } = req.body;

    // Validate required fields
    if (!user_id) {
      console.log(`❌ Profile error: Missing user_id`);
      return res.status(400).json({ error: "user_id is required" });
    }

    if (!email) {
      console.log(`❌ Profile error: Missing email for user ${user_id}`);
      return res.status(400).json({ error: "Email is required for health alerts" });
    }

    console.log(`📝 Setting profile for user ${user_id} with email ${email}`);

    // First check if user exists
    const userStmt = db.prepare("SELECT id FROM users WHERE id = ?");
    const user = userStmt.get(user_id);

    if (!user) {
      console.log(`❌ User ${user_id} not found`);
      return res.status(404).json({ error: `User ID ${user_id} does not exist. Please create user first.` });
    }

    // Now insert or update profile
    const profileStmt = db.prepare(`
      INSERT OR REPLACE INTO health_profiles 
      (user_id, conditions, bp_threshold, sugar_threshold, email) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    profileStmt.run(
      user_id, 
      conditions || "none", 
      bp_threshold || 140, 
      sugar_threshold || 180, 
      email
    );

    console.log(`✅ Profile set for user ${user_id}`);
    res.json({ 
      user_id, 
      conditions: conditions || "none", 
      bp_threshold: bp_threshold || 140, 
      sugar_threshold: sugar_threshold || 180,
      email,
      message: "✅ Health profile updated successfully"
    });
  } catch (error) {
    console.error("❌ Error in /profile:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------- GET HEALTH PROFILE ----------
app.get("/profile/:user_id", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM health_profiles WHERE user_id = ?");
    const row = stmt.get(req.params.user_id);
    res.json(row || { message: "No profile found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- ADD HEALTH ----------
app.post("/health", (req, res) => {
  try {
    const { user_id, type, value } = req.body;
    
    // Validate inputs
    if (!user_id || user_id < 1) {
      return res.status(400).json({ error: "Valid user_id is required" });
    }
    if (!type || !["bp", "sugar"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'bp' or 'sugar'" });
    }
    if (value === undefined || value === null || value < 0 || value > 999) {
      return res.status(400).json({ error: "Valid value is required (0-999)" });
    }

    const stmt = db.prepare("INSERT INTO health_records (user_id, type, value) VALUES (?, ?, ?)");
    stmt.run(parseInt(user_id), type.toLowerCase(), parseInt(value));

    console.log(`✅ Health recorded: User ${user_id}, ${type}=${value}`);
    checkAndCreateAlert(user_id, type, value, res);
  } catch (error) {
    console.error("❌ Unexpected error in /health:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- ALERT LOGIC ----------
function checkAndCreateAlert(user_id, type, value, res) {
  try {
    // Get user's health profile for personalized thresholds
    const profileStmt = db.prepare("SELECT * FROM health_profiles WHERE user_id = ?");
    const profile = profileStmt.get(user_id);

    const thresholds = {
      bp: profile?.bp_threshold || 140,
      sugar: profile?.sugar_threshold || 180
    };

    const risk = checkRisk(type, value, thresholds);

    if (risk) {
      const { message, severity } = generateMessage(type, value, thresholds);

      const alertStmt = db.prepare(`
        INSERT INTO alerts (user_id, type, message, severity, requires_doctor_visit) 
        VALUES (?, ?, ?, ?, 1)
      `);
      
      alertStmt.run(user_id, type, message, severity);
      
      console.log(`✅ Alert created for user ${user_id}: ${severity.toUpperCase()}`);
      
      // Send email if email is configured
      if (profile?.email) {
        sendEmailAlert(profile.email, type, value, message, severity);
      }
      
      return res.json({ 
        alert: message, 
        severity, 
        requires_doctor_visit: true 
      });
    } else {
      res.json({ alert: "No alert" });
    }
  } catch (error) {
    console.error("❌ Unexpected error in checkAndCreateAlert:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

function checkRisk(type, value, thresholds) {
  if (type === "bp" && value > thresholds.bp) return true;
  if (type === "sugar" && value > thresholds.sugar) return true;
  return false;
}

function generateMessage(type, value, thresholds) {
  if (type === "bp") {
    const severity = value > thresholds.bp + 20 ? "critical" : "warning";
    return {
      message: `⚠️ High BP Detected: ${value} mmHg (Threshold: ${thresholds.bp}). Please visit a doctor.`,
      severity
    };
  }
  if (type === "sugar") {
    const severity = value > thresholds.sugar + 50 ? "critical" : "warning";
    return {
      message: `⚠️ High Blood Sugar: ${value} mg/dL (Threshold: ${thresholds.sugar}). Please visit a doctor.`,
      severity
    };
  }
  return { message: "Health alert", severity: "warning" };
}

// ---------- GET ALERTS ----------
app.get("/alerts/:user_id", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC");
    const rows = stmt.all(req.params.user_id);
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- GET HEALTH RECORDS ----------
app.get("/health/:user_id", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10");
    const rows = stmt.all(req.params.user_id);
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- GET HEALTH TRENDS (Last 7 Days) ----------
app.get("/trends/:user_id/:type", (req, res) => {
  try {
    const { user_id, type } = req.params;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedDate = sevenDaysAgo.toISOString().split('T')[0];

    const stmt = db.prepare(`
      SELECT value, recorded_at FROM health_records 
      WHERE user_id = ? AND type = ? AND DATE(recorded_at) >= ? 
      ORDER BY recorded_at ASC
    `);
    
    const data = stmt.all(user_id, type, formattedDate) || [];
    const avg = data.length > 0 ? Math.round(data.reduce((sum, r) => sum + r.value, 0) / data.length) : 0;
    
    console.log(`✅ Trends retrieved: ${data.length} records for user ${user_id}, type ${type}`);
    
    res.json({ 
      type,
      records: data,
      average: avg,
      count: data.length
    });
  } catch (error) {
    console.log(`❌ Trends query error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------- EMAIL ALERT FUNCTION ----------
function sendEmailAlert(email, type, value, message, severity) {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables.`);
    return;
  }

  console.log(`📧 Attempting to send email to ${email}...`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Health Tracker <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🚨 URGENT: Health Alert - ${type.toUpperCase()} Reading`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 28px;">⚠️ HEALTH ALERT</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Action Required</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your health reading <strong>${type.toUpperCase()}: ${value}</strong> has exceeded your safe threshold.
          </p>
          <div style="background: ${severity === 'critical' ? '#ffe0e0' : '#fff3cd'}; border-left: 4px solid ${severity === 'critical' ? '#dc3545' : '#ffc107'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: ${severity === 'critical' ? '#721c24' : '#856404'}; font-weight: bold;">
              ${severity.toUpperCase() === 'CRITICAL' ? '🚨 CRITICAL' : '⚠️ WARNING'}: ${message}
            </p>
          </div>
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            <strong>Recommended Action:</strong> Please consult a doctor as soon as possible. Do not ignore this alert.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated alert from Health Tracker. Keep monitoring your health regularly.
          </p>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`❌ Email FAILED for ${email}`);
      console.log(`   Error: ${err.message}`);
      console.log(`   Check: EMAIL_USER="${process.env.EMAIL_USER}"`);
    } else {
      console.log(`✅ Email SENT to ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
    }
  });
}

// Request timeout middleware (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🏥 Health Tracker Backend Server");
  console.log(`📍 Running on port ${PORT}`);
  console.log("🔌 CORS enabled for all origins");
  console.log("📊 Database: ./health.db");
  console.log("=".repeat(50));
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\n🛑 Shutting down gracefully...");
  
  server.close(() => {
    console.log("✅ Server closed");
  });
  
  if (db) {
    try {
      db.close();
      console.log("✅ Database closed");
    } catch (err) {
      console.error("❌ Error closing database:", err.message);
    }
  }
  
  process.exit(0);
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGHUP", gracefulShutdown);

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  console.error("❌ CRITICAL - Uncaught Exception:", err.message);
  console.error(err.stack);
  gracefulShutdown();
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ CRITICAL - Unhandled Rejection:", reason);
  gracefulShutdown();
});