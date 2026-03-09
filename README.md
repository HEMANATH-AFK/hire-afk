# 🚀 Hire AFK: AI-Powered Career Automation

**Hire AFK** is a high-end, premium career platform designed to bridge the gap between students and recruiters through automation and AI-driven intelligence. It doesn't just list jobs; it actively helps students apply, prepare, and succeed—completely "Away From Keyboard."

---

## ✨ Core Features

### 🤖 1. AI Auto-Apply Engine
- **Intelligent Extraction**: Students upload their PDF resumes once. The system uses advanced parsing to extract technical skills and professional summaries.
- **Smart Matcher**: Automatically matches students with jobs based on skill overlap and match scores.
- **AFK Applications**: Once a profile is complete, the system can automatically submit applications to high-matching roles without user intervention.

### 🧪 2. AI Interview Prep Lab
- **Contextual Simulations**: Generates unique technical and behavioral interview questions based on the specific job description you applied for.
- **AI Feedback Agent**: Provides real-time scoring and constructive feedback on every response, helping you refine your pitch before the real interview.
- **Performance Analytics**: Visualizes your readiness with a percentage-based match score and detailed insights.

### 📊 3. Premium Dashboards
- **Student Dashboard**: A "Glassmorphism" styled command center for tracking application statuses, match scores, and practicing interviews.
- **Recruiter Center**: Streamlined job management, applicant tracking, and candidate quality analysis.
- **Admin Panel**: Global oversight of system health, user verification, and security reporting.

### 🛡️ 4. Safety & Trust
- **Recruiter Reporting**: Students can report suspicious job posters directly from their dashboard to maintain a clean ecosystem.
- **Secure Authentication**: Robust JWT-based security with role-based access control (RBAC).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5.x |
| **Database** | MongoDB + Mongoose |
| **Parsing** | PDF-Parse (Resume Skill Extraction) |
| **Security** | JWT, BcryptJS |

---

## 🚀 Getting Started (From Scratch)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas URI)
- **NPM** (Installed with Node)

### 2. Physical Installation

Clone the repository and install dependencies for both the frontend and backend:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the **`server`** directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hire-afk
JWT_SECRET=your_super_secret_key_123
NODE_ENV=development
```

### 4. Running the Application

You need two terminal windows open to run the full stack:

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

## 🎯 How It Works: The Flow

1. **Onboarding**: A student signs up and uploads their resume.
2. **Analysis**: The backend extracts keywords (React, Node, etc.) and populates the skill list automatically.
3. **Exploration**: Students can manualy search for jobs in the **Job Explorer**.
4. **Automation**: The "Auto-Apply" logic checks for jobs where the skill match score is high and submits the profile.
5. **Preparation**: Once an application is "Pending" or "Accepted," the student enters the **AI Interview Prep Lab** to practice for that specific role.
6. **Success**: Student receives real-time feedback, scores, and readiness analysis to ace the actual hiring process.

---


