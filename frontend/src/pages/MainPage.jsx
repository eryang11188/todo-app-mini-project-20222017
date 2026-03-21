import { Link } from 'react-router-dom';

function MainPage() {
  const services = [
    { title: "중고 마켓", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: "ToDo List", desc: "집중 타이머와 함께 일정을 관리하세요.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: "학점 계산기", desc: "실시간 그래프로 성적을 분석하세요.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  // 2. 학사정보 삭제 및 6개 항목으로 최적화 완료
  const quickLinks = [
    { name: "e캠퍼스", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻" },
    { name: "학사일정", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅" },
    { name: "학사안내", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜" }, // 겹침 방지용 📜 적용 유지
    { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚" },
    { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭" },
    { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors">
      
      <div className="flex-grow flex flex-col justify-center">
        {/* 헤더 섹션 */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 mb-4 tracking-tighter transition-colors">
            CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg transition-colors">
            창원대학교 학우들을 위한 올인원 캠퍼스 솔루션
          </p>
        </div>

        {/* 메인 서비스 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
          {services.map((s, idx) => (
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
                서비스 바로가기 →
              </div>
            </Link>
          ))}
        </div>

        {/* 통합 안내 및 퀵 링크 섹션 */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] border-2 border-blue-100/50 dark:border-blue-800/50 transition-colors relative overflow-hidden">
          
          {/* 1. 공지사항 및 와글 배치 디자인 고도화 (OFFICIAL ANNOUNCEMENTS & WA-GLE) */}
          <div className="text-center mb-12 md:mb-16 relative z-10">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-6 md:mb-8 transition-colors">
              OFFICIAL ANNOUNCEMENTS & WA-GLE
            </h4>
            {/* 모바일 세로, PC 가로 배치를 위한 flex 구조 */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
              {/* 공지사항 버튼 */}
              <a 
                href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-black text-base md:text-xl px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:text-blue-800 dark:hover:text-blue-200 transition-all border border-blue-100 dark:border-gray-700 break-keep w-full sm:w-auto"
              >
                창원대학교 공지사항 <span className="text-sm ml-1 transition-transform group-hover:translate-x-1">↗</span>
              </a>
              {/* 와글 버튼 (추가됨) */}
              <a 
                href="https://www.changwon.ac.kr/portal/main.do#" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-[#002f6c] dark:bg-blue-800 text-white font-black text-base md:text-xl px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-blue-700 dark:hover:bg-blue-700 transition-all border border-blue-900 dark:border-blue-700 break-keep w-full sm:w-auto"
              >
                와글 (포털) <span className="text-sm ml-1">↗</span>
              </a>
            </div>
          </div>

          {/* 캠퍼스 바로가기 그리드 (md:grid-cols-6 적용) */}
          <div className="relative z-10">
            <h4 className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-6 transition-colors">
              CAMPUS SHORTCUTS
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
              {quickLinks.map((link, idx) => (
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
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
    Department of Computer Science
    <span className="text-gray-400 dark:text-gray-500 font-bold mx-1 md:mx-2 hidden md:inline">|</span> 
    <br className="md:hidden"/>
    Software Engineering Project: CWNU Portal System
  </p>
  <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold mt-1 md:mt-2">
    @ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works
  </p>
</footer>
    </div>
  );
}

export default MainPage;