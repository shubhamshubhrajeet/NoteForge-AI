# 🎓 NoteForge-AI

An AI-powered file management system for college notes, built on your own laptop as a VPS.

## Features
- **Auto-Categorization** — Claude AI categorizes every uploaded file into Branch / Year / Subject / Unit
- **Smart Search** — Natural language search powered by Claude AI
- **Duplicate Detection** — SHA-256 hash + AI semantic duplicate detection

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| AI | Google Gemini API |
| Storage | Local filesystem (your external HDD) |

## Branches Supported
- **MCA** — Master of Computer Applications
- **BCA** — Bachelor of Computer Applications  
- **BSc ITM** — Bachelor of Science in IT Management

## Setup Instructions

### 1. Prerequisites
- Node.js v18 or higher
- An Anthropic API key from https://console.anthropic.com

### 2. Configure Storage Path
Edit `backend/.env` and set `STORAGE_PATH` to your external hard disk path:
- Windows: `STORAGE_PATH=E:/college-notes`
- Linux/Mac: `STORAGE_PATH=/mnt/external/college-notes`

### 3. Install & Run Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY and STORAGE_PATH
npm run dev
```

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access from Other Devices on Network
Find your laptop's local IP:
- Windows: `ipconfig` → look for IPv4 Address
- Linux/Mac: `ip addr` or `ifconfig`

Then open `http://YOUR_IP:3000` from any device on the same WiFi.

### 6. Make it Available 24/7 (Optional)
Install PM2 for background running:
```bash
npm install -g pm2
cd backend && pm2 start server.js --name college-backend
```

## File Structure
```
college-notes-vps/
├── backend/
│   ├── server.js           ← Main entry point
│   ├── .env                ← Your config (API key, storage path)
│   ├── db/database.js      ← SQLite schema & connection
│   ├── middleware/upload.js ← File upload handling
│   ├── routes/
│   │   ├── files.js        ← Upload, list, delete files
│   │   ├── search.js       ← Smart search endpoint
│   │   ├── ai.js           ← Duplicate detection & re-categorize
│   │   └── stats.js        ← Dashboard statistics
│   └── services/
│       ├── aiService.js    ← Claude API calls
│       └── fileService.js  ← Hash, text extraction, disk ops
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api/client.js   ← All API calls
    │   ├── pages/          ← Dashboard, Upload, Browse, Search, Duplicates
    │   └── components/     ← Sidebar, FileCard
    └── vite.config.js
```
