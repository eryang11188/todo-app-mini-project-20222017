import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function Navbar({ isDarkMode, toggleDarkMode }) {
  const location = useLocation();
  const isMain = location.pathname === '/';
  
  return (
    // 📱 모바일: 패딩 축소(p-3) / PC: 기존 유지(p-4)
    <nav className="bg-[#002f6c] dark:bg-gray-900 p-3 md:p-4 text-white shadow-xl sticky top-0 z-[200] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* 좌측 로고 영역 */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link to="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
            {/* 📱 모바일: 글씨 축소(text-lg), 줄바꿈 방지(whitespace-nowrap) / PC: text-2xl */}
            <h1 className="font-black text-lg md:text-2xl italic tracking-tighter whitespace-nowrap">
              CWNU PORTAL <span className="text-red-400 px-1 md:px-2 text-xs md:text-base align-baseline">V5_super_4.0</span>
            </h1>
          </Link>
          {/* PC 전용 우측 부가 설명 (모바일 자동 숨김 유지 - hidden lg:flex) */}
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

        {/* 우측 메뉴 영역 */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {!isMain && (
            // 📱 모바일: 메뉴 간격 축소(gap-3) / PC: gap-6
            <div className="flex gap-3 md:gap-6 font-black text-xs md:text-sm items-center mr-1 md:mr-2">
              <Link to="/market" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                {/* 📱 모바일: 터치를 위해 이모지 아이콘 확대(text-xl) */}
                <span className="text-xl md:text-base">🏪</span> <span className="hidden sm:inline">창원대 장터 ↗</span>
              </Link>
              <Link to="/todo" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <span className="text-xl md:text-base">📝</span> <span className="hidden sm:inline">ToDo 리스트 ↗</span>
              </Link>
              <Link to="/gpa" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <span className="text-xl md:text-base">🎓</span> <span className="hidden sm:inline">학점계산기 ↗</span>
              </Link>
            </div>
          )}
          {/* 📱 모바일: 버튼 여백 살짝 조절 */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 md:p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 border border-blue-700/50 dark:border-gray-600 text-sm md:text-base flex-shrink-0"
            title="다크모드 토글"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // 기존 타이머 로직 (원형 그대로 유지)
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
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
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