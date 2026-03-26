#!/bin/bash
echo "Starting College Notes VPS..."
cd backend && npm run dev &
BACKEND_PID=$!
sleep 2
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Open http://localhost:3000"
wait
