import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, LineController, BarController } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, LineController, BarController );

const GRADE_POINTS = { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': null, 'NP': null };
const CREDIT_OPTIONS = [0, 1, 2, 3, 4];
const SEMESTERS = ['1학년 1학기', '1학년 여름방학', '1학년 2학기', '1학년 겨울방학', '2학년 1학기', '2학년 여름방학', '2학년 2학기', '2학년 겨울방학', '3학년 1학기', '3학년 여름방학', '3학년 2학기', '3학년 겨울방학', '4학년 1학기', '4학년 여름방학', '4학년 2학기', '4학년 겨울방학', '5학년 1학기', '5학년 여름방학', '5학년 2학기', '5학년 겨울방학', '6학년 1학기', '6학년 여름방학', '6학년 2학기', '6학년 겨울방학', '기타학기'];

const TOUR_STEPS = [
  { title: "👋 CWNU GPA 오픈!", desc: "탭 인터페이스로 깔끔해진 성적 관리 도구입니다.", targetId: "tour-header" }, 
  { title: "📈 분석 그래프", desc: "학기별 추이를 한눈에 확인하세요.", targetId: "tour-chart" }, 
  { title: "📊 대시보드", desc: "전체, 전공, 최근 평점을 분석해드립니다.", targetId: "tour-dashboard" }, 
  { title: "📝 스마트 성적 등록", desc: "과목명, 학점, 성적을 입력하고 전공 여부를 체크하세요.", targetId: "tour-form" },
  { title: "📑 학기 탭 & 성적표", desc: "학기를 클릭하여 해당 학기의 성적표를 관리하세요.", targetId: "tour-list" }
];

function GpaPage() {
  const STORAGE_KEY = 'cwnu_gpa_v3';
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  const [activeTab, setActiveTab] = useState(SEMESTERS[0]);
  const [form, setForm] = useState({ semester: SEMESTERS[0], name: '', credit: 3, grade: 'A+', isMajor: false });
  const [tourIndex, setTourIndex] = useState(-1); const [editingId, setEditingId] = useState(null); const [editForm, setEditForm] = useState({});
  const [showVersionInfo, setShowVersionInfo] = useState(false); const [showModalConfetti, setShowModalConfetti] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }, [courses]);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < TOUR_STEPS.length) {
      const el = document.getElementById(TOUR_STEPS[tourIndex].targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-[4px]', 'md:ring-[6px]', 'ring-emerald-400', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl', 'md:rounded-[2.5rem]');
        return () => el.classList.remove('ring-[4px]', 'md:ring-[6px]', 'ring-emerald-400', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl', 'md:rounded-[2.5rem]');
      }
    }
  }, [tourIndex]);

  const calc = (list) => {
    if (!list || list.length === 0) return { credits: 0, gpa: '0.00' };
    const earned = list.reduce((acc, c) => (c.grade !== 'F' && c.grade !== 'NP') ? acc + c.credit : acc, 0);
    const gpaCredits = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + c.credit : acc, 0);
    const pts = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + (c.credit * GRADE_POINTS[c.grade]) : acc, 0);
    return { credits: earned, gpa: gpaCredits === 0 ? '0.00' : (pts / gpaCredits).toFixed(2) };
  };

  const entireGpa = calc(courses);
  const majorGpa = calc(courses.filter(c => c.isMajor));
  
  const groupedCourses = useMemo(() => {
    return SEMESTERS.map(sem => ({
      semester: sem,
      courses: courses.filter(c => c.semester === sem),
      summary: calc(courses.filter(c => c.semester === sem))
    })).filter(g => g.courses.length > 0);
  }, [courses]);

  const recentGpa = groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.gpa : '0.00';
  const recentCredits = groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.credits : 0;

  const activeSemesterCourses = courses.filter(c => c.semester === activeTab);
  const activeSemesterSummary = calc(activeSemesterCourses);

  const chartData = {
    labels: groupedCourses.map(g => g.semester),
    datasets: [
      { type: 'bar', label: '이수 학점', data: groupedCourses.map(g => g.summary.credits), backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: 'rgb(16, 185, 129)', borderWidth: 1, yAxisID: 'y', order: 2 },
      { type: 'line', label: '학기 평점', data: groupedCourses.map(g => g.summary.gpa), borderColor: '#ef4444', borderWidth: 3, pointBackgroundColor: 'white', pointBorderColor: '#ef4444', pointRadius: 5, tension: 0.3, yAxisID: 'y1', order: 1 }
    ]
  };

  const addCourse = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("과목명을 입력해주세요!");
    setCourses([...courses, { ...form, id: Date.now(), credit: parseInt(form.credit) }]);
    setForm({ ...form, name: '', credit: 3, grade: 'A+', isMajor: false });
  };

  const saveEdit = () => {
    setCourses(courses.map(c => c.id === editingId ? { ...editForm, credit: parseInt(editForm.credit) } : c));
    setEditingId(null);
  };

  return (
    // 📱 모바일: p-4 / PC: p-6
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-emerald-400 w-[90%] md:w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-emerald-600 dark:text-emerald-400 font-black mb-1 text-[10px] uppercase">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-400 font-bold text-xs hover:text-gray-200">건너뛰기</button><button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-emerald-600 dark:bg-emerald-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md">다음 ▶</button></div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-emerald-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            <h3 className="text-2xl md:text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-center">🚀 GPA V5_super_4.0 ver 업데이트 내역</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8 mt-4 md:mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-base md:text-lg mb-3 md:mb-4 text-center">🤔 이전 버전</h4>
                <ul className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 space-y-2 md:space-y-3">
                  <li>❌ 학점 계산기가 전무하여 와글에서 수동 확인</li>
                  <li>❌ 복잡하게 나열된 성적 입력 양식</li>
                  <li>❌ 통계 분석 및 그래프 도구 부재</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-inner">
                <h4 className="text-emerald-600 dark:text-emerald-400 font-black text-base md:text-lg mb-3 md:mb-4 text-center">✨ 현재 버전 (v5)</h4>
                <ul className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 space-y-2 md:space-y-3">
                  <li>✅ <span className="text-emerald-600 dark:text-emerald-400 font-black">학기 탭 기반 인터페이스</span>로 깔끔한 관리</li>
                  <li>✅ 3단 대시보드(전체/전공/최근) 구축</li>
                  <li>✅ 학기별 이수/평점 시각화 <span className="text-emerald-600 dark:text-emerald-400 font-black">분석 그래프 추가</span></li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 border-green-200 dark:border-green-800 text-center mb-6 md:mb-8 shadow-inner relative overflow-hidden">
                <h4 className="text-xl md:text-2xl font-black text-green-800 dark:text-green-400 mb-2">🎁 "이것도 유료인가요?"</h4>
                <p className="text-green-700 dark:text-green-300 font-bold text-xs md:text-sm">아닙니다! 창대인을 위한 <span className="font-black text-base md:text-lg">완전 무료</span> 서비스입니다!<br/> 체계적인 학점 관리로 완벽한 성적표를 만들어보세요!</p>
            </div>

            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black dark:hover:bg-gray-600 transition">확인 완료! 직접 써보기</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-6 md:mb-8 relative mt-4 md:mt-0">
          <button onClick={() => setTourIndex(0)} className="absolute -top-4 md:top-0 right-0 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-black text-[10px] md:text-xs animate-pulse">💡 가이드 시작</button>
          <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 mb-2 md:mb-3 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
            CWNU GPA <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 italic text-2xl md:text-4xl animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 transition-transform duration-300 drop-shadow-lg">V5_super_4.0</span>
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-[10px] md:text-xs mb-3 cursor-pointer hover:text-emerald-400 transition" onClick={() => setShowVersionInfo(true)}>(업데이트 내역을 보려면 V5를 클릭하세요!)</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm bg-emerald-50 dark:bg-emerald-900/30 inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full shadow-inner border border-emerald-100 dark:border-emerald-800">🔒 성적 정보는 오직 기기에만 보관됩니다.</p>
        </div>

        {/* 📱 모바일 차트 높이/여백 조정: h-72, p-5 */}
        <div id="tour-chart" className="bg-white dark:bg-gray-800 p-5 md:p-10 rounded-3xl md:rounded-[3rem] shadow-lg border-2 border-emerald-50 dark:border-gray-700 mb-8 md:mb-10 h-72 md:h-96 relative z-10 w-full">
           <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2 md:gap-3"><span className="text-2xl md:text-3xl">📈</span> 학기별 성적 추이 분석</h3>
          {groupedCourses.length < 1 ? <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 font-bold text-xs md:text-sm bg-gray-50 dark:bg-gray-700 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">성적을 등록하면 그래프가 생성됩니다.</div> : <Chart type='bar' data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { padding: 10, color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(156, 163, 175, 0.1)' } }, y1: { position: 'right', min: 0, max: 4.5, ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(156, 163, 175, 0.1)' } }, y: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(156, 163, 175, 0.1)' } } }, plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } } }} />}
        </div>

        {/* 📱 대시보드 박스 패딩/글씨 축소: p-6, text-5xl */}
        <div id="tour-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 relative z-10">
          <div className="bg-[#111] dark:bg-gray-900 p-6 md:px-10 md:py-10 rounded-3xl md:rounded-[3rem] shadow-2xl border-b-[8px] md:border-b-[10px] border-emerald-900 flex flex-col justify-center items-center text-white">
            <h3 className="text-gray-400 font-black text-xs md:text-sm uppercase mb-2 md:mb-3">전체평점 (CGPA)</h3>
            <div className="text-5xl md:text-6xl font-black font-mono text-emerald-400">{entireGpa.gpa}</div>
            <p className="text-xs md:text-sm font-bold text-gray-500 mt-2 md:mt-3">총 {entireGpa.credits}학점 이수</p>
            <div className="w-full bg-gray-800 h-1.5 md:h-2 rounded-full mt-3 md:mt-4 overflow-hidden"><div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${(parseFloat(entireGpa.gpa) / 4.5) * 100}%` }}></div></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border-2 border-emerald-100 dark:border-gray-700 flex flex-col justify-center items-center text-gray-800 dark:text-gray-100">
            <h3 className="text-emerald-600 dark:text-emerald-400 font-black text-xs md:text-sm uppercase mb-2 md:mb-3">전공 평점</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{majorGpa.gpa}</div>
            <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 md:mt-3">전공 {majorGpa.credits}학점 이수</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border-2 border-emerald-50 dark:border-gray-700 flex flex-col justify-center items-center text-gray-600 dark:text-gray-300">
            <h3 className="text-gray-400 font-black text-xs md:text-sm uppercase mb-2 md:mb-3">최근학기 평점</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{recentGpa}</div>
            <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 md:mt-3">최근 {recentCredits}학점 이수</p>
          </div>
        </div>

        {/* 📱 입력 폼: 모바일 세로 1줄 배열로 자동 변경 */}
        <form id="tour-form" onSubmit={addCourse} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-8 md:mb-10 items-center relative z-10 w-full">
          <select value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})} className="md:col-span-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-gray-700 dark:text-white outline-none border border-gray-100 dark:border-gray-600 focus:ring-2 ring-emerald-200 w-full">{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <input placeholder="과목명" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="md:col-span-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:rounded-2xl outline-none font-black text-gray-800 dark:text-white focus:bg-emerald-50 dark:focus:bg-emerald-900/30 transition-colors text-sm md:text-lg border border-gray-100 dark:border-gray-600 focus:border-emerald-200 dark:focus:border-emerald-500 w-full"/>
          <div className="md:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
            <select value={form.credit} onChange={e=>setForm({...form, credit: e.target.value})} className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-gray-700 dark:text-white outline-none border border-gray-100 dark:border-gray-600 focus:ring-2 ring-emerald-200">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}학점</option>)}</select>
            <select value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="p-3 md:p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl md:rounded-2xl font-black text-sm md:text-lg text-emerald-700 dark:text-emerald-400 outline-none border border-emerald-100 dark:border-emerald-800 focus:ring-2 ring-emerald-300">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4 md:h-full">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition h-full"><input type="checkbox" checked={form.isMajor} onChange={e=>setForm({...form, isMajor: e.target.checked})} className="w-4 h-4 md:w-5 md:h-5 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-xs md:text-sm text-gray-600 dark:text-gray-300">전공</span></label>
            <button className="bg-emerald-600 dark:bg-emerald-500 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-lg tracking-widest h-full">등록</button>
          </div>
        </form>

        <div id="tour-list" className="mb-6 w-full">
          {/* 📱 탭 스크롤 여백 조절 */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide relative z-10 w-full">{SEMESTERS.map(sem => { const has = courses.some(c => c.semester === sem); return ( <button key={sem} onClick={() => setActiveTab(sem)} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full whitespace-nowrap font-black text-[10px] md:text-xs transition-all shadow-sm ${activeTab === sem ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md' : has ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}> {sem} {has && '•'} </button> ); })}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] shadow-xl border-2 border-emerald-100 dark:border-gray-700 mb-10 relative z-10 w-full overflow-hidden">
            <div className="bg-[#f8fafc] dark:bg-gray-900/50 p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="font-black text-gray-800 dark:text-white flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base">
                {activeTab} 상세
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs shadow-sm border border-emerald-200 dark:border-emerald-800">
                  총 {activeSemesterSummary.credits}학점 (평점: {activeSemesterSummary.gpa})
                </span>
              </div>
              {activeSemesterCourses.length > 0 && <button onClick={()=>{ if(window.confirm(`${activeTab} 모든 성적을 삭제하시겠습니까?`)) setCourses(courses.filter(c => c.semester !== activeTab)); }} className="bg-white dark:bg-gray-800 text-red-500 border border-red-200 dark:border-red-900/50 px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">🗑️ 학기 삭제</button>}
            </div>

            {/* 🚨 핵심 포인트: 모바일 가로 스크롤 (overflow-x-auto) 및 최소 너비 설정 */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[9px] md:text-[10px] font-black tracking-widest uppercase border-b border-gray-100 dark:border-gray-700">
                  <tr><th className="p-3 md:p-5">분류</th><th className="p-3 md:p-5 text-left">과목명</th><th className="p-3 md:p-5">학점</th><th className="p-3 md:p-5">성적</th><th className="p-3 md:p-5">관리</th></tr>
                </thead>
                <tbody>
                  {activeSemesterCourses.map(course => (
                    <tr key={course.id} className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${editingId === course.id ? 'bg-yellow-50/50 dark:bg-yellow-900/20' : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'}`}>
                      {editingId === course.id ? (
                        <td colSpan="5" className="p-3 md:p-4 bg-yellow-50/50 dark:bg-yellow-900/20 relative z-10">
                          <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border-2 border-yellow-200 dark:border-yellow-700 shadow-inner">
                            <select value={editForm.semester} onChange={e=>setEditForm({...editForm, semester: e.target.value})} className="w-full sm:w-auto p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs text-gray-700 dark:text-white outline-none border dark:border-gray-600">{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <input value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full sm:flex-grow p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-gray-800 dark:text-white outline-none border dark:border-gray-600 focus:ring-2 ring-emerald-200"/>
                            <div className="flex w-full sm:w-auto gap-2">
                              <select value={editForm.credit} onChange={e=>setEditForm({...editForm, credit: e.target.value})} className="flex-1 p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs text-gray-700 dark:text-white outline-none border dark:border-gray-600">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}학점</option>)}</select>
                              <select value={editForm.grade} onChange={e=>setForm({...editForm, grade: e.target.value})} className="flex-1 p-2 md:p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 outline-none border dark:border-emerald-800">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
                            </div>
                            <div className="flex w-full sm:w-auto gap-2 items-center justify-between">
                              <label className="flex items-center gap-1.5 cursor-pointer bg-gray-100 dark:bg-gray-700 px-3 py-2 md:py-3 rounded-lg md:rounded-xl border dark:border-gray-600 text-[10px] md:text-xs flex-grow justify-center"><input type="checkbox" checked={editForm.isMajor} onChange={e=>setEditForm({...editForm, isMajor: e.target.checked})} className="w-3 h-3 md:w-4 md:h-4 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-gray-600 dark:text-gray-300">전공</span></label>
                              <div className="flex gap-1.5">
                                <button onClick={saveEdit} className="bg-emerald-600 dark:bg-emerald-500 text-white px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs hover:bg-emerald-700 transition shadow-sm">저장</button>
                                <button onClick={()=>setEditingId(null)} className="bg-gray-400 dark:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs hover:bg-gray-500 transition shadow-sm">취소</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="p-3 md:p-5 flex justify-center items-center h-full"><label className="flex items-center gap-1.5 md:gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"><input type="checkbox" checked={course.isMajor} onChange={e=>{ setCourses(courses.map(c => c.id === course.id ? { ...c, isMajor: e.target.checked } : c)); }} className="w-3 h-3 md:w-4 md:h-4 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-[9px] md:text-[10px] text-gray-600 dark:text-gray-300">전공</span></label></td>
                          <td className="p-3 md:p-5 text-left font-black text-gray-800 dark:text-white text-sm md:text-lg">{course.name}</td>
                          <td className="p-3 md:p-5 font-bold text-gray-500 dark:text-gray-400 text-xs md:text-sm">{course.credit}학점</td>
                          <td className="p-3 md:p-5 font-black text-base md:text-xl text-emerald-600 dark:text-emerald-400">{course.grade}</td>
                          <td className="p-3 md:p-5 flex justify-center gap-1.5 md:gap-2">
                            <button onClick={()=>{setEditingId(course.id); setEditForm(course)}} className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition">수정</button>
                            <button onClick={()=>{if(window.confirm('삭제하시겠습니까?')) setCourses(courses.filter(i=>i.id!==course.id))}} className="text-[9px] md:text-[10px] font-black uppercase text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition">Del</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {activeSemesterCourses.length === 0 && <tr><td colSpan="5" className="p-10 md:p-20 text-gray-400 dark:text-gray-500 font-bold text-xs md:text-base">해당 학기에 등록된 성적이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-8 md:mt-10 relative z-10"><p className="text-gray-500 dark:text-gray-600 font-black text-xs md:text-base tracking-widest md:tracking-[0.2em] mb-1 md:mb-2 uppercase">Software Engineering Project: CWNU Portal System</p><p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold tracking-wider md:tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p></footer>
    </div>
  );
}

export default GpaPage;