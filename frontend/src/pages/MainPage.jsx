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
  const [weather, setWeather] = useState(null);
  const [dust, setDust] = useState(null);
  const [meals, setMeals] = useState(null);
  const [shuttles, setShuttles] = useState(null); // 🚌 셔틀버스 데이터 상태 추가
  
  // 💡 서랍 열림 상태 관리
  const [isBongrimOpen, setIsBongrimOpen] = useState(false);
  const [isSarimOpen, setIsSarimOpen] = useState(false);
  const [isDormOpen, setIsDormOpen] = useState(false); // 🏠 생활관 서랍 추가
  const [isShuttleOpen, setIsShuttleOpen] = useState(false); // 🚌 셔틀버스 서랍 추가

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

        const foodRes = await fetch('http://localhost:5000/api/food');
        const foodData = await foodRes.json();
        setMeals(foodData);

        // 🚌 셔틀버스 데이터 패칭
        const shuttleRes = await fetch('http://localhost:5000/api/shuttle');
        const shuttleData = await shuttleRes.json();
        setShuttles(shuttleData);

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
      weatherPrefix: "📍 현재 창원대 캠퍼스",
      serviceGo: "바로가기 →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE", noticeBtn1: "창원대학교 공지사항", noticeBtn2: "와글 (포털)", shortcutTitle: "CAMPUS SHORTCUTS",
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
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
        { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
        { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
        { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" }
      ]
    }
  };
  const current = t.ko; // 단일 언어 고정
  const weatherData = weather ? getWeatherInfo(weather.weather_code, 'ko') : null;
  const dustData = dust ? getDustStatus(dust.pm10, 'ko') : null;

  const AllergyToggleBtn = () => (
    <button onClick={() => setShowAllergy(!showAllergy)} className={`text-[10px] md:text-xs font-black px-3 py-1.5 rounded-xl transition-all border shadow-sm flex items-center gap-1 ${showAllergy ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
      {showAllergy ? '🚨 알레르기 켜짐' : '💡 알레르기 보기'}
    </button>
  );

  const AllergyGuideBox = () => {
    if (!showAllergy) return null;
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 p-3 mb-3 rounded-xl shadow-sm animate-[slide-down_0.3s_ease-out]">
        <h4 className="text-[11px] font-black text-orange-600 dark:text-orange-400 mb-1.5">🚨 알레르기 유발 물질 안내</h4>
        <p className="text-[10px] font-bold text-orange-700/80 dark:text-orange-300/80 leading-relaxed break-keep">
          1.난류 2.우유 3.메밀 4.땅콩 5.대두 6.밀 7.고등어 8.게 9.새우 10.돼지고기 11.복숭아 12.토마토 13.아황산류 14.호두 15.닭고기 16.쇠고기 17.오징어 18.잣 19.조개류
        </p>
      </div>
    );
  };

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
                  lines.map((line, i) => {
                    const trimmedLine = line.trim();
                    const isAllergyLine = /^\([\d.,\s]+\)$/.test(trimmedLine);
                    if (isAllergyLine && !showAllergy) return null;

                    return (
                      <li key={i} className={`break-keep leading-relaxed ${isAllergyLine ? 'text-[10px] text-orange-500 dark:text-orange-400 font-bold tracking-tight mt-0 mb-1' : line.startsWith('<') || line.startsWith('[') ? 'text-blue-600 dark:text-blue-400 text-[11px] mt-2.5 mb-1 tracking-wider uppercase font-black' : 'text-[13px] font-bold text-gray-700 dark:text-gray-200'}`}>
                        {trimmedLine}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );

  // 🚌 셔틀버스 카드 렌더링
  const renderShuttleCard = () => (
    <div className="flex flex-col gap-3 pb-6">
      {!shuttles ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold animate-pulse">데이터 로딩중...</div>
      ) : shuttles.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold">운행 정보가 없습니다.</div>
      ) : (
        shuttles.map((shuttle, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:border-amber-300 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
            <h3 className="text-[13px] font-black text-gray-800 dark:text-white mb-2 pl-3 flex items-center gap-2">
              <span className="text-amber-500 text-base">📍</span> {shuttle.route}
            </h3>
            <div className="pl-3 space-y-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-2.5 rounded-xl ml-2">
              <p className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                <span className="text-gray-400">💵 승차요금</span>
                <span className="text-amber-600 dark:text-amber-400">{shuttle.fare}원</span>
              </p>
              <p className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                <span className="text-gray-400">🕒 운행시간</span>
                <span>{shuttle.schedule}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">🚌 운행대수</span>
                <span>{shuttle.buses}</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors relative bg-gray-50/30 dark:bg-gray-900 overflow-x-hidden">
      
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ========================================================= */}
      {/* 👈 좌측 윙 서랍 버튼 (봉림관 / 사림관 / 생활관) */}
      {/* ========================================================= */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2">
        <button onClick={() => setIsBongrimOpen(true)} className="bg-blue-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-lg hover:bg-blue-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-blue-400">
          <span className="text-xl group-hover:scale-110 transition-transform">🍚</span>
          <span className="text-xs font-black tracking-widest text-blue-50" style={{ writingMode: 'vertical-rl' }}>봉림관 학식</span>
        </button>

        <button onClick={() => setIsSarimOpen(true)} className="bg-indigo-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-lg hover:bg-indigo-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-indigo-400">
          <span className="text-xl group-hover:scale-110 transition-transform">🍱</span>
          <span className="text-xs font-black tracking-widest text-indigo-50" style={{ writingMode: 'vertical-rl' }}>사림관 학식</span>
        </button>

        <button onClick={() => setIsDormOpen(true)} className="bg-emerald-600 text-white pl-3 pr-4 py-4 rounded-r-2xl shadow-lg hover:bg-emerald-700 transition-all flex flex-col items-center gap-2 group border border-l-0 border-emerald-400">
          <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
          <span className="text-xs font-black tracking-widest text-emerald-50" style={{ writingMode: 'vertical-rl' }}>생활관 학식</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 👉 우측 윙 서랍 버튼 (셔틀버스) */}
      {/* ========================================================= */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2">
        <button onClick={() => setIsShuttleOpen(true)} className="bg-amber-500 text-white pr-3 pl-4 py-5 rounded-l-2xl shadow-lg hover:bg-amber-600 transition-all flex flex-col items-center gap-2 group border border-r-0 border-amber-300">
          <span className="text-2xl group-hover:scale-110 transition-transform drop-shadow-sm">🚌</span>
          <span className="text-xs font-black tracking-widest text-amber-50" style={{ writingMode: 'vertical-rl' }}>셔틀버스</span>
        </button>
      </div>

      {/* 서랍 열림 배경 Dimmer */}
      {(isBongrimOpen || isSarimOpen || isDormOpen || isShuttleOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] transition-opacity duration-300" 
             onClick={() => { setIsBongrimOpen(false); setIsSarimOpen(false); setIsDormOpen(false); setIsShuttleOpen(false); }}></div>
      )}
      
      {/* 💡 [봉림관 서랍] (Left) */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isBongrimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4 shadow-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-blue-600 flex items-center gap-2">🍚 봉림관 식단</h2>
            <div className="flex items-center gap-2">
              <AllergyToggleBtn />
              <button onClick={() => setIsBongrimOpen(false)} className="w-8 h-8 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 font-bold transition">✕</button>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button onClick={() => setBongrimTab('1층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '1층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>1층 (MOSS1)</button>
            <button onClick={() => setBongrimTab('2층')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${bongrimTab === '2층' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>2층 (MOSS2)</button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900">
          <AllergyGuideBox />
          {renderFoodCard(`봉림관 ${bongrimTab}`)}
        </div>
      </div>

      {/* 💡 [사림관 서랍] (Left) */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isSarimOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10 flex-wrap gap-2">
          <h2 className="text-lg font-black text-indigo-600 flex items-center gap-2">🍱 사림관 식단</h2>
          <div className="flex items-center gap-2">
            <AllergyToggleBtn />
            <button onClick={() => setIsSarimOpen(false)} className="w-8 h-8 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold transition">✕</button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900">
          <AllergyGuideBox />
          {renderFoodCard('사림관')}
        </div>
      </div>

      {/* 💡 [생활관 서랍] (Left) */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isDormOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10 flex-wrap gap-2">
          <h2 className="text-lg font-black text-emerald-600 flex items-center gap-2">🏠 생활관 식단</h2>
          <div className="flex items-center gap-2">
            <AllergyToggleBtn />
            <button onClick={() => setIsDormOpen(false)} className="w-8 h-8 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold transition">✕</button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900">
          <AllergyGuideBox />
          {renderFoodCard('생활관')}
        </div>
      </div>

      {/* 💡 [셔틀버스 서랍] (Right) */}
      <div className={`fixed top-0 right-0 h-full w-[300px] md:w-[350px] bg-gray-50 dark:bg-gray-900 shadow-[inset_4px_0_24px_rgba(0,0,0,0.05)] z-[200] transform transition-transform duration-300 ease-out flex flex-col ${isShuttleOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-lg font-black text-amber-600 flex items-center gap-2">🚌 셔틀버스 정보</h2>
          <button onClick={() => setIsShuttleOpen(false)} className="w-8 h-8 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold transition">✕</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900">
          {renderShuttleCard()}
        </div>
      </div>

      {/* ---------------- 메인 컨텐츠 영역 ---------------- */}
      <div className="relative max-w-7xl mx-auto w-full px-5 md:px-10 flex-grow flex flex-col justify-center mt-4 md:mt-0">
        
        {/* 🌤️ 날씨 위젯 */}
        <div className="flex justify-center mb-6 md:mb-8 pt-4">
          {weather && dust ? (
            <div className="inline-flex flex-wrap justify-center items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-blue-100 dark:border-gray-700 px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-sm hover:shadow-md transition-all group">
              <span className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider hidden sm:block">{current.weatherPrefix}</span>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl animate-float">{weatherData.icon}</span>
                <span className="text-base md:text-lg font-black text-gray-800 dark:text-white">{weather.temperature_2m}°C</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500">{weatherData.text}</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg">{dustData.icon}</span>
                <span className={`text-[11px] md:text-xs font-black ${dustData.color}`}>{dustData.text}</span>
                <span className="text-[10px] font-bold text-gray-400 hidden xs:inline-block">({dust.pm10}㎍/㎥)</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden xs:block"></div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-500 dark:text-blue-400">
                <span>💧</span><span>{weather.relative_humidity_2m}%</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-full text-xs font-bold text-gray-400 animate-pulse mt-4">
              ⏳ 캠퍼스 실시간 정보 로딩 중...
            </div>
          )}
        </div>

        {/* 메인 타이틀 */}
        <div className="text-center mb-10 md:mb-14 relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg">
            {current.subtitle}
          </p>
        </div>

        {/* 🚀 서비스 카드 4개 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-20">
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

        {/* 📢 공지사항 & 퀵 링크 */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-8 md:p-12 rounded-[3.5rem] border-2 border-blue-100/50 dark:border-blue-800/50 transition-colors relative overflow-hidden">
          <div className="text-center mb-16 relative z-10">
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
          <div className="relative z-10">
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

      {/* 푸터 영역 */}
      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
          {current.footerDept}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 md:mt-3">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold">
            {current.footerCopy}
          </p>
          <div className="relative group flex flex-col items-center">
            <a href="https://github.com/eryang11188/todo-app-mini-project-20222017.git" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:scale-110">
              <svg height="35" width="35" viewBox="0 0 16 16" fill="currentColor" className="opacity-80 hover:opacity-100">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;