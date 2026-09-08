# Placement Helper AI — Full-Stack Campus Placement & Tech Interview OS

**Placement Helper AI** is a modern, production-grade, full-stack AI platform designed to help college students and graduates prepare for technical, coding, aptitude, and HR placements.

---

## 🌟 The 5 Core Modules

1. **AI Placement Chatbot (Module 1)**:
   - Placement mentor trained in DSA, OS, DBMS, Networks, OOP, System Design, Aptitude, HR interview strategies, and company-specific preparation patterns (Cognizant, TCS Digital, Amazon, Google).
   - Generates personalized day-by-day sprint plans (e.g. 10-day Cognizant prep plan).
   - Multi-session chat history, markdown rendering, syntax-highlighted code blocks with 1-click copy, and quick action launch buttons.

2. **AI Resume Builder with Real PDF Output (Module 2)**:
   - Structured multi-section editor (Personal, Summary, Skills, Projects, Experience, Education, Certifications, Achievements).
   - Instant ATS score meter (0-100) with grade, strength highlights, and actionable gap analysis.
   - AI bullet point optimizer powered by Google's XYZ formula (`"Accomplished [X] as measured by [Y] by doing [Z]"`).
   - Raw info importer that extracts structured sections from pasted LinkedIn/plain text resumes.
   - 4 selectable templates (Modern Tech, Classic Executive, Minimalist ATS, Clean Engineering).
   - **True Download as PDF**: Generates crisp, print-exact A4 vector/DOM PDF files (`[Name]_Resume.pdf`) using `jspdf` and `html2canvas`.

3. **Flowchart / Roadmap Generator with Image Output (Module 3)**:
   - Generates structured visual roadmaps from goals (e.g., *"Cognizant 10-Day Sprint"*, *"Cybersecurity Engineer"*, *"3-Month SDE Mastery"*).
   - Visually represented as a clean flowchart DAG with interconnected stage nodes (Fundamentals &rarr; Linear Structures &rarr; Trees/Graphs &rarr; Dynamic Programming &rarr; CS Core &rarr; System Design &rarr; Placement Offer).
   - Interactive milestone drawer with curated subtopics, hands-on practice requirements, and recommended sheets.
   - **True Download as PNG Image**: High-resolution canvas exporter generating `[Role]_Roadmap.png`.

4. **Technical Interview & Online Coding Environment (Module 4)**:
   - LeetCode-style split interface: Problem statement, difficulty badges, company tags, constraints, examples, progressive hints, and optimal approach explanation.
   - Monaco Code Editor with syntax highlighting, autocomplete, line numbers, and language switcher.
   - **Multi-Language Sandboxed Runner**: Supports **Python 3**, **JavaScript (Node.js)**, **C++ (GCC)**, and **Java (Javac)**.
   - Test case evaluation across visible test cases, custom input, and hidden edge test cases with execution time measurement.
   - **AI Solution Analyzer**: Deep post-submission code analysis examining Time Complexity \(O(...)\), Space Complexity \(O(...)\), Code Quality (0-100), edge cases, and optimization suggestions.
   - Interactive confetti celebration on Accepted solutions!

5. **AI Speech-to-Speech Mock Interview (Module 5)**:
   - Immersive voice simulation room with animated interviewer avatar and real-time audio waveform visualizer.
   - Natural speech synthesis (TTS) reading questions and dynamic follow-ups.
   - Speech-to-Text (Web Speech API) listening to candidate's spoken responses with real-time transcript streaming.
   - Dynamic conversational follow-up questions probing deeper if an answer is brief or incomplete.
   - Comprehensive post-interview performance evaluation report:
     - Overall Score (0-100)
     - Categorical scores: Technical Knowledge, Communication, Confidence, Problem Solving, Answer Quality.
     - Speech Delivery analysis: Speaking pace (Words Per Minute), filler words count (`um`, `like`, `basically`), clarity score.
     - Question-by-question review with candidate transcript, critique, and AI sample ideal answers.

6. **Unified Progress Tracking & Dashboard**:
   - Algorithmic Placement Readiness Index (0-100%) synthesized across DSA coding scores, resume ATS rating, roadmap milestones, and mock interview performance.
   - Live category breakdown bars (DSA, Tech, Resume, Communication, Mock Interviews).
   - Recent activity timeline and daily placement prep checklist.

---

## 🛠️ Architecture & Tech Stack

```
placement-helper-ai/
├── client/                     # Vite + React 19 + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ToastContainer
│   │   ├── views/              # Dashboard, Chatbot, ResumeBuilder, RoadmapGenerator,
│   │   │                       # CodingEnvironment, MockInterview, Profile, Settings, LandingPage
│   │   ├── services/           # Typed API client functions
│   │   └── types/              # TypeScript interface definitions
│   ├── package.json
│   └── vite.config.ts          # Configured with proxy to backend port 5000
│
├── server/                     # Node.js 24 + Express Backend
│   ├── src/
│   │   ├── db/                 # Zero-dependency SQLite storage using Node 24 node:sqlite
│   │   ├── services/
│   │   │   ├── aiService.js    # Dual-Engine AI (Gemini 2.5 Flash + Fallback Placement Engine)
│   │   │   └── codeRunner.js   # Sandboxed code runner (Python, JS, C++, Java)
│   │   ├── routes/             # REST endpoints for all 5 modules + settings + progress
│   │   └── index.js            # Server entrypoint (Port 5000)
│   ├── data/                   # SQLite database (placement_helper.db)
│   ├── package.json
│   └── test-api.js             # Automated 7/7 endpoint verification suite
│
├── package.json                # Root package with concurrently launcher
├── .env.example                # Sample environment configuration
└── README.md
```

---

## ⚡ Quick Start Instructions

### Prerequisites
- **Node.js**: v20+ or v24+ (Node 24 comes with built-in `node:sqlite`)
- **Python**: 3.10+ (for Python coding sandbox)
- **Optional Compilers**: `gcc` / `g++` (for C++ execution) and `javac` / `java` (for Java execution)

### 1. Installation
Run from the root directory:
```bash
npm run install:all
```
*(Or install inside `server` and `client` individually using `npm install`)*

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Inside `.env`:
```env
PORT=5000
# Optional: Enter your Google Gemini API Key.
# If left empty, the application runs 100% out-of-the-box using the Built-in Placement Intelligence Engine!
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can also set or test your Gemini API Key directly inside the in-app Settings UI at any time!)*

### 3. Run Development Servers
From the root directory, launch both frontend and backend concurrently:
```bash
npm run dev
```

Or run them in separate terminals:
- **Backend**: `cd server && npm run dev` (Listening on `http://localhost:5000`)
- **Frontend**: `cd client && npm run dev` (Listening on `http://localhost:5173`)

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Running Automated Backend Verification Tests
To run the automated 7/7 backend test suite:
```bash
cd server
node test-api.js
```
Output:
```
--- STARTING BACKEND API VERIFICATION SUITE ---
[1/7] Health Check: ✅ PASSED
[2/7] Unified Readiness Check: ✅ PASSED
[3/7] AI Chatbot Prep Plan: ✅ PASSED (Generated 10-day structured sprint)
[4/7] Resume ATS Audit: ✅ PASSED (Score: 90/100)
[5/7] Roadmap Flowchart: ✅ PASSED (5 nodes created)
[6/7] Sandboxed Code Execution & AI Analysis: ✅ PASSED (All 5 test cases Accepted in 1ms)
[7/7] Speech Mock Interview Simulator: ✅ PASSED (Dynamic question transition verified)
--- ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ---
```

---

## 🔒 Security & Code Execution Sandbox
- **Process Isolation**: Each user code submission runs in an isolated, unique temporary directory that is strictly deleted upon completion.
- **Execution Timeouts**: Subprocesses are enforced with a hard 6000ms timeout guard; if exceeded, the process tree is immediately killed with `Time Limit Exceeded`.
- **Python Security Prelude**: Dangerous modules (`socket`, `requests`, `urllib`, `subprocess`) are intercepted and blocked before execution.
- **Buffer Truncation**: Standard output and error streams are capped to prevent memory exhaustion from infinite loop prints.

---

## 📄 License & Credits
Built for student campus placements, internship drives, and technical interview excellence.
Placement Helper AI &copy; 2026.
