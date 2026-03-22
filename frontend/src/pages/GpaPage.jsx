import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, LineController, BarController } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, LineController, BarController );

const GRADE_POINTS = { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': null, 'NP': null };
const CREDIT_OPTIONS = [0, 1, 2, 3, 4];
const SEMESTERS = ['1학년 1학기', '1학년 여름방학', '1학년 2학기', '1학년 겨울방학', '2학년 1학기', '2학년 여름방학', '2학년 2학기', '2학년 겨울방학', '3학년 1학기', '3학년 여름방학', '3학년 2학기', '3학년 겨울방학', '4학년 1학기', '4학년 여름방학', '4학년 2학기', '4학년 겨울방학', '5학년 1학기', '5학년 여름방학', '5학년 2학기', '5학년 겨울방학', '6학년 1학기', '6학년 여름방학', '6학년 2학기', '6학년 겨울방학', '기타학기'];

// ✅ 학기 표시용 포매터 (실제 데이터는 한글 유지, 화면만 영어로 변환)
const displaySem = (sem, lang) => {
  if (lang === 'ko') return sem;
  if (!sem) return '';
  return sem.replace('학년 ', ' Yr ').replace('학기', ' Sem').replace('여름방학', ' Summer').replace('겨울방학', ' Winter').replace('기타학기', 'Other');
};

function GpaPage({ lang }) {
  const STORAGE_KEY = 'cwnu_gpa_v3';
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  const [activeTab, setActiveTab] = useState(SEMESTERS[0]);
  const [form, setForm] = useState({ semester: SEMESTERS[0], name: '', credit: 3, grade: 'A+', isMajor: false });
  const [tourIndex, setTourIndex] = useState(-1); 
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({});
  const [showVersionInfo, setShowVersionInfo] = useState(false); 
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showModalConfetti, setShowModalConfetti] = useState(false);

  const [simTargetGpa, setSimTargetGpa] = useState(4.0);
  const [simNextCredits, setSimNextCredits] = useState(18);

  // ✅ 다국어 사전 (i18n)
  const t = {
    ko: {
      tourSteps: [
        { title: "👋 GPA 오픈!", desc: "탭 인터페이스로 깔끔해진 성적 관리 도구입니다.", targetId: "tour-header" }, 
        { title: "📈 분석 그래프", desc: "학기별 추이를 한눈에 확인하세요.", targetId: "tour-chart" }, 
        { title: "📊 대시보드", desc: "전체, 전공, 최근 평점을 분석해드립니다.", targetId: "tour-dashboard" }, 
        { title: "📝 스마트 성적 등록", desc: "과목명, 학점, 성적을 입력하고 전공 여부를 체크하세요.", targetId: "tour-form" },
        { title: "📑 학기 탭 & 성적표", desc: "학기를 클릭하여 해당 학기의 성적표를 관리하세요.", targetId: "tour-list" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 ▶", help: "💡 도움말", verCheck: "(버전 클릭 시 업데이트 내역 확인)",
      secTitle: "데이터 보안 안내", secBtn: "안심하고 확인 완료!",
      chartTitle: "성적 추이 분석", chartBtn: "📥 엑셀(CSV) 저장", chartEmpty: "성적을 등록하면 그래프가 생성됩니다.", chartCredits: "이수 학점", chartGpa: "학기 평점",
      dbAll: "전체평점 (CGPA)", dbMajor: "전공 평점", dbRecent: "최근학기 평점", dbEarned: "총 {c}학점 이수", dbEarnedMajor: "전공 {c}학점 이수", dbEarnedRecent: "최근 {c}학점 이수",
      simTitle: "목표 학점 시뮬레이터", simDesc: "다음 학기에 몇 점을 받아야 원하는 전체 평점(CGPA)을 만들 수 있을까요?", simTarget: "목표 평점", simExpected: "예정 학점", simResultTitle: "다음 학기 필요 평균",
      simEmpty: "성적을 먼저 등록해주세요.", simImp: "올 A+ 받아도 부족해요😭", simReq: "(필요 평점: {r})", simSafe: "F만 안 받으면 달성!🎉",
      formName: "과목명", formCredit: "학점", formMajor: "전공", formBtn: "등록", alertName: "과목명을 입력해주세요!",
      listTotal: "총 {c}학점 (평점: {g})", listDelBtn: "🗑️ 학기 삭제", listDelConfirm: "{s} 모든 성적을 삭제하시겠습니까?",
      thType: "분류", thName: "과목명", thCredit: "학점", thGrade: "성적", thAction: "관리",
      btnSave: "저장", btnCancel: "취소", btnEdit: "수정", btnDel: "Del", emptyList: "해당 학기에 등록된 성적이 없습니다.", delConfirm: "삭제하시겠습니까?",
      csvHeader: "학기,과목명,학점,성적,전공여부", csvMajor: "전공", csvElective: "교양",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works"
    },
    en: {
      tourSteps: [
        { title: "👋 GPA Open!", desc: "Clean grade management with tab interface.", targetId: "tour-header" }, 
        { title: "📈 Analysis Chart", desc: "Check your semester trends at a glance.", targetId: "tour-chart" }, 
        { title: "📊 Dashboard", desc: "Analyzes CGPA, Major, and Recent GPA.", targetId: "tour-dashboard" }, 
        { title: "📝 Smart Reg.", desc: "Enter course, credits, grade, and major status.", targetId: "tour-form" },
        { title: "📑 Tabs & Transcript", desc: "Click a semester to manage its transcript.", targetId: "tour-list" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", help: "💡 Guide", verCheck: "(Click version to check updates)",
      secTitle: "Data Security Guide", secBtn: "Confirmed & Safe!",
      chartTitle: "GPA Trend Analysis", chartBtn: "📥 Export CSV", chartEmpty: "Register grades to see the chart.", chartCredits: "Earned Credits", chartGpa: "Semester GPA",
      dbAll: "Cumulative (CGPA)", dbMajor: "Major GPA", dbRecent: "Recent GPA", dbEarned: "Total {c} credits", dbEarnedMajor: "Major {c} credits", dbEarnedRecent: "Recent {c} credits",
      simTitle: "Target GPA Simulator", simDesc: "What grades do you need next semester to achieve your target CGPA?", simTarget: "Target GPA", simExpected: "Exp. Credits", simResultTitle: "Required Avg Next Sem",
      simEmpty: "Please register grades first.", simImp: "Impossible even with all A+😭", simReq: "(Required: {r})", simSafe: "Safe as long as no F!🎉",
      formName: "Course Name", formCredit: " Cr", formMajor: "Major", formBtn: "Add", alertName: "Please enter the course name!",
      listTotal: "Total {c} Cr (GPA: {g})", listDelBtn: "🗑️ Delete Sem", listDelConfirm: "Delete all records for {s}?",
      thType: "Type", thName: "Course Name", thCredit: "Credits", thGrade: "Grade", thAction: "Action",
      btnSave: "Save", btnCancel: "Cancel", btnEdit: "Edit", btnDel: "Del", emptyList: "No grades registered for this semester.", delConfirm: "Are you sure you want to delete?",
      csvHeader: "Semester,Course Name,Credits,Grade,Major/Elective", csvMajor: "Major", csvElective: "Elective",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works"
    }
  };
  const current = t[lang];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }, [courses]);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-[4px]', 'md:ring-[6px]', 'ring-emerald-400', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl', 'md:rounded-[2.5rem]');
        return () => el.classList.remove('ring-[4px]', 'md:ring-[6px]', 'ring-emerald-400', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl', 'md:rounded-[2.5rem]');
      }
    }
  }, [tourIndex, current.tourSteps]);

  const handleDownload = () => {
    if (courses.length === 0) return alert(current.emptyList);
    const headers = current.csvHeader + "\n";
    const csvContent = courses.map(c => 
      `${displaySem(c.semester, lang)},${c.name},${c.credit},${c.grade},${c.isMajor ? current.csvMajor : current.csvElective}`
    ).join("\n");
    const blob = new Blob(["\ufeff" + headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(new Blob([blob, csvContent], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CWNU_GPA_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const simulatorResult = useMemo(() => {
    const gpaCourses = courses.filter(c => GRADE_POINTS[c.grade] !== null);
    const currentGpaCredits = gpaCourses.reduce((acc, c) => acc + c.credit, 0);
    const currentPoints = gpaCourses.reduce((acc, c) => acc + (c.credit * GRADE_POINTS[c.grade]), 0);
    if (currentGpaCredits === 0) return null; 
    const nextCreditsSafe = simNextCredits || 1; 
    const totalTargetCredits = currentGpaCredits + nextCreditsSafe;
    const totalTargetPoints = (simTargetGpa || 0) * totalTargetCredits;
    const requiredPoints = totalTargetPoints - currentPoints;
    const requiredGpa = requiredPoints / nextCreditsSafe;
    return requiredGpa.toFixed(2);
  }, [courses, simTargetGpa, simNextCredits]);

  const recentGpa = groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.gpa : '0.00';
  const recentCredits = groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.credits : 0;

  const activeSemesterCourses = courses.filter(c => c.semester === activeTab);
  const activeSemesterSummary = calc(activeSemesterCourses);

  const chartData = {
    labels: groupedCourses.map(g => displaySem(g.semester, lang)),
    datasets: [
      { type: 'bar', label: current.chartCredits, data: groupedCourses.map(g => g.summary.credits), backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: 'rgb(16, 185, 129)', borderWidth: 1, yAxisID: 'y', order: 2 },
      { type: 'line', label: current.chartGpa, data: groupedCourses.map(g => g.summary.gpa), borderColor: '#ef4444', borderWidth: 3, pointBackgroundColor: 'white', pointBorderColor: '#ef4444', pointRadius: 5, tension: 0.3, yAxisID: 'y1', order: 1 }
    ]
  };

  const addCourse = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert(current.alertName);
    setCourses([...courses, { ...form, id: Date.now(), credit: parseInt(form.credit) }]);
    setForm({ ...form, name: '', credit: 3, grade: 'A+', isMajor: false });
  };

  const saveEdit = () => {
    setCourses(courses.map(c => c.id === editingId ? { ...editForm, credit: parseInt(editForm.credit) } : c));
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-emerald-400 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-emerald-600 dark:text-emerald-400 font-black mb-1 text-[10px] uppercase">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-400 font-bold text-xs hover:text-gray-200">{current.tourSkip}</button>
            <button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-emerald-600 dark:bg-emerald-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md">{current.tourNext}</button>
          </div>
        </div>
      )}

      {showSecurityInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowSecurityInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-md w-full shadow-2xl transform transition-all border-4 border-emerald-50 dark:border-gray-700" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-4"><span className="text-4xl md:text-5xl">🛡️</span></div>
            <h3 className="text-xl md:text-2xl font-black mb-4 text-emerald-700 dark:text-emerald-400 text-center tracking-tight">{current.secTitle}</h3>
            <div className="bg-emerald-50 dark:bg-gray-700/50 p-4 md:p-5 rounded-2xl mb-6 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              <p className="mb-3">
                <strong>{lang==='ko'?"입력하신 성적 데이터가 어떻게 처리되는지 궁금하셨군요? 데이터의 안전성을 확인하려는 아주 훌륭한 접근입니다.":"Curious about how your grade data is processed? Verifying data safety is an excellent approach."}</strong>
              </p>
              <p className="mb-3">
                {lang==='ko'?"본 포털의 GPA 계산 시스템은 철저하게 'Client-Side Only (클라이언트 단독 연산)' 아키텍처로 설계되었습니다. 쉽게 말씀드리면, 학우님이 입력하시는 모든 과목과 성적 정보는 서버는 물론, 외부 데이터베이스로 단 1바이트조차 전송되지 않습니다.":"This portal's GPA calculation system is strictly designed with a 'Client-Side Only' architecture. Simply put, absolutely zero bytes of your course and grade information are transmitted to any server or external database."}
              </p>
              <p className="mb-4">
                {lang==='ko'?"데이터는 오직 학우님이 현재 접속하신 기기의 브라우저가 제공하는 표준 보안 저장소인 `Local Storage`에 물리적으로 격리되어 저장됩니다.":"The data is physically isolated and stored exclusively within the `Local Storage`, a standard secure repository provided by your current device's browser."}
              </p>
            </div>
            <button onClick={() => setShowSecurityInfo(false)} className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-3 md:py-4 rounded-xl font-black text-sm md:text-base hover:bg-emerald-700 transition shadow-lg">{current.secBtn}</button>
          </div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-emerald-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-center">GPA V5_Global ver Updates</h3>
            <button onClick={() => setShowVersionInfo(false)} className="w-full mt-6 bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">Confirm!</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-4 md:mb-6 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              GPA <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">V5 5.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              {current.help}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-emerald-400 dark:text-emerald-500 font-black cursor-pointer hover:text-emerald-600 transition tracking-widest">{current.verCheck}</p>
        </div>

        <div className="flex justify-center mb-6 md:mb-8 px-2">
           <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 md:px-5 py-2 md:py-3 rounded-2xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 shadow-sm break-keep text-center">
             <span className="text-sm md:text-base">🔒</span> 
             <span>{lang==='ko'?"입력하신 성적 데이터는 본인의 기기에만 안전하게 저장되며, 외부로 공유되지 않습니다.":"Data is safely stored only on your local device and is not shared externally."}</span>
             <button onClick={() => setShowSecurityInfo(true)} className="ml-1 bg-emerald-200 dark:bg-emerald-700/50 text-emerald-800 dark:text-emerald-200 rounded-full w-5 h-5 flex items-center justify-center font-black text-[10px] hover:bg-emerald-300 dark:hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer shrink-0">?</button>
           </div>
        </div>

        <div id="tour-chart" className="bg-white dark:bg-gray-800 p-5 md:p-10 rounded-3xl md:rounded-[3rem] shadow-lg border-2 border-emerald-50 dark:border-gray-700 mb-8 md:mb-10 h-72 md:h-96 relative z-10 w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white flex items-center gap-2 md:gap-3"><span className="text-2xl md:text-3xl">📈</span> {current.chartTitle}</h3>
              <button onClick={handleDownload} className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-black text-[10px] md:text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 transition-colors">{current.chartBtn}</button>
            </div>
          {groupedCourses.length < 1 ? <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xs bg-gray-50 dark:bg-gray-700 rounded-2xl border border-dashed border-gray-200">{current.chartEmpty}</div> : <Chart type='bar' data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { padding: 10, color: '#9ca3af', font: { size: 10 } } }, y1: { position: 'right', min: 0, max: 4.5, ticks: { color: '#9ca3af', font: { size: 10 } } }, y: { ticks: { color: '#9ca3af', font: { size: 10 } } } }, plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } } }} />}
        </div>

        <div id="tour-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 relative z-10">
          <div className="bg-[#111] dark:bg-gray-900 p-6 md:px-10 md:py-10 rounded-3xl md:rounded-[3rem] shadow-2xl border-b-[8px] md:border-b-[10px] border-emerald-900 flex flex-col justify-center items-center text-white">
            <h3 className="text-gray-400 font-black text-xs uppercase mb-2">{current.dbAll}</h3>
            <div className="text-5xl md:text-6xl font-black font-mono text-emerald-400">{entireGpa.gpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">{current.dbEarned.replace('{c}', entireGpa.credits)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border-2 border-emerald-100 flex flex-col justify-center items-center text-gray-800 dark:text-gray-100">
            <h3 className="text-emerald-600 font-black text-xs uppercase mb-2">{current.dbMajor}</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{majorGpa.gpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">{current.dbEarnedMajor.replace('{c}', majorGpa.credits)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border-2 border-emerald-50 flex flex-col justify-center items-center text-gray-600 dark:text-gray-300">
            <h3 className="text-gray-400 font-black text-xs uppercase mb-2">{current.dbRecent}</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{recentGpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">{current.dbEarnedRecent.replace('{c}', recentCredits)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800/50 mb-8 md:mb-10 shadow-lg relative z-10 w-full flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black text-emerald-800 dark:text-emerald-300 mb-2 flex items-center justify-center md:justify-start gap-2">
              <span>🎯</span> {current.simTitle}
            </h3>
            <p className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400">{current.simDesc}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 dark:border-gray-700 w-full sm:w-auto transition-colors">
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 mr-3 whitespace-nowrap">{current.simTarget}</span>
              <input type="number" step="0.01" min="0" max="4.5" value={simTargetGpa} onChange={e=>setSimTargetGpa(Number(e.target.value))} className="w-16 bg-transparent text-emerald-600 dark:text-emerald-400 font-black text-xl outline-none text-right placeholder-gray-300"/>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 dark:border-gray-700 w-full sm:w-auto transition-colors">
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 mr-3 whitespace-nowrap">{current.simExpected}</span>
              <input type="number" step="1" min="1" max="24" value={simNextCredits} onChange={e=>setSimNextCredits(Number(e.target.value))} className="w-16 bg-transparent text-emerald-600 dark:text-emerald-400 font-black text-xl outline-none text-right placeholder-gray-300"/>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md border border-emerald-100 dark:border-gray-700 w-full md:w-auto md:min-w-[250px] text-center transition-colors">
            <p className="text-[10px] md:text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">{current.simResultTitle}</p>
            {simulatorResult === null ? (
              <span className="text-sm font-bold text-gray-400 block mt-2">{current.simEmpty}</span>
            ) : Number(simulatorResult) > 4.5 ? (
              <span className="text-lg md:text-xl font-black text-red-500 block mt-1 leading-tight">{current.simImp}<br/><span className="text-xs text-gray-400 font-bold">{current.simReq.replace('{r}', simulatorResult)}</span></span>
            ) : Number(simulatorResult) <= 0 ? (
              <span className="text-lg md:text-xl font-black text-blue-500 block mt-1 leading-tight">{current.simSafe}<br/><span className="text-xs text-gray-400 font-bold">{current.simReq.replace('{r}', simulatorResult)}</span></span>
            ) : (
              <span className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{simulatorResult}</span>
            )}
          </div>
        </div>

        <form id="tour-form" onSubmit={addCourse} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-8 md:mb-10 items-center relative z-10 w-full">
          <select value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm text-gray-700 dark:text-white outline-none border border-gray-100 focus:ring-2 ring-emerald-200 w-full">
            {/* 데이터 처리는 무조건 한글 원본(s)으로, 보이는 것만 displaySem 처리 */}
            {SEMESTERS.map(s => <option key={s} value={s}>{displaySem(s, lang)}</option>)}
          </select>
          <input placeholder={current.formName} value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none font-black text-gray-800 dark:text-white focus:bg-emerald-50 transition-colors text-sm border border-gray-100 focus:border-emerald-200 w-full"/>
          <div className="md:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
            <select value={form.credit} onChange={e=>setForm({...form, credit: e.target.value})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm text-gray-700 dark:text-white outline-none border border-gray-100">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}{current.formCredit}</option>)}</select>
            <select value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl font-black text-sm text-emerald-700 outline-none border border-emerald-100 focus:ring-2 ring-emerald-300">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4 md:h-full">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-100 h-full"><input type="checkbox" checked={form.isMajor} onChange={e=>setForm({...form, isMajor: e.target.checked})} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-xs text-gray-600 dark:text-gray-300">{current.formMajor}</span></label>
            <button className="bg-emerald-600 text-white p-3 rounded-xl font-black text-sm hover:bg-emerald-700 transition shadow-lg tracking-widest h-full">{current.formBtn}</button>
          </div>
        </form>

        <div id="tour-list" className="mb-6 w-full">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide relative z-10 w-full">{SEMESTERS.map(sem => { const has = courses.some(c => c.semester === sem); return ( <button key={sem} onClick={() => setActiveTab(sem)} className={`px-4 py-1.5 rounded-full whitespace-nowrap font-black text-[10px] md:text-xs transition-all shadow-sm ${activeTab === sem ? 'bg-emerald-600 text-white shadow-md' : has ? 'bg-white dark:bg-gray-800 text-emerald-600 border-2 border-emerald-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}> {displaySem(sem, lang)} {has && '•'} </button> ); })}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] shadow-xl border-2 border-emerald-100 dark:border-gray-700 mb-10 relative z-10 w-full overflow-hidden">
            <div className="bg-[#f8fafc] dark:bg-gray-900/50 p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="font-black text-gray-800 dark:text-white flex flex-wrap items-center gap-2 text-sm md:text-base">
                {displaySem(activeTab, lang)}
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs shadow-sm border border-emerald-200">
                  {current.listTotal.replace('{c}', activeSemesterSummary.credits).replace('{g}', activeSemesterSummary.gpa)}
                </span>
              </div>
              {activeSemesterCourses.length > 0 && <button onClick={()=>{ if(window.confirm(current.listDelConfirm.replace('{s}', displaySem(activeTab, lang)))) setCourses(courses.filter(c => c.semester !== activeTab)); }} className="bg-white dark:bg-gray-800 text-red-500 border border-red-200 px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-red-50 transition-colors">{current.listDelBtn}</button>}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black tracking-widest uppercase border-b border-gray-100">
                  <tr><th className="p-4">{current.thType}</th><th className="p-4 text-left">{current.thName}</th><th className="p-4">{current.thCredit}</th><th className="p-4">{current.thGrade}</th><th className="p-4">{current.thAction}</th></tr>
                </thead>
                <tbody>
                  {activeSemesterCourses.map(course => (
                    <tr key={course.id} className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${editingId === course.id ? 'bg-yellow-50/50' : 'hover:bg-emerald-50/30'}`}>
                      {editingId === course.id ? (
                        <td colSpan="5" className="p-4 bg-yellow-50/50 relative z-10">
                          <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-200">
                            <select value={editForm.semester} onChange={e=>setEditForm({...editForm, semester: e.target.value})} className="w-full sm:w-auto p-2 bg-gray-100 dark:bg-gray-700 rounded-xl font-black text-xs outline-none">{SEMESTERS.map(s => <option key={s} value={s}>{displaySem(s, lang)}</option>)}</select>
                            <input value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full sm:flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-xs outline-none focus:ring-2 ring-emerald-200"/>
                            <div className="flex w-full sm:w-auto gap-2">
                              <select value={editForm.credit} onChange={e=>setEditForm({...editForm, credit: e.target.value})} className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl font-black text-xs">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}{current.formCredit}</option>)}</select>
                              <select value={editForm.grade} onChange={e=>setEditForm({...editForm, grade: e.target.value})} className="flex-1 p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl font-black text-xs text-emerald-700">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
                            </div>
                            <div className="flex w-full sm:w-auto gap-2 items-center">
                              <label className="flex items-center gap-1.5 cursor-pointer bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl text-xs"><input type="checkbox" checked={editForm.isMajor} onChange={e=>setEditForm({...editForm, isMajor: e.target.checked})} className="w-3 h-3 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-gray-600 dark:text-gray-300">{current.formMajor}</span></label>
                              <div className="flex gap-1.5 flex-grow">
                                <button onClick={saveEdit} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-emerald-700 transition shadow-sm flex-grow">{current.btnSave}</button>
                                <button onClick={()=>setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-gray-500 transition shadow-sm flex-grow">{current.btnCancel}</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="p-4 flex justify-center items-center h-full"><label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-100"><input type="checkbox" checked={course.isMajor} onChange={e=>{ setCourses(courses.map(c => c.id === course.id ? { ...c, isMajor: e.target.checked } : c)); }} className="w-3 h-3 accent-emerald-500 rounded cursor-pointer"/><span className="font-black text-[10px] text-gray-600 dark:text-gray-300">{current.formMajor}</span></label></td>
                          <td className="p-4 text-left font-black text-gray-800 dark:text-white text-sm md:text-lg">{course.name}</td>
                          <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">{course.credit}{current.formCredit}</td>
                          <td className="p-4 font-black text-base md:text-xl text-emerald-600">{course.grade}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={()=>{setEditingId(course.id); setEditForm(course)}} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl transition">{current.btnEdit}</button>
                            <button onClick={()=>{if(window.confirm(current.delConfirm)) setCourses(courses.filter(i=>i.id!==course.id))}} className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl transition">{current.btnDel}</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {activeSemesterCourses.length === 0 && <tr><td colSpan="5" className="p-20 text-gray-400 font-bold text-xs">{current.emptyList}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
<footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">{current.footerDept}</p>
  <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold mt-1 md:mt-2">{current.footerCopy}</p>
</footer>
    </div>
  );
}

export default GpaPage;