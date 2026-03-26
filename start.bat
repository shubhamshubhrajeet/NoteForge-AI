@echo off
echo Starting College Notes VPS...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3
start "Frontend" cmd /k "cd frontend && npm run dev"
echo Both servers starting! Open http://localhost:3000
pause
