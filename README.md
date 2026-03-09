# 🚀 Hire AFK: AI-Powered Career Automation

**Hire AFK** is a high-end, premium career platform designed to bridge the gap between students and recruiters through automation and AI-driven intelligence. It doesn't just list jobs; it actively helps students apply, prepare, and succeed—completely "Away From Keyboard."

---

## ✨ Core Features

### 🤖 Auto-Apply Engine
Upload your resume once and the system extracts your skills.  
It automatically matches you with relevant jobs and can apply to high-matching roles for you.

### 🧪 Interview Prep
Practice interviews based on the job you applied for.  
Get instant feedback, scoring, and insights to improve your answers.

### 📊 Role-Based Dashboards
- **Student Dashboard:** Track applications, match scores, and interview practice.  
- **Recruiter Dashboard:** Post jobs and manage applicants.  
- **Admin Panel:** Monitor users, system activity, and platform security.

### 🛡️ Security & Trust
JWT-based authentication with role access control.  
Students can report suspicious recruiters to keep the platform safe.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5.x |
| **Database** | MongoDB + Mongoose |
| **Parsing** | PDF-Parse (Resume Skill Extraction) |
| **Security** | JWT, BcryptJS |

---

### 3. Environment Configuration

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hire-afk
JWT_SECRET=your_super_secret_key_123
NODE_ENV=development
```

### 4. Running the Application

**Terminal 1: Backend Server**
```bash
cd server
node index.js
```
*Server will be live on `http://localhost:5000`*

**Terminal 2: Frontend Client**
```bash
cd client
npm run dev
```
*Client will be live on `http://localhost:5173`*

---

## 🏗️ Project Structure

```text
hire-afk/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Layouts)
│   │   ├── pages/          # Full Page Views (Dashboard, Interview Lab, etc.)
│   │   ├── context/        # Global State (AuthContext)
│   │   └── App.jsx         # Routing & Entry
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas (Job, User, Interview)
│   ├── routes/             # API Endpoints
│   ├── controllers/        # Business Logic & AI Simulations
│   ├── middleware/        # JWT & Role Checking
│   └── index.js            # Main Server Entry
```

---


