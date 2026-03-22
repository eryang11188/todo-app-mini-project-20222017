import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TOUR_STEPS = [
  { title: "환영합니다.", desc: "창원대학교 학우들을 위한 스마트 포털입니다.", targetId: "tour-main-header" },
  { title: "핵심 서비스", desc: "중고 마켓, ToDo, 학점 계산기를 이용할 수 있습니다.", targetId: "tour-main-services" },
  { title: "공식 소식 및 커뮤니티", desc: "학교 공지사항과 와글 포털로 이동할 수 있습니다.", targetId: "tour-main-notices" },
  { title: "캠퍼스 바로가기", desc: "e캠퍼스, 수강신청 등 주요 학사 메뉴 모음입니다.", targetId: "tour-main-shortcuts" }
];

function MainPage() {
  const [tourIndex, setTourIndex] = useState(-1);
  const [recentTodos, setRecentTodos] = useState([]);
  const [recentMarkets, setRecentMarkets] = useState([]);

  // ✅ V5 5.0 추가 로직: 실시간 대시보드 데이터 패칭
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [todoRes, marketRes] = await Promise.all([
          axios.get('/api/todo').catch(() => ({ data: [] })),
          axios.get('/api/market').catch(() => ({ data: [] }))
        ]);
        // 마감 기한이 빠른 순으로 4개 추출
        const sortedTodos = todoRes.data
          .filter(t => !t.completed)
          .sort((a, b) => new Date(a.todoDeadline || '9999') - new Date(b.todoDeadline || '9999'))
          .slice(0, 4);
        // 최신 등록 순으로 4개 추출
        const sortedMarkets = marketRes.data
          .filter(m => !m.completed)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 4);
        
        setRecentTodos(sortedTodos);
        setRecentMarkets(sortedMarkets);
      } catch (error) {
        console.error("대시보드 데이터 연동 실패", error);
      }
    };
    fetchDashboardData();
  }, []);

  const services = [
    { title: "중고 마켓", desc: "학우들과의 원활한 물품 거래를 지원합니다.", short: "MARKET", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: "ToDo List", desc: "집중 타이머를 활용한 일정 관리 시스템입니다.", short: "TODO", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: "학점 계산기", desc: "실시간 그래프 기반 성적 분석 도구입니다.", short: "GPA", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  const quickLinks = [
    { name: "e캠퍼스", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", initial: "E" },
    { name: "학사일정", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", initial: "C" },
    { name: "학사안내", url: "https://www.changwon.ac.kr/haksa/main.do", initial: "I" }, 
    { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", initial: "R" },
    { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", initial: "D" },
    { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", initial: "A" },
  ];

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < TOUR_STEPS.length) {
      const el = document.getElementById(TOUR_STEPS[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  }, [tourIndex]);

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors relative">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 도움말 투어 모달 */}
      {tourIndex >= 0 && (
        <div className="fixed z-[150] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">건너뛰기</button>
            <button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">{tourIndex === TOUR_STEPS.length - 1 ? "투어 종료" : "다음 단계"}</button>
          </div>
        </div>
      )}

      {/* ✅ V5 5.0 PC 전용 좌측 사이드바: TODO 대시보드 */}
      <aside className="hidden xl:flex flex-col fixed left-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-xl z-40 transition-colors">
        <h3 className="font-black text-xs text-indigo-600 dark:text-indigo-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 tracking-widest uppercase">Todo Dashboard</h3>
        <div className="flex flex-col gap-3">
          {recentTodos.length > 0 ? recentTodos.map(todo => (
            <Link key={todo._id} to="/todo" className="group flex flex-col bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
              <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{todo.title}</span>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-1">{todo.importance}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">예정된 미션이 없습니다.</p>}
        </div>
      </aside>

      {/* ✅ V5 5.0 PC 전용 우측 사이드바: MARKET 대시보드 */}
      <aside className="hidden xl:flex flex-col fixed right-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-xl z-40 transition-colors">
        <h3 className="font-black text-xs text-blue-600 dark:text-blue-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 tracking-widest uppercase">Market Updates</h3>
        <div className="flex flex-col gap-3">
          {recentMarkets.length > 0 ? recentMarkets.map(item => (
            <Link key={item._id} to="/market" className="group flex flex-col bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300">{item.title}</span>
              <span className={`text-[10px] font-black mt-1 ${item.price === 0 ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>{item.price === 0 ? "무료 나눔" : `${Number(item.price).toLocaleString()}원`}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">최근 등록된 물품이 없습니다.</p>}
        </div>
      </aside>

      <div className="flex-grow flex flex-col justify-center max-w-4xl mx-auto w-full">
        {/* 헤더 섹션 */}
        <div id="tour-main-header" className="text-center mb-8 md:mb-12 relative">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter transition-colors">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
              Guide
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base transition-colors tracking-tight">
            창원대학교 종합 학사 지원 및 편의 시스템
          </p>
        </div>

        {/* ✅ V5 5.0 모바일 전용 알림 바 (Ticker) */}
        <div className="xl:hidden w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl mb-8 flex flex-col gap-2 shadow-sm">
          <div className="font-black text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase">System Updates</div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {recentTodos.map(todo => (
              <Link key={`mob-${todo._id}`} to="/todo" className="flex-shrink-0 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-2 max-w-[200px]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{todo.title}</span>
              </Link>
            ))}
            {recentMarkets.map(item => (
              <Link key={`mob-${item._id}`} to="/market" className="flex-shrink-0 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-2 max-w-[200px]">
                <span className={`w-1.5 h-1.5 rounded-full ${item.price === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{item.title}</span>
              </Link>
            ))}
            {(recentTodos.length === 0 && recentMarkets.length === 0) && <span className="text-xs text-gray-400 font-bold">최신 업데이트 항목이 없습니다.</span>}
          </div>
        </div>

        {/* 메인 서비스 카드 그리드 */}
        <div id="tour-main-services" className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mb-10 md:mb-16">
          {services.map((s, idx) => (
            <Link 
              key={idx} 
              to={s.path} 
              className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1.5 border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${s.color}`}></div>
              <div>
                <div className={`text-2xl md:text-3xl font-black mb-4 md:mb-5 group-hover:scale-105 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r ${s.color} uppercase tracking-widest`}>{s.short}</div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mb-6 leading-relaxed break-keep">{s.desc}</p>
              </div>
              <div className={`inline-block w-max px-5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-black text-[10px] md:text-xs shadow-sm border border-gray-100 dark:border-gray-600 group-hover:bg-gradient-to-r group-hover:${s.color} group-hover:text-white group-hover:border-transparent transition-all`}>
                Enter System
              </div>
            </Link>
          ))}
        </div>

        {/* 통합 안내 및 퀵 링크 섹션 */}
        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-700 transition-colors relative overflow-hidden">
          
          <div id="tour-main-notices" className="mb-10 md:mb-12 relative z-10">
            <h4 className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 transition-colors border-l-4 border-gray-300 dark:border-gray-600 pl-3">
              Official Announcements
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" target="_blank" rel="noreferrer" className="flex-1 bg-white dark:bg-gray-800 text-[#002f6c] dark:text-blue-400 font-black text-sm md:text-base px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 text-center w-full">
                창원대학교 공지사항
              </a>
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" className="flex-1 bg-[#002f6c] dark:bg-blue-800 text-white font-black text-sm md:text-base px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-900 dark:border-blue-700 text-center w-full">
                와글 포털 접속
              </a>
            </div>
          </div>

          <div id="tour-main-shortcuts" className="relative z-10">
            <h4 className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 transition-colors border-l-4 border-gray-300 dark:border-gray-600 pl-3">
              Campus Shortcuts
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                  <span className="text-lg md:text-xl font-black text-gray-300 dark:text-gray-600 mb-1 group-hover:text-blue-500 transition-colors">{link.initial}</span>
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 text-center break-keep transition-colors">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 relative z-10 transition-colors w-full">
        <p className="text-gray-500 dark:text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1.5 break-keep leading-relaxed">
          Department of Computer Science
          <span className="text-gray-300 dark:text-gray-600 font-bold mx-2 hidden md:inline">|</span> 
          <br className="md:hidden"/>
          Software Engineering Project
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mt-2">
          © 2026 Jung Yi Ryang. System Version 5.0
        </p>
      </footer>
    </div>
  );
}

export default MainPage;