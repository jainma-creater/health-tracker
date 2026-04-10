# 🏥 Health Tracker

### Personalized Health Monitoring with AI Alerts for Doctor Visits

A smart health tracking application that monitors blood pressure and blood sugar levels, sends email alerts when thresholds are exceeded, and provides 7-day trend analysis to help users make informed health decisions.

---

## ✨ Key Features

- **👤 Personalized Profiles** - Set custom health thresholds based on your needs
- **📊 Health Tracking** - Log blood pressure and blood sugar readings
- **🚨 Intelligent Alerts** - Get email alerts when readings exceed safe thresholds
- **📈 Trend Analysis** - View 7-day health trends with interactive charts
- **⚕️ Doctor Visit Alerts** - Clear guidance on when to see a doctor (warning/critical)
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
cd backend
npm install

cd ../frontend
# No install needed - pure HTML/CSS/JS
```

### Running Locally

**Terminal 1 - Backend (port 3000):**
```bash
cd backend
$env:EMAIL_USER="jainma004@gmail.com"
$env:EMAIL_PASS="dfih bvkp ojbn fkoh"
node server.js
```

**Terminal 2 - Frontend (port 5000):**
```bash
cd frontend
live-server --port=5000 --no-browser
```

Then open: http://localhost:5000

---

## 🌐 Cloud Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

**Quick options:**
- **Replit** (5 min, free) - Perfect for demos
- **Railway** (10 min, $5/month) - Production quality
- **Azure** (15 min, free tier) - Enterprise grade

---

## 📋 How It Works

### 5-Step Workflow

1. **Create Your Profile** - Enter name and age
2. **Set Health Thresholds** - Define your safe limits + email
3. **Log Health Readings** - Record daily measurements
4. **View Alerts** - See doctor visit recommendations
5. **Track Trends** - Visualize 7-day patterns with charts

### Technology Stack

**Backend:**
- Node.js + Express.js
- SQLite3 Database
- Nodemailer (Gmail integration)
- CORS enabled

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Chart.js for visualizations
- Responsive design with media queries
- Real-time error handling

---

## 📊 Database Schema

```
Users (id, name, age)
Health Profiles (user_id, email, bp_threshold, sugar_threshold)
Health Records (user_id, type, value, recorded_at)
Alerts (user_id, type, message, severity, requires_doctor_visit)
```

---

## 🔐 Security & Privacy

- ✅ Input validation on all endpoints
- ✅ Error handling with meaningful messages
- ✅ CORS configured for safe origin access
- ✅ Email credentials via environment variables
- ✅ Database auto-creation with proper schema

---

## 📮 Email Alerts

When a reading exceeds the user's threshold:

1. **Warning Alert** - For slight overages
   - Message: Please monitor and consider visiting doctor
   - Example: BP 150/90 when threshold is 140

2. **Critical Alert** - For significant overages
   - Message: URGENT - Please visit a doctor immediately
   - Example: BP 165/100 when threshold is 140

**Features:**
- Beautiful HTML email format
- Color-coded by severity
- Includes reading details
- Doctor visit recommendation

---

## 🎯 Use Cases

**For Individuals:**
- Track daily health metrics
- Get automated alerts
- Spot health trends

**For Healthcare Providers:**
- Monitor patient compliance
- Get alerts for concerning readings
- Evidence-based data

**For Startups:**
- MVP for health tech company
- Proof of concept for investors
- Foundation for scaling

---

## 📈 Future Roadmap

- 🔄 User authentication & dashboard
- 📱 Mobile app (React Native)
- 🔍 Advanced analytics & reporting
- 🏥 Integration with EHR systems
- 🤖 AI-powered health recommendations
- 🔐 HIPAA compliance
- 📊 Data export (CSV/PDF)
- 👥 Family health sharing

---

## 🚨 Demo Data

To test, create a user:
```
Name: John Doe
Age: 45
```

Then set thresholds:
```
BP Alert: 140 mmHg (normal)
Sugar Alert: 180 mg/dL (normal)
Email: your.email@gmail.com
```

Log a reading above threshold to see alerts!

---

## 📞 Support

For issues or questions:
1. Check [DIAGNOSTIC.md](DIAGNOSTIC.md) for troubleshooting
2. Review [DEPLOY.md](DEPLOY.md) for deployment help
3. Check browser console (F12) for error messages

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 👨‍💻 Author

Created by jainma-creater

---

## 🌟 Show Your Support

If you find this useful, please:
- ⭐ Star this repo
- 🔗 Share with others
- 💬 Give feedback
- 🠜 Contribute improvements

---

**Made with ❤️ for health tracking**

*Keep monitoring. Keep healthy. Keep living better.*
