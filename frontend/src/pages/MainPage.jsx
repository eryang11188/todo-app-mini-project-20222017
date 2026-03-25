import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MainPage({ lang }) {
  const [tourIndex, setTourIndex] = useState(-1);

  const t = {
    ko: {
      subtitle: "창원대학교 학우들을 위한 올인원 캠퍼스 솔루션",
      help: "💡 도움말",
      tourEnd: "투어 종료 🎉",
      tourSkip: "건너뛰기",
      tourNext: "다음 보기 ▶",
      serviceGo: "바로가기 →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE",
      noticeBtn1: "창원대학교 공지사항",
      noticeBtn2: "와글 (포털)",
      shortcutTitle: "CAMPUS SHORTCUTS",
      // ✅ 워터마크 한국어 번역 적용
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템",
      footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      tourSteps: [
        { title: "👋 환영합니다!", desc: "창원대 학우들을 위한 스마트 포털입니다.", targetId: "tour-main-header" },
        { title: "🚀 핵심 서비스", desc: "중고 마켓, ToDo, 학점 계산기를 바로 이용해보세요.", targetId: "tour-main-services" },
        { title: "📢 공식 소식 & 와글", desc: "학교 공지사항과 와글 포털로 바로 이동할 수 있습니다.", targetId: "tour-main-notices" },
        { title: "🏫 캠퍼스 퀵 링크", desc: "e캠퍼스, 수강신청 등 자주 찾는 메뉴를 모아두었습니다.", targetId: "tour-main-shortcuts" }
      ],
      services: [
        { title: "중고 마켓", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
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
    },
    en: {
      subtitle: "All-in-one Campus Solution for CWNU Students",
      help: "💡 Guide",
      tourEnd: "End Tour 🎉",
      tourSkip: "Skip",
      tourNext: "Next ▶",
      serviceGo: "Go to Service →",
      noticeTitle: "OFFICIAL ANNOUNCEMENTS & WAGLE",
      noticeBtn1: "CWNU Notice Board",
      noticeBtn2: "Wagle (Portal)",
      shortcutTitle: "CAMPUS SHORTCUTS",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System",
      footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      tourSteps: [
        { title: "👋 Welcome!", desc: "Smart portal for CWNU students.", targetId: "tour-main-header" },
        { title: "🚀 Core Services", desc: "Try Flea Market, ToDo, and GPA Calculator.", targetId: "tour-main-services" },
        { title: "📢 Official News", desc: "Quick access to university notices and Wagle.", targetId: "tour-main-notices" },
        { title: "🏫 Quick Links", desc: "Shortcuts to e-Campus, course registration, etc.", targetId: "tour-main-shortcuts" }
      ],
      services: [
        { title: "Flea Market", desc: "Share items happily with peers.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
        { title: "ToDo List", desc: "Manage tasks with a focus timer.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
        { title: "GPA Calculator", desc: "Analyze grades with real-time graphs.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" }
      ],
      quickLinks: [
        { name: "e-Campus", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻" },
        { name: "Schedule", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅" },
        { name: "Academic Info", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜" }, 
        { name: "Course Reg.", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
        { name: "Dream Catch", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
        { name: "E-Dream", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" }
      ]
    }
  };

  const current = t[lang];

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  }, [tourIndex, current.tourSteps]);

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors relative">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[150] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{current.tourSkip}</button>
            <button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col justify-center">
        <div id="tour-main-header" className="text-center mb-10 md:mb-16 relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter transition-colors">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all">
              {current.help}
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg transition-colors">
            {current.subtitle}
          </p>
        </div>

        <div id="tour-main-services" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
          {current.services.map((s, idx) => (
            <Link 
              key={idx} 
              to={s.path} 
              className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 md:hover:-translate-y-4 border-2 border-gray-50 dark:border-gray-700"
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${s.color}`}></div>
              <div className="text-5xl md:text-7xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2 md:mb-3">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base mb-6 md:mb-8 leading-relaxed">{s.desc}</p>
              <div className={`inline-block px-5 md:px-6 py-2 rounded-full bg-gradient-to-r ${s.color} text-white font-black text-xs md:text-sm shadow-md`}>
                {current.serviceGo}
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] border-2 border-blue-100/50 dark:border-blue-800/50 transition-colors relative overflow-hidden">
          <div id="tour-main-notices" className="text-center mb-12 md:mb-16 relative z-10 p-4">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-6 md:mb-8 transition-colors">
              {current.noticeTitle}
            </h4>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
              <a 
                href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-black text-base md:text-xl px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:text-blue-800 dark:hover:text-blue-200 transition-all border border-blue-100 dark:border-gray-700 break-keep w-full sm:w-auto"
              >
                {current.noticeBtn1} <span className="text-sm ml-1 transition-transform group-hover:translate-x-1">↗</span>
              </a>
              <a 
                href="https://www.changwon.ac.kr/portal/main.do#" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-[#002f6c] dark:bg-blue-800 text-white font-black text-base md:text-xl px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-blue-700 dark:hover:bg-blue-700 transition-all border border-blue-900 dark:border-blue-700 break-keep w-full sm:w-auto"
              >
                {current.noticeBtn2} <span className="text-sm ml-1">↗</span>
              </a>
            </div>
          </div>

          <div id="tour-main-shortcuts" className="relative z-10 p-4">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-6 transition-colors">
              {current.shortcutTitle}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
              {current.quickLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all group"
                >
                  <span className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300 text-center break-keep transition-colors">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
  {/* 1. 학과 정보 */}
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
    {current.footerDept}
  </p>

  {/* 2. 저작권 문구 + 툴팁 기능이 있는 깃허브 아이콘 */}
  <div className="flex items-center justify-center gap-4 mt-2 md:mt-3">
    <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold">
      {current.footerCopy}
    </p>
    
    {/* 💡 툴팁 구현을 위한 group 클래스 추가 */}
    <div className="relative group flex flex-col items-center">
      <a 
        href="https://github.com/eryang11188/todo-app-mini-project-20222017.git" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:scale-110"
      >
        {/* 요청하신 사이즈 35px 적용 */}
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

      {/* ✨ 마우스를 올리면(hover) 나타나는 툴팁 박스 */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center animate-bounce">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 dark:bg-gray-700 shadow-lg rounded-md font-bold">
          Github
        </span>
        {/* 삼각형 꼬리 */}
        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

export default MainPage;