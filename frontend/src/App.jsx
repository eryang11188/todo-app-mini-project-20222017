import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';
import LostPage from './pages/LostPage';

const formatDateTime = (langCode, is12Hour) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const dayIndex = now.getDay();
  const dayOfWeek = langCode === 'ko'
    ? ['일', '월', '화', '수', '목', '금', '토'][dayIndex]
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const ampm = hours >= 12 ? (langCode === 'ko' ? '오후' : 'PM') : (langCode === 'ko' ? '오전' : 'AM');
  const displayHours = is12Hour ? (hours % 12 || 12) : hours;
  
  return {
    dateStr: `${year}. ${month}. ${date}`,
    dayStr: `(${dayOfWeek})`,
    isWeekend: dayIndex === 0 || dayIndex === 6,
    ampm: is12Hour ? ampm : '',
    timeStr: `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    hDeg: ((hours % 12) * 30) + (minutes * 0.5),
    mDeg: (minutes * 6) + (seconds * 0.1),
    sDeg: seconds * 6
  };
};

function App() {
  const isOff = window.location.hostname !== 'localhost' && false ;
  if (isOff) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white text-center p-5 z-[9999] relative">
        <span className="text-6xl mb-6 animate-bounce">🚧</span>
        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">
          CWNU 포털 <span className="text-blue-500">업데이트 중</span>
        </h1>
        <p className="text-gray-400 font-bold text-lg">
          더 멋진 기능으로 찾아오겠습니다. 조금만 기다려주세요! 😎
        </p>
      </div>
    );
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('cwnu_dark_mode') === 'true');
  const [lang, setLang] = useState(() => localStorage.getItem('cwnu_lang') || 'ko');
  const [is12Hour, setIs12Hour] = useState(() => localStorage.getItem('cwnu_is12Hour') === 'true');
  const [currentDateTime, setCurrentDateTime] = useState(null);
  const [clockAngles, setClockAngles] = useState({ h: 0, m: 0, s: 0 });
  
  const displayedAnglesRef = useRef({ h: 0, m: 0, s: 0 });
  const prevRawAnglesRef = useRef({ h: 0, m: 0, s: 0 });
  const isInitializedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('cwnu_is12Hour', is12Hour);
  }, [is12Hour]);

  useEffect(() => {
    localStorage.setItem('cwnu_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cwnu_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cwnu_dark_mode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const updateDateTime = () => {
      const result = formatDateTime(lang, is12Hour);
      setCurrentDateTime(result);

      const targetS = result.sDeg;
      const targetM = result.mDeg;
      const targetH = result.hDeg;

      if (!isInitializedRef.current) {
        displayedAnglesRef.current = { h: targetH, m: targetM, s: targetS };
        prevRawAnglesRef.current = { h: targetH, m: targetM, s: targetS };
        setClockAngles({ h: targetH, m: targetM, s: targetS });
        isInitializedRef.current = true;
        return;
      }

      let diffS = targetS - prevRawAnglesRef.current.s;
      if (diffS < -180) diffS += 360; 
      else if (diffS > 180) diffS -= 360;

      let diffM = targetM - prevRawAnglesRef.current.m;
      if (diffM < -180) diffM += 360;
      else if (diffM > 180) diffM -= 360;

      let diffH = targetH - prevRawAnglesRef.current.h;
      if (diffH < -180) diffH += 360;
      else if (diffH > 180) diffH -= 360;

      prevRawAnglesRef.current = { h: targetH, m: targetM, s: targetS };
      displayedAnglesRef.current = {
        h: displayedAnglesRef.current.h + diffH,
        m: displayedAnglesRef.current.m + diffM,
        s: displayedAnglesRef.current.s + diffS
      };

      setClockAngles({ ...displayedAnglesRef.current });
    };

    updateDateTime();
    const timerId = setInterval(updateDateTime, 1000);
    return () => clearInterval(timerId);
  }, [lang, is12Hour]);

  const [timerMode, setTimerMode] = useState('timer'); 
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerTime((prev) => {
          if (timerMode === 'timer') {
            if (prev <= 10) { setTimerIsRunning(false); return 0; }
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

  const t = {
    ko: { market: "MARKET", lost: "분실물 센터", todo: "TODO", gpa: "GPA 계산기", copykiller: "카피킬러↗", food: "학식↗", lib: " 도서관↗", insta: "📸 인스타" },
    en: { market: "MARKET", lost: "Lost&Found", todo: "TODO", gpa: "GPA Calc", copykiller: "CopyKiller↗", food: "Food↗", lib: " Library↗", insta: "📸 Insta" }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 transition-colors font-sans`}>
     <header className="bg-[#002f6c] dark:bg-gray-950 text-white p-3 md:p-5 shadow-lg flex flex-col md:flex-row justify-between items-center transition-colors sticky top-0 z-[170] gap-3 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            CWNU PORTAL <span className="text-red-500 italic ml-1 md:ml-2 text-sm md:text-base animate-[pulse_2s_ease-in-out_infinite] opacity-90"></span>
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} className="p-2 md:p-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white font-black text-[10px] md:text-xs hover:bg-white/20 transition-all">
              {lang === 'ko' ? '🌐 ENG' : '🌐 KOR'}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="md:hidden p-2 bg-white/10 rounded-full border-2 border-white/20">{isDarkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>

        {location.pathname !== '/' && (
          <nav className="flex items-center gap-1 md:gap-4 bg-black/20 p-1 md:p-1.5 rounded-2xl">
            <Link to="/market" className={getMenuClass('/market')}>🏪 <span className="hidden sm:inline">{t[lang].market}</span><span className="sm:hidden text-[10px]">{t[lang].market}</span></Link>
            <Link to="/lost" className={getMenuClass('/lost')}>🔍 <span className="hidden sm:inline">{t[lang].lost}</span><span className="sm:hidden text-[10px]">분실물</span></Link>
            <Link to="/todo" className={getMenuClass('/todo')}>📝 <span className="hidden sm:inline">{t[lang].todo}</span><span className="sm:hidden text-[10px]">{t[lang].todo}</span></Link>
            <Link to="/gpa" className={getMenuClass('/gpa')}>🎓 <span className="hidden sm:inline">{t[lang].gpa}</span><span className="sm:hidden text-[10px]">GPA</span></Link>
          </nav>
        )}

        <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto justify-center md:justify-end">
          {currentDateTime && (
            <div 
              onClick={() => setIs12Hour(!is12Hour)}
              className="hidden lg:flex items-center gap-4 mr-6 px-5 py-2 rounded-2xl transition hover:bg-white/10 group cursor-pointer border border-white/5 active:scale-95"
            >
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all group-hover:scale-110">
                <div 
                  className="absolute top-[12px] left-[22.5px] w-[3px] h-[12px] bg-amber-400 rounded-full" 
                  style={{ transform: `rotate(${clockAngles.h}deg)`, transformOrigin: 'bottom center', transition: 'transform 1s linear' }}
                ></div>
                <div 
                  className="absolute top-[5px] left-[23px] w-[2px] h-[19px] bg-sky-300 rounded-full" 
                  style={{ transform: `rotate(${clockAngles.m}deg)`, transformOrigin: 'bottom center', transition: 'transform 1s linear' }}
                ></div>
                <div 
                  className="absolute top-[3px] left-[23.5px] w-[1px] h-[21px] bg-red-500 rounded-full" 
                  style={{ transform: `rotate(${clockAngles.s}deg)`, transformOrigin: 'bottom center', transition: 'transform 1s linear' }}
                ></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 z-10 shadow-sm border border-black/10"></div>
              </div>

              <div className="flex flex-col text-right font-mono tracking-tighter">
                <span className="text-lg text-white/60 font-bold leading-tight">
                  {currentDateTime.dateStr} 
                  <span className={currentDateTime.isWeekend ? 'text-red-400 ml-1' : 'text-white/60 ml-1'}>
                    {currentDateTime.dayStr}
                  </span>
                </span>
                <span className="text-2xl text-white font-black leading-none mt-0.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] flex items-end justify-end gap-1">
                  {currentDateTime.ampm && (
                    <span className="text-[11px] font-bold mr-1 mb-[1px] tracking-normal font-sans opacity-90">
                      {currentDateTime.ampm}
                    </span>
                  )}
                  <span>{currentDateTime.timeStr}</span>
                </span>
              </div>
            </div>
          )}
          
          <a href="https://changwongrad.copykiller.com/welcome" target="_blank" rel="noreferrer" className="bg-[#be123c] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#9f1239] transition">
            📝 {t[lang].copykiller}
          </a>
          <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" className="bg-[#634432] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#4d3527] transition">
            {t[lang].food}
          </a>
          <a href="https://lib.changwon.ac.kr/" target="_blank" rel="noreferrer" className="bg-[#059669] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#047857] transition">
            {t[lang].lib}
          </a>
          <a href="https://www.instagram.com/cwnu_official/?mi=18361" target="_blank" rel="noreferrer" className="p-1.5 md:p-2 rounded-full text-white/80 hover:text-white hover:bg-[#d946ef] transition-all shadow-sm group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="hidden md:block p-2 md:p-2.5 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all duration-300">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<MainPage lang={lang} />} />
          <Route path="/market" element={<MarketPage lang={lang} />} />
          <Route path="/lost" element={<LostPage lang={lang} />} />
          <Route path="/todo" element={<TodoPage lang={lang} timerMode={timerMode} setTimerMode={setTimerMode} timerTime={timerTime} setTimerTime={setTimerTime} timerIsRunning={timerIsRunning} setTimerIsRunning={setTimerIsRunning} />} />
          <Route path="/gpa" element={<GpaPage lang={lang} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;