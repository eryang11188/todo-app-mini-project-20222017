import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function Navbar() {
  const location = useLocation();
  const isMain = location.pathname === '/';

  return (
    <nav className="bg-[#002f6c] p-4 text-white shadow-xl sticky top-0 z-[200]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="font-black text-2xl italic tracking-tighter">
              CWNU PORTAL <span className="text-red-400 px-2">V5_super_3.5</span>
            </h1>
          </Link>
          {/* 🚀 2. 와글/학식 링크 및 프로젝트 문구 부활 */}
          <div className="hidden lg:flex items-center gap-4 border-l border-blue-800 ml-4 pl-4">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest leading-none">
              Software Engineering<br/>Project 2026
            </div>
            <div className="flex items-center gap-2">
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" 
                 className="bg-blue-800/40 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-blue-700/50 flex items-center gap-1.5">🌐 와글 광장</a>
              <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" 
                 className="bg-orange-500/60 hover:bg-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-orange-400/50 flex items-center gap-1.5">🍱 오늘 학식</a>
            </div>
          </div>
        </div>

        {!isMain && (
          <div className="flex gap-6 font-black text-sm items-center">
            <Link to="/market" className="hover:text-blue-300 transition-colors flex items-center gap-1">🏪 <span className="hidden sm:inline">MARKET</span></Link>
            <Link to="/todo" className="hover:text-blue-300 transition-colors flex items-center gap-1">📝 <span className="hidden sm:inline">TODO</span></Link>
            <Link to="/gpa" className="hover:text-blue-300 transition-colors flex items-center gap-1">🎓 <span className="hidden sm:inline">GPA</span></Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [timerMode, setTimerMode] = useState('timer');
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime(prev => {
          if (timerMode === 'timer') {
            if (prev <= 10) { setTimerIsRunning(false); return 0; }
            return prev - 10;
          }
          return prev + 10;
        });
      }, 10);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerIsRunning, timerMode]);

  const timerProps = { timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/todo" element={<TodoPage {...timerProps} />} />
            <Route path="/gpa" element={<GpaPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;