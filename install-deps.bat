@echo off
echo 🚀 Installing HR Phoenix AI Frontend Dependencies...

REM Install base dependencies
echo 📦 Installing base dependencies...
call npm install

REM Install additional UI dependencies
echo 🎨 Installing UI component dependencies...
call npm install @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slot class-variance-authority clsx tailwind-merge

REM Install development dependencies if needed
echo 🔧 Installing development dependencies...
call npm install --save-dev @types/node @types/react @types/react-dom

echo ✅ All dependencies installed successfully!
echo.
echo 🎯 Next steps:
echo 1. Start the backend services: cd ../hr_phoenixai_code ^&^& python start_system.py
echo 2. Start the frontend: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🚀 Happy coding!
pause
