import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('cwnu_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cwnu_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cwnu_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const [timerMode, setTimerMode] = useState('timer'); 
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerTime((prev) => {
          if (timerMode === 'timer') {
            if (prev <= 10) {
              setTimerIsRunning(false);
              return 0;
            }
            return prev - 10;
          } else {
            return prev + 10; 
          }
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerMode]);

  const getMenuClass = (path) => {
    const baseClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] md:text-sm transition-all ";
    return baseClass + (location.pathname === path 
      ? "bg-white/20 text-white shadow-inner" 
      : "text-white/70 hover:text-white hover:bg-white/10");
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 transition-colors`}>
      <header className="bg-[#002f6c] dark:bg-gray-950 text-white p-3 md:p-5 shadow-lg flex flex-col md:flex-row justify-between items-center transition-colors sticky top-0 z-[100] gap-3 md:gap-0">
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            CWNU PORTAL <span className="text-red-500 italic ml-1 md:ml-2 text-sm md:text-base opacity-90">V5 5.0</span>
          </h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="md:hidden px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold transition-colors hover:bg-white/20">
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* 메인 페이지('/')가 아닐 때만 상단 네비게이션 메뉴 노출 */}
        {location.pathname !== '/' && (
          <nav className="flex items-center gap-1 md:gap-4 bg-black/20 p-1 md:p-1.5 rounded-2xl">
            <Link to="/market" className={getMenuClass('/market')}>
              <span className="hidden sm:inline">MARKET</span><span className="sm:hidden text-[10px]">MARKET</span>
            </Link>
            <Link to="/todo" className={getMenuClass('/todo')}>
              <span className="hidden sm:inline">TODO</span><span className="sm:hidden text-[10px]">TODO</span>
            </Link>
            <Link to="/gpa" className={getMenuClass('/gpa')}>
              <span className="hidden sm:inline">GPA 계산기</span><span className="sm:hidden text-[10px]">GPA</span>
            </Link>
          </nav>
        )}

        <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto justify-center md:justify-end">
          <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" className="bg-[#634432] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#4d3527] transition">학식</a>
          <a href="https://lib.changwon.ac.kr/" target="_blank" rel="noreferrer" className="bg-[#059669] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#047857] transition">도서관</a>
          <a href="https://www.instagram.com/cwnu_official/?mi=18361" target="_blank" rel="noreferrer" className="bg-[#d946ef] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#c026d3] transition">인스타</a>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="hidden md:block px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all duration-300 text-xs font-black"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/todo" element={
            <TodoPage 
              timerMode={timerMode} setTimerMode={setTimerMode}
              timerTime={timerTime} setTimerTime={setTimerTime}
              timerIsRunning={timerIsRunning} setTimerIsRunning={setTimerIsRunning}
            />
          } />
          <Route path="/gpa" element={<GpaPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;