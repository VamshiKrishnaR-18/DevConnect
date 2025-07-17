@echo off
echo Starting DevConnect Development Environment...
echo.

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "BACKEND\node_modules" (
    echo Installing backend dependencies...
    cd BACKEND
    npm install
    cd ..
)

if not exist "FRONTEND\node_modules" (
    echo Installing frontend dependencies...
    cd FRONTEND
    npm install
    cd ..
)

echo.
echo Setting up environment for local development...
cd FRONTEND
copy .env.local .env >nul 2>&1
cd ..

echo.
echo Starting development servers...
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev
