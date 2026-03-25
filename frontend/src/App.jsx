import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';
// ✅ 신규: 분실물 센터 페이지 불러오기
import LostPage from './pages/LostPage';

function App() {
  // [스위치 유동적으로] 내 컴퓨터(localhost)가 아닐 때만 true(차단)로 작동
  // 나중에 완전히 공개하고 싶을 땐 맨 뒤의 true를 false로만 바꾸면 된다.
 
  const isOff = window.location.hostname !== 'localhost' && true;

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

  // ✅ 다크모드 상태
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('cwnu_dark_mode') === 'true';
  });

  // ✅ 다국어(언어) 상태 관리
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('cwnu_lang') || 'ko';
  });

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

  // ✅ 다국어 사전 (분실물 센터 및 교육과정 추가)
  const t = {
    ko: { market: "MARKET", lost: "분실물 센터", todo: "TODO", gpa: "GPA 계산기", curriculum: "교육과정↗", copykiller: "카피킬러↗", food: "학식↗", lib: " 도서관↗", insta: "📸 인스타" },
    en: { market: "MARKET", lost: "Lost&Found", todo: "TODO", gpa: "GPA Calc", curriculum: "Curriculum↗", copykiller: "CopyKiller↗", food: "Food↗", lib: " Library↗", insta: "📸 Insta" }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 transition-colors`}>
      <header className="bg-[#002f6c] dark:bg-gray-950 text-white p-3 md:p-5 shadow-lg flex flex-col md:flex-row justify-between items-center transition-colors sticky top-0 z-[100] gap-3 md:gap-0">
        
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
            {/* ✅ 신규: 분실물 센터 상단 메뉴 추가 */}
            <Link to="/lost" className={getMenuClass('/lost')}>🔍 <span className="hidden sm:inline">{t[lang].lost}</span><span className="sm:hidden text-[10px]">분실물</span></Link>
            <Link to="/todo" className={getMenuClass('/todo')}>📝 <span className="hidden sm:inline">{t[lang].todo}</span><span className="sm:hidden text-[10px]">{t[lang].todo}</span></Link>
            <Link to="/gpa" className={getMenuClass('/gpa')}>🎓 <span className="hidden sm:inline">{t[lang].gpa}</span><span className="sm:hidden text-[10px]">GPA</span></Link>
          </nav>
        )}

        <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto justify-center md:justify-end">
          
          {/* ✅ 교육과정 바로가기 */}
          <a href="https://www.changwon.ac.kr/haksa/cm/cntnts/cntntsView.do?mi=18077&cntntsId=6530" target="_blank" rel="noreferrer" className="bg-[#2563eb] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#1d4ed8] transition">
            📚 {t[lang].curriculum}
          </a>

          {/* ✅ 카피킬러 버튼 */}
          <a href="https://changwongrad.copykiller.com/welcome" target="_blank" rel="noreferrer" className="bg-[#be123c] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#9f1239] transition">
            📝 {t[lang].copykiller}
          </a>

          <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" className="bg-[#634432] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#4d3527] transition">
            {t[lang].food}
          </a>
          <a href="https://lib.changwon.ac.kr/" target="_blank" rel="noreferrer" className="bg-[#059669] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#047857] transition">
            {t[lang].lib}
          </a>
          
          {/* ✅ 인스타그램 SVG 로고 버튼 */}
          <a 
            href="https://www.instagram.com/cwnu_official/?mi=18361" 
            target="_blank" 
            rel="noreferrer" 
            className="p-1.5 md:p-2 rounded-full text-white/80 hover:text-white hover:bg-[#d946ef] transition-all shadow-sm group"
            title="CWNU Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-5 md:h-5 group-hover:scale-110 transition-transform">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="hidden md:block p-2 md:p-2.5 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all duration-300"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<MainPage lang={lang} />} />
          <Route path="/market" element={<MarketPage lang={lang} />} />
          {/* ✅ 신규: 분실물 센터 라우트 연결 */}
          <Route path="/lost" element={<LostPage lang={lang} />} />
          <Route path="/todo" element={
            <TodoPage 
              lang={lang}
              timerMode={timerMode} setTimerMode={setTimerMode}
              timerTime={timerTime} setTimerTime={setTimerTime}
              timerIsRunning={timerIsRunning} setTimerIsRunning={setTimerIsRunning}
            />
          } />
          <Route path="/gpa" element={<GpaPage lang={lang} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;