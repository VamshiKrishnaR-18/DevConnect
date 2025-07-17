#!/bin/bash

echo "Starting DevConnect Development Environment..."
echo

echo "Installing dependencies if needed..."
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "BACKEND/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd BACKEND
    npm install
    cd ..
fi

if [ ! -d "FRONTEND/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd FRONTEND
    npm install
    cd ..
fi

echo
echo "Starting development servers..."
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"
echo

npm run dev
