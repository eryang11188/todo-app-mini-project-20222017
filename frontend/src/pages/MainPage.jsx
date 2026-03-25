import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getWeatherInfo = (code, lang) => {
  if (code === 0) return { icon: '☀️', text: lang === 'ko' ? '맑음' : 'Clear' };
  if (code === 1 || code === 2 || code === 3) return { icon: '⛅', text: lang === 'ko' ? '구름조금' : 'Partly Cloudy' };
  if (code >= 45 && code <= 48) return { icon: '🌫️', text: lang === 'ko' ? '안개' : 'Fog' };
  if (code >= 51 && code <= 67) return { icon: '🌧️', text: lang === 'ko' ? '비' : 'Rain' };
  if (code >= 71 && code <= 77) return { icon: '❄️', text: lang === 'ko' ? '눈' : 'Snow' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', text: lang === 'ko' ? '소나기' : 'Showers' };
  if (code >= 95) return { icon: '⛈️', text: lang === 'ko' ? '천둥번개' : 'Thunderstorm' };
  return { icon: '🌡️', text: lang === 'ko' ? '측정중' : 'Unknown' };
};

const getDustStatus = (pm10, lang) => {
  if (pm10 <= 30) return { icon: '🔵', text: lang === 'ko' ? '미세먼지 좋음' : 'Dust Good', color: 'text-blue-500' };
  if (pm10 <= 80) return { icon: '🟢', text: lang === 'ko' ? '미세먼지 보통' : 'Dust Moderate', color: 'text-green-500' };
  if (pm10 <= 150) return { icon: '🟡', text: lang === 'ko' ? '미세먼지 나쁨' : 'Dust Bad', color: 'text-yellow-500' };
  return { icon: '🔴', text: lang === 'ko' ? '미세먼지 매우나쁨' : 'Dust Very Bad', color: 'text-red-500' };
};

function MainPage({ lang }) {
  const [tourIndex, setTourIndex] = useState(-1);
  const [weather, setWeather] = useState(null);
  const [dust, setDust] = useState(null);
  const [meals, setMeals] = useState(null);
  
  const [isBongrimOpen, setIsBongrimOpen] = useState(false);
  const [isSarimOpen, setIsSarimOpen] = useState(false);
  const [bongrimTab, setBongrimTab] = useState('1층');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.2422&longitude=128.6946&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FSeoul');
        const weatherData = await weatherRes.json();
        setWeather(weatherData.current);

        const dustRes = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.2422&longitude=128.6946&current=pm10,pm2_5');
        const dustData = await dustRes.json();
        setDust(dustData.current);

        const foodRes = await fetch('http://localhost:5000/api/food');
        const foodData = await foodRes.json();
        setMeals(foodData);
      } catch (error) {
        console.error("데이터 실패", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    ko: {
      subtitle: "창원대학교 학우들을 위한 올인원 캠퍼스 솔루션",
      help: "💡 도움말", tourEnd: "투어 종료 🎉", tourSkip: "건너뛰기", tourNext: "다음 보기 ▶", serviceGo: "GO →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE", noticeBtn1: "창원대학교 공지사항", noticeBtn2: "와글 (포털)", shortcutTitle: "CAMPUS SHORTCUTS",
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      weatherPrefix: "📍 현재 창원대 캠퍼스",
      services: [
        { title: "Flea Market", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
        { title: "Lost & Found", desc: "잃어버린 물건, 창대인이 함께 찾아요.", icon: "🔍", path: "/lost", color: "from-orange-500 to-red-600" },
        { title: "ToDo List", desc: "집중 타이머와 함께 일정을 관리하세요.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
        { title: "GPA Calculator", desc: "실시간 그래프로 성적을 분석하세요.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" }
      ],
      quickLinks: [
        { name: "e캠퍼스", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻" },
        { name: "학사일정", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅" },
        { name: "학사안내", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜" }, 
        { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
        { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
        { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" }
      ]
    },
    en: { /* 동일 구조 생략 */ }
  };
  const current = t[lang] || t.ko;
  const weatherData = weather ? getWeatherInfo(weather.weather_code, lang) : null;
  const dustData = dust ? getDustStatus(dust.pm10, lang) : null;

  // 🍱 서랍 안에서 보여줄 학식 카드 렌더링 함수
  const renderFoodCard = (campusFilter) => (
    <div className="flex flex-col gap-3 pb-6">
      {!meals ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold animate-pulse">데이터 로딩중...</div>
      ) : meals.filter(m => m.place.includes(campusFilter)).length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold">식단 정보가 없습니다.</div>
      ) : (
        meals.filter(m => m.place.includes(campusFilter)).map((meal, idx) => {
          const lines = meal.menu.split('\n');
          const displayName = meal.place.split('-')[1]?.trim() || meal.place.replace(campusFilter, '').trim();

          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex justify-between items-center mb-2 pl-3 border-b border-gray-50 dark:border-gray-700 pb-2">
                <span className="text-[12px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1.5 rounded-lg">
                  {displayName}
                </span>
                {meal.menu.includes("원") && (
                  <span className="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-gray-700 px-1.5 py-0.5 rounded">PREMIUM</span>
                )}
              </div>
              <ul className="pl-3 space-y-1 mt-2">
                {meal.menu.includes("운영중지") ? (
                  <li className="text-red-500 text-[11px] font-bold py-1">⚠️ 운영중지</li>
                ) : (
                  lines.map((line, i) => (
                    <li key={i} className={`text-[13px] font-bold text-gray-700 dark:text-gray-200 break-keep leading-relaxed ${line.startsWith('<') || line.startsWith('[') ? 'text-blue-600 dark:text-blue-400 text-[11px] mt-2.5 mb-1 tracking-wider uppercase' : ''}`}>
                      {line}
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors relative bg-gray-50/30 dark:bg-gray-900 overflow-x-hidden">
      
      {/* 💡 [핵심] 좌측에 세로로 나란히 붙은 봉림관/사림관 버튼 */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3">
        <button onClick={() => setIsBongrimOpen(true)} className="bg-blue-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-[4px_0_24px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-blue-400">
          <span className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">🍚</span>
          <span className="text-xs font-black tracking-widest text-blue-50" style={{ writingMode: 'vertical-rl' }}>봉림관 학식</span>
        </button>

        <button onClick={() => setIsSarimOpen(true)} className="bg-indigo-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-[4px_0_24px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-indigo-400">
          <span className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">🍱</span>
          <span className="text-xs font-black tracking-widest text-indigo-50" style={{ writingMode: 'vertical-rl' }}>사림관 학식</span>
        </button>
      </div>

      {/* 서랍장 어두운 배경 */}
      {(isBongrimOpen || isSarimOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] transition-opacity duration-300" onClick={() => { setIsBongrimOpen(false); setIsSarimOpen(false); }}></div>
      )}
      
      {/* 💡 [왼쪽 서랍] 봉림관 (1층/2층 분리 유지) */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isBongrimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 flex flex-col gap-4 shadow-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-blue-600 flex items-center gap-2">🍚 봉림관 식단</h2>
            <button onClick={() => setIsBongrimOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">✕</button>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button onClick={() => setBongrimTab('1층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '1층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500'}`}>1층 (MOSS1)</button>
            <button onClick={() => setBongrimTab('2층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '2층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500'}`}>2층 (MOSS2)</button>
          </div>
        </div>
        <div className="p-5 overflow-y-auto flex-grow bg-gray-50/50">
          {renderFoodCard(`봉림관 ${bongrimTab}`)}
        </div>
      </div>

      {/* 💡 [왼쪽 서랍] 사림관 (이제 사림관도 왼쪽에서 나옵니다!) */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isSarimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-lg font-black text-indigo-600 flex items-center gap-2">🍱 사림관 식단</h2>
          <button onClick={() => setIsSarimOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow bg-gray-50/50">
          {renderFoodCard('사림관')}
        </div>
      </div>

      {/* ---------------- 메인 컨텐츠 영역 ---------------- */}
      <div className="relative max-w-7xl mx-auto w-full px-5 md:px-10 flex-grow flex flex-col justify-center mt-4 md:mt-0">
        
        <div className="flex justify-center mb-6 md:mb-8 animate-[slide-up_0.5s_ease-out]">
          {weather && dust ? (
            <div className="inline-flex flex-wrap justify-center items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-blue-100 dark:border-gray-700 px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-sm hover:shadow-md transition-all group">
              <span className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider hidden sm:block">{current.weatherPrefix}</span>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">{weatherData.icon}</span>
                <span className="text-base md:text-lg font-black text-gray-800 dark:text-white">{weather.temperature_2m}°C</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500">{weatherData.text}</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg">{dustData.icon}</span>
                <span className={`text-[11px] md:text-xs font-black ${dustData.color}`}>{dustData.text}</span>
                <span className="text-[10px] font-bold text-gray-400">({dust.pm10}㎍/㎥)</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden xs:block"></div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-500 dark:text-blue-400">
                <span>💧</span><span>{weather.relative_humidity_2m}%</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-full text-xs font-bold text-gray-400 animate-pulse">
              ⏳ 캠퍼스 실시간 정보 로딩 중...
            </div>
          )}
        </div>

        <div id="tour-main-header" className="text-center mb-10 md:mb-14 relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg">
            {current.subtitle}
          </p>
        </div>

        <div id="tour-main-services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-20">
          {current.services.map((s, idx) => (
            <Link key={idx} to={s.path} className="group relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-50 dark:border-gray-700 flex flex-col items-center text-center">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${s.color}`}></div>
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{s.icon}</div>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mb-8 flex-grow break-keep">{s.desc}</p>
              <div className={`w-full py-3 rounded-xl bg-gradient-to-r ${s.color} text-white font-black text-[11px] md:text-xs shadow-sm opacity-90 group-hover:opacity-100 transition-opacity uppercase tracking-widest`}>
                {current.serviceGo}
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-8 md:p-12 rounded-[3.5rem] border-2 border-blue-100/50 dark:border-blue-800/50 transition-colors relative overflow-hidden">
          <div id="tour-main-notices" className="text-center mb-16 relative z-10">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-8 transition-colors">
              {current.noticeTitle}
            </h4>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" target="_blank" rel="noreferrer" className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-black text-base md:text-lg px-8 py-4 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-100 dark:border-gray-700 w-full sm:w-auto text-center">
                {current.noticeBtn1} <span className="text-sm ml-1">↗</span>
              </a>
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" className="inline-block bg-[#002f6c] dark:bg-blue-800 text-white font-black text-base md:text-lg px-8 py-4 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-900 dark:border-gray-700 w-full sm:w-auto text-center">
                {current.noticeBtn2} <span className="text-sm ml-1">↗</span>
              </a>
            </div>
          </div>
          <div id="tour-main-shortcuts" className="relative z-10">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-8 transition-colors">
              {current.shortcutTitle}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {current.quickLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 text-center break-keep">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-24 relative z-10 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 font-black text-xs md:text-sm uppercase tracking-widest mb-2 break-keep">
          {current.footerDept}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm font-bold">{current.footerCopy}</p>
      </footer>
    </div>
  );
}

export default MainPage;