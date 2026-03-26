import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getWeatherInfo = (code, lang) => {
  const currentHour = new Date().getHours();
  // ⭐ 저녁 6시 ~ 아침 6시 사이면 밤으로 간주
  const isNight = currentHour >= 18 || currentHour < 6;

  if (code === 0) return { icon: isNight ? '🌙' : '☀️', text: lang === 'ko' ? '맑음' : 'Clear' };
  // 💡 구름 조금일 때도 밤이면 해(⛅) 대신 구름(☁️)만 뜨도록 수정 완료!
  if (code === 1 || code === 2 || code === 3) return { icon: isNight ? '☁️' : '⛅', text: lang === 'ko' ? '구름조금' : 'Partly Cloudy' };
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
  
  const [showAllergy, setShowAllergy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.2422&longitude=128.6946&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FSeoul');
        const weatherData = await weatherRes.json();
        setWeather(weatherData.current);

        const dustRes = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.2422&longitude=128.6946&current=pm10,pm2_5');
        const dustData = await dustRes.json();
        setDust(dustData.current);

        const foodRes = await fetch('/api/food'); 
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
      help: "💡 도움말", weatherPrefix: "📍 현재 창원대 캠퍼스",
      serviceGo: "바로가기 →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE", noticeBtn1: "창원대학교 공지사항", noticeBtn2: "와글 (포털)", shortcutTitle: "CAMPUS SHORTCUTS",
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      tourSteps: [
        { title: "👋 반가워요!", desc: "창원대 포털의 주요 기능을 안내해 드릴게요.", targetId: "tour-main-header" },
        { title: "🍚 학식 서랍", desc: "왼쪽의 버튼을 누르면 오늘 학식이 짠! 하고 나타납니다.", targetId: "tour-side-btns" },
        { title: "🚀 핵심 서비스", desc: "중고마켓, 분실물 등 대학생활 꿀기능 4대장입니다.", targetId: "tour-main-services" },
        { title: "🔗 퀵 버튼 (8칸)", desc: "학우님들이 자주 찾는 사이트 8개를 한곳에 모았습니다.", targetId: "tour-main-shortcuts" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 ▶", tourEnd: "종료 🎉",
      services: [
        { title: "중고 마켓", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
        { title: "분실물 센터", desc: "잃어버린 물건, 창대인이 함께 찾아요.", icon: "🔍", path: "/lost", color: "from-orange-500 to-red-600" },
        { title: "ToDo List", desc: "집중 타이머와 함께 일정을 관리하세요.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
        { title: "학점 계산기", desc: "실시간 그래프로 성적을 분석하세요.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" }
      ],
      quickLinks: [
        { name: "e캠퍼스", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻" },
        { name: "학사일정", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅" },
        { name: "학사안내", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜" }, 
        { name: "등록안내", url: "https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=18352&bbsId=6253", icon: "📋" },
        { name: "교육과정", url: "https://www.changwon.ac.kr/haksa/cm/cntnts/cntntsView.do?mi=18077&cntntsId=6530", icon: "📘" }, 
        { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
        { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
        { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" }
      ]
    },
    en: {
      subtitle: "All-in-one Campus Solution for CWNU Students",
      help: "💡 Guide", weatherPrefix: "📍 CWNU Campus Now",
      serviceGo: "GO →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE", noticeBtn1: "CWNU Notice Board", noticeBtn2: "Wagle (Portal)", shortcutTitle: "CAMPUS SHORTCUTS",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      tourSteps: [
        { title: "👋 Welcome!", desc: "Let me guide you through the main features of the CWNU Portal.", targetId: "tour-main-header" },
        { title: "🍚 Meal Drawer", desc: "Click the buttons on the left to see today's campus meals!", targetId: "tour-side-btns" },
        { title: "🚀 Core Services", desc: "These are the 4 main features like Market and Lost & Found.", targetId: "tour-main-services" },
        { title: "🔗 Quick Links", desc: "We've gathered 8 frequently visited sites in one place.", targetId: "tour-main-shortcuts" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", tourEnd: "Close 🎉",
      services: [
        { title: "Flea Market", desc: "Share items happily with peers.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
        { title: "Lost & Found", desc: "Let's find lost items together.", icon: "🔍", path: "/lost", color: "from-orange-500 to-red-600" },
        { title: "ToDo List", desc: "Manage tasks with a focus timer.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
        { title: "GPA Calc", desc: "Analyze grades with real-time graphs.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" }
      ],
      quickLinks: [
        { name: "e-Campus", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻" },
        { name: "Schedule", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅" },
        { name: "Academic", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜" }, 
        { name: "Tuition", url: "https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=18352&bbsId=6253", icon: "📋" },
        { name: "Curriculum", url: "https://www.changwon.ac.kr/haksa/cm/cntnts/cntntsView.do?mi=18077&cntntsId=6530", icon: "📘" }, 
        { name: "Course Reg.", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
        { name: "DreamCatch", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
        { name: "e-Dream", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" }
      ]
    }
  };
  
  const current = t[lang] || t.ko; 
  const weatherData = weather ? getWeatherInfo(weather.weather_code, lang) : null;
  const dustData = dust ? getDustStatus(dust.pm10, lang) : null;

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-[6px]', 'ring-blue-400', 'ring-offset-4', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all');
        return () => el.classList.remove('ring-[6px]', 'ring-blue-400', 'ring-offset-4', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all');
      }
    }
  }, [tourIndex, current.tourSteps]);

  const AllergyToggleBtn = () => (
    <button onClick={() => setShowAllergy(!showAllergy)} className={`text-[10px] md:text-xs font-black px-3 py-1.5 rounded-xl transition-all border shadow-sm flex items-center gap-1 ${showAllergy ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}>{showAllergy ? (lang === 'ko' ? '🚨 알레르기 켜짐' : '🚨 Allergy ON') : (lang === 'ko' ? '💡 알레르기 보기' : '💡 Show Allergy')}</button>
  );

  const AllergyGuideBox = () => {
    if (!showAllergy) return null;
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 p-3 mb-3 rounded-xl shadow-sm animate-[slide-down_0.3s_ease-out]">
        <h4 className="text-[11px] font-black text-orange-600 dark:text-orange-400 mb-1.5">{lang === 'ko' ? '🚨 알레르기 유발 물질 안내' : '🚨 Allergy Information'}</h4>
        <p className="text-[10px] font-bold text-orange-700/80 dark:text-orange-300/80 leading-relaxed break-keep">1.난류 2.우유 3.메밀 4.땅콩 5.대두 6.밀 7.고등어 8.게 9.새우 10.돼지고기 11.복숭아 12.토마토 13.아황산류 14.호두 15.닭고기 16.쇠고기 17.오징어 18.잣 19.조개류</p>
      </div>
    );
  };

  const renderFoodCard = (campusFilter) => (
    <div className="flex flex-col gap-3 pb-6">
      {!meals ? ( <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold animate-pulse">{lang === 'ko' ? '데이터 로딩중...' : 'Loading...'}</div> ) : meals.filter(m => m.place.includes(campusFilter)).length === 0 ? ( <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold">{lang === 'ko' ? '식단 정보가 없습니다.' : 'No menu found.'}</div> ) : (
        meals.filter(m => m.place.includes(campusFilter)).map((meal, idx) => {
          const lines = meal.menu.split('\n');
          const displayName = meal.place.split('-')[1]?.trim() || meal.place.replace(campusFilter, '').trim();
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex justify-between items-center mb-2 pl-3 border-b border-gray-50 dark:border-gray-700 pb-2">
                <span className="text-[12px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1.5 rounded-lg">{displayName}</span>
                {meal.menu.includes("원") && ( <span className="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-gray-700 px-1.5 py-0.5 rounded"></span> )}
              </div>
              <ul className="pl-3 space-y-1 mt-2">
                {meal.menu.includes("운영중지") ? ( <li className="text-red-500 text-[11px] font-bold py-1">⚠️ {lang === 'ko' ? '운영중지' : 'Closed'}</li> ) : (
                  lines.map((line, i) => {
                    const trimmedLine = line.trim();
                    const isAllergyLine = /^\([\d.,\s]+\)$/.test(trimmedLine);
                    if (isAllergyLine && !showAllergy) return null;
                    return ( <li key={i} className={`break-keep leading-relaxed ${isAllergyLine ? 'text-[10px] text-orange-500 dark:text-orange-400 font-bold tracking-tight mt-0 mb-1' : line.startsWith('<') || line.startsWith('[') ? 'text-blue-600 dark:text-blue-400 text-[11px] mt-2.5 mb-1 tracking-wider uppercase font-black' : 'text-[13px] font-bold text-gray-700 dark:text-gray-200'}`}>{trimmedLine}</li> );
                  })
                )}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors relative bg-gray-50/30 dark:bg-gray-900 overflow-x-hidden font-sans">
      
      <style>{`
        @keyframes tour-slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .tour-popup { animation: tour-slide-up 0.4s forwards; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[300] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 w-[92%] max-w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg font-black mb-2 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs font-bold mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">{current.tourSkip}</button>
            <button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button>
          </div>
        </div>
      )}

      <div id="tour-side-btns" className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3">
        <button onClick={() => setIsBongrimOpen(true)} className="bg-blue-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-lg hover:bg-blue-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-blue-400">
          <span className="text-2xl group-hover:scale-110">🍚</span>
          <span className="text-xs font-black tracking-widest" style={{ writingMode: 'vertical-rl' }}>{lang === 'ko' ? '봉림관 학식' : 'Bongrim Meal'}</span>
        </button>
        <button onClick={() => setIsSarimOpen(true)} className="bg-indigo-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-lg hover:bg-indigo-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-indigo-400">
          <span className="text-2xl group-hover:scale-110">🍱</span>
          <span className="text-xs font-black tracking-widest" style={{ writingMode: 'vertical-rl' }}>{lang === 'ko' ? '사림관 학식' : 'Sarim Meal'}</span>
        </button>
      </div>

      {(isBongrimOpen || isSarimOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] transition-opacity duration-300" onClick={() => { setIsBongrimOpen(false); setIsSarimOpen(false); }}></div>
      )}
      
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 flex flex-col ${isBongrimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4 shadow-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-blue-600 flex items-center gap-2">🍚 {lang === 'ko' ? '봉림관 식단' : 'Bongrim Menu'}</h2>
            <div className="flex items-center gap-2"><AllergyToggleBtn /><button onClick={() => setIsBongrimOpen(false)} className="w-8 h-8 flex justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold transition">✕</button></div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button onClick={() => setBongrimTab('1층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '1층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500'}`}>{lang === 'ko' ? '1층 (MOSS1)' : '1F (MOSS1)'}</button>
            <button onClick={() => setBongrimTab('2층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '2층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500'}`}>{lang === 'ko' ? '2층 (MOSS2)' : '2F (MOSS2)'}</button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900"><AllergyGuideBox />{renderFoodCard(`봉림관 ${bongrimTab}`)}</div>
      </div>

      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 flex flex-col ${isSarimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10 gap-2">
          <h2 className="text-lg font-black text-indigo-600 flex items-center gap-2">🍱 {lang === 'ko' ? '사림관 식단' : 'Sarim Menu'}</h2>
          <div className="flex items-center gap-2"><AllergyToggleBtn /><button onClick={() => setIsSarimOpen(false)} className="w-8 h-8 flex justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold transition">✕</button></div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900"><AllergyGuideBox />{renderFoodCard('사림관')}</div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-5 md:px-10 flex-grow flex flex-col justify-center mt-4 md:mt-0">
        
        <div className="flex justify-center mb-6 md:mb-8 pt-4">
          {weather && dust ? (
            <div className="inline-flex flex-wrap justify-center items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-blue-100 dark:border-gray-700 px-5 md:px-7 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all group">
              <span className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider hidden sm:block">{current.weatherPrefix}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl animate-float">{weatherData.icon}</span>
                <span className="text-base md:text-lg font-black text-gray-800 dark:text-white">{weather.temperature_2m}°C</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500">{weatherData.text}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-3">
                <span className="text-base md:text-lg">{dustData.icon}</span>
                <span className={`text-[11px] md:text-xs font-black ${dustData.color}`}>{dustData.text}</span>
                <span className="text-[10px] font-bold text-gray-400 hidden xs:inline-block">({dust.pm10}㎍/㎥)</span>
              </div>
            </div>
          ) : ( <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-full text-xs font-bold text-gray-400 animate-pulse mt-4">⏳ {lang === 'ko' ? '로딩 중...' : 'Loading...'}</div> )}
        </div>

        <div id="tour-main-header" className="text-center mb-10 md:mb-14 relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>



            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1 hover:bg-yellow-600 transition-all hover:scale-105 h-fit mt-1 md:mt-3">
              {current.help}
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg">{current.subtitle}</p>
        </div>

        <div id="tour-main-services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-20">
          {current.services.map((s, idx) => (
            <Link key={idx} to={s.path} className="group relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-50 dark:border-gray-700 flex flex-col items-center text-center">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${s.color}`}></div>
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 duration-300 drop-shadow-md">{s.icon}</div>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mb-8 flex-grow break-keep">{s.desc}</p>
              <div className={`w-full py-3 rounded-xl bg-gradient-to-r ${s.color} text-white font-black text-[11px] uppercase tracking-widest`}>{current.serviceGo}</div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-8 md:p-12 rounded-[3.5rem] border-2 border-blue-100/50 dark:border-blue-800/50 relative overflow-hidden">
          <div className="text-center mb-16 relative z-10">
            <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">{current.noticeTitle}</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" target="_blank" rel="noreferrer" className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-black text-base px-8 py-4 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-100 dark:border-gray-700 text-center">{current.noticeBtn1} ↗</a>
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" className="inline-block bg-[#002f6c] dark:bg-blue-800 text-white font-black text-base px-8 py-4 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-900 dark:border-gray-700 text-center">{current.noticeBtn2} ↗</a>
            </div>
          </div>
          <div id="tour-main-shortcuts" className="relative z-10">
            <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-8">{current.shortcutTitle}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {current.quickLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                  <span className="text-3xl mb-2 group-hover:scale-110">{link.icon}</span>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 text-center break-keep">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
    {current.footerDept}
  </p>

  <div className="flex items-center justify-center gap-4 mt-2 md:mt-3">
    <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold">
      {current.footerCopy}
    </p>
    
    <div className="relative group flex flex-col items-center">
      <a 
        href="https://github.com/eryang11188/todo-app-mini-project-20222017.git" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:scale-110"
      >
        <svg 
          height="35" 
          width="35" 
          viewBox="0 0 16 16" 
          fill="currentColor" 
          className="opacity-80 hover:opacity-100"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>
      </a>

      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center animate-bounce">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 dark:bg-gray-700 shadow-lg rounded-md font-bold">
          Github 
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

export default MainPage;