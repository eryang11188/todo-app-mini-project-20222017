// src/App.jsx 전체 복사
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';

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
        <nav className="bg-[#002f6c] p-4 text-white shadow-xl sticky top-0 z-[200]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            <div className="flex items-center gap-4">
              <h1 className="font-black text-2xl italic tracking-tighter">
                CWNU PORTAL <span className="text-red-400">V5_super_2.0</span>
              </h1>
              {/* 🚀 2. 외부 사이트 퀵링크 추가 (와글, 학식) */}
              <div className="hidden md:flex items-center gap-2 border-l border-blue-800 ml-4 pl-4">
                <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" 
                   className="bg-blue-800/50 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-blue-700 shadow-sm flex items-center gap-1.5">
                  🌐 와글 광장
                </a>
                <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" 
                   className="bg-orange-500/80 hover:bg-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-orange-400 shadow-sm flex items-center gap-1.5">
                  🍱 오늘 학식
                </a>
              </div>
            </div>

            <div className="flex gap-8 font-black text-sm items-center">
              <Link to="/market" className="hover:text-blue-300 transition-colors flex items-center gap-1">🏪 <span className="hidden sm:inline">MARKET</span></Link>
              <Link to="/todo" className="hover:text-blue-300 transition-colors flex items-center gap-1">📝 <span className="hidden sm:inline">TODO</span></Link>
            </div>
          </div>
        </nav>

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/todo" element={<TodoPage {...timerProps} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;