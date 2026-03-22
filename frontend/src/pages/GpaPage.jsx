import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, LineController, BarController } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, LineController, BarController );

const GRADE_POINTS = { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': null, 'NP': null };
const CREDIT_OPTIONS = [0, 1, 2, 3, 4];
const SEMESTERS = ['1학년 1학기', '1학년 여름방학', '1학년 2학기', '1학년 겨울방학', '2학년 1학기', '2학년 여름방학', '2학년 2학기', '2학년 겨울방학', '3학년 1학기', '3학년 여름방학', '3학년 2학기', '3학년 겨울방학', '4학년 1학기', '4학년 여름방학', '4학년 2학기', '4학년 겨울방학', '5학년 1학기', '5학년 여름방학', '5학년 2학기', '5학년 겨울방학', '6학년 1학기', '6학년 여름방학', '6학년 2학기', '6학년 겨울방학', '기타학기'];

const TOUR_STEPS = [
  { title: "GPA System Open", desc: "탭 인터페이스 기반 성적 관리 도구입니다.", targetId: "tour-header" }, 
  { title: "Analytics Graph", desc: "학기별 이수 추이를 시각화하여 확인하십시오.", targetId: "tour-chart" }, 
  { title: "Dashboard", desc: "전체, 전공, 최근 평점 요약 및 시뮬레이션을 제공합니다.", targetId: "tour-dashboard" }, 
  { title: "Grade Registration", desc: "과목명, 학점, 성적 및 전공 여부를 기입하십시오.", targetId: "tour-form" },
  { title: "Semester Transcripts", desc: "학기를 선택하여 해당 학기의 세부 성적을 관리하십시오.", targetId: "tour-list" }
];

function GpaPage() {
  const STORAGE_KEY = 'cwnu_gpa_v3';
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  const [activeTab, setActiveTab] = useState(SEMESTERS[0]);
  const [form, setForm] = useState({ semester: SEMESTERS[0], name: '', credit: 3, grade: 'A+', isMajor: false });
  const [tourIndex, setTourIndex] = useState(-1); 
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({});
  const [showVersionInfo, setShowVersionInfo] = useState(false); 
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  // V5 5.0 시뮬레이터 상태
  const [targetGpa, setTargetGpa] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }, [courses]);
  
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

  const handleDownload = () => {
    if (courses.length === 0) return alert("다운로드할 성적 데이터가 없습니다.");
    const headers = "학기,과목명,학점,성적,전공여부\n";
    const csvContent = courses.map(c => 
      `${c.semester},${c.name},${c.credit},${c.grade},${c.isMajor ? '전공' : '교양'}`
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

  // ✅ 시뮬레이터를 위한 정밀 계산 로직 고도화 (gpaCredits, totalPoints 추가 산출)
  const calc = (list) => {
    if (!list || list.length === 0) return { credits: 0, gpa: '0.00', gpaCredits: 0, totalPoints: 0 };
    const earned = list.reduce((acc, c) => (c.grade !== 'F' && c.grade !== 'NP') ? acc + c.credit : acc, 0);
    const gpaCredits = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + c.credit : acc, 0);
    const pts = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + (c.credit * GRADE_POINTS[c.grade]) : acc, 0);
    return { credits: earned, gpa: gpaCredits === 0 ? '0.00' : (pts / gpaCredits).toFixed(2), gpaCredits, totalPoints: pts };
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
    if (!form.name.trim()) return alert("과목명을 입력해 주십시오.");
    setCourses([...courses, { ...form, id: Date.now(), credit: parseInt(form.credit) }]);
    setForm({ ...form, name: '', credit: 3, grade: 'A+', isMajor: false });
  };

  const saveEdit = () => {
    setCourses(courses.map(c => c.id === editingId ? { ...editForm, credit: parseInt(editForm.credit) } : c));
    setEditingId(null);
  };

  // ✅ V5 5.0 공식적인 목표 평점 시뮬레이터 피드백 로직
  const renderSimulatorFeedback = () => {
    if (!targetGpa || !remainingCredits) return <p className="text-xs md:text-sm text-gray-500 font-bold">목표 평점과 남은 학점을 입력하여 시뮬레이션을 시작하십시오.</p>;
    
    const target = parseFloat(targetGpa);
    const remain = parseFloat(remainingCredits);
    
    if (isNaN(target) || isNaN(remain) || remain <= 0 || target <= 0 || target > 4.5) {
      return <p className="text-xs md:text-sm text-red-500 font-bold">올바른 수치를 입력해 주십시오. (평점 0.1~4.5, 학점 1 이상)</p>;
    }

    const currentGpaCredits = entireGpa.gpaCredits || 0;
    const currentTotalPoints = entireGpa.totalPoints || 0;
    
    const requiredTotalPoints = target * (currentGpaCredits + remain);
    const requiredPointsFromRemain = requiredTotalPoints - currentTotalPoints;
    const requiredAverage = requiredPointsFromRemain / remain;

    if (requiredAverage > 4.5) {
       return <p className="text-xs md:text-sm text-red-600 dark:text-red-400 font-bold">목표 달성 불가. 남은 학점을 전 과목 4.5(A+) 취득하여도 설정한 목표 평점에 도달할 수 없습니다.</p>;
    } else if (requiredAverage <= 0) {
       return <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-bold">목표 달성 안정권. 현재 성적 기준으로 남은 학점의 결과와 무관하게 목표 평점을 상회합니다.</p>;
    } else {
       return <p className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-bold">목표 달성 가능. 해당 목표 평점에 도달하기 위해서는 남은 학점 동안 평균 {requiredAverage.toFixed(2)} 이상의 평점을 취득해야 합니다.</p>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {/* 도움말 투어 모달 (이모지 제거, 텍스트 정돈) */}
      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-emerald-400 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-emerald-600 dark:text-emerald-400 font-black mb-1 text-[10px] uppercase">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-400 font-bold text-xs hover:text-gray-200">Skip</button>
            <button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-emerald-600 dark:bg-emerald-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md">Next</button>
          </div>
        </div>
      )}

      {/* 공식적인 보안 데이터 안내 상세 팝업창 (이모지 제거) */}
      {showSecurityInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowSecurityInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-md w-full shadow-2xl transform transition-all border-4 border-emerald-50 dark:border-gray-700" onClick={e=>e.stopPropagation()}>
            <h3 className="text-xl md:text-2xl font-black mb-4 text-emerald-700 dark:text-emerald-400 text-center tracking-tight">데이터 보안 처리 안내</h3>
            
            <div className="bg-emerald-50 dark:bg-gray-700/50 p-4 md:p-5 rounded-2xl mb-6 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              <p className="mb-3">
                <strong>본 포털의 시스템 데이터 보안 무결성 검증 안내입니다.</strong>
              </p>
              <p className="mb-3">
                해당 GPA 계산 시스템은 철저하게 <strong>'Client-Side Only (클라이언트 단독 연산)'</strong> 아키텍처로 설계되었습니다. 입력된 모든 과목 및 성적 정보는 외부 서버나 데이터베이스(DB)로 <strong>일절 전송되지 않습니다.</strong>
              </p>
              <p className="mb-4">
                데이터는 접속하신 기기의 브라우저 표준 보안 저장소인 <strong>`Local Storage`</strong>에 물리적으로 격리되어 보관됩니다.
              </p>

              <div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-600 rounded-xl p-3 mb-4 shadow-sm">
                <p className="font-black text-emerald-800 dark:text-emerald-400 mb-2 text-center text-xs">[성적 데이터 처리 방침]</p>
                <ul className="space-y-1.5 text-[11px] md:text-xs">
                  <li><span className="text-gray-500">▪ 수집 및 전송:</span> <strong>원천 차단</strong> (서버 통신 로직 부재)</li>
                  <li><span className="text-gray-500">▪ 저장 위치:</span> <strong>사용자 로컬 브라우저 할당 영역</strong></li>
                  <li><span className="text-gray-500">▪ 열람 권한:</span> <strong>기기 소유자 본인 한정</strong></li>
                </ul>
              </div>

              <p className="mb-1 text-emerald-600 dark:text-emerald-400 font-bold">
                외부 유출 위험이 구조적으로 차단되어 있으므로, 안심하고 시스템을 이용하시기 바랍니다.
              </p>
            </div>
            
            <button onClick={() => setShowSecurityInfo(false)} className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-3 md:py-4 rounded-xl font-black text-sm md:text-base hover:bg-emerald-700 transition shadow-lg">확인 완료</button>
          </div>
        </div>
      )}

      {/* 업데이트 내역 모달 (V5 5.0 추가, 이모지 제거) */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-emerald-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-center">GPA V5 5.0 System Update</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">CWNU Portal System 공식 릴리즈</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">[ 이전 버전 한계점 ]</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4">
                  <li>시각적 데이터 분석 도구 부재</li>
                  <li>장기적인 학점 목표 설정 시스템 한계</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-inner">
                <h4 className="text-emerald-600 dark:text-emerald-400 font-black text-sm mb-3 text-center">[ V5 5.0 개선 사항 ]</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 list-disc pl-4">
                  <li>목표 평점 시뮬레이터 엔진 탑재</li>
                  <li>학기별 데이터 CSV 익스포트 포맷 최적화</li>
                  <li>모바일 가독성 및 UI 시스템 고도화</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm">System Evolution History</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-emerald-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">성적 입력 및 기초 학점 연산 시스템 구축</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-emerald-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">대시보드 지표 및 전공 분류 로직 추가</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-900"><span className="text-emerald-600 font-black min-w-[45px]">V5 5.0:</span><span className="text-slate-800 dark:text-gray-200">데이터 시각화 및 목표 평점 시뮬레이션 탑재 완료</span></p>
              </div>
            </div>

            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">시스템 확인</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        {/* 헤더 타이틀 */}
        <div id="tour-header" className="text-center mb-4 md:mb-6 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              GPA <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 text-red-600 dark:text-red-400 italic text-2xl md:text-4xl">V5 5.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
              Guide
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-500 font-black cursor-pointer hover:text-emerald-700 transition tracking-widest">Version Info</p>
        </div>

        {/* 공식 보안 배너 (이모지 제거) */}
        <div className="flex justify-center mb-6 md:mb-8 px-2">
           <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 md:px-5 py-2 md:py-3 rounded-2xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 shadow-sm break-keep text-center">
             <span className="font-black">[보안]</span> 
             <span>기입된 성적 데이터는 접속 기기에 국한되어 저장되며, 외부로 전송되지 않습니다.</span>
             <button onClick={() => setShowSecurityInfo(true)} className="ml-1 bg-emerald-200 dark:bg-emerald-700/50 text-emerald-800 dark:text-emerald-200 rounded-full px-2 py-0.5 flex items-center justify-center font-black text-[10px] hover:bg-emerald-300 dark:hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer shrink-0">
               상세
             </button>
           </div>
        </div>

        {/* 그래프 섹션 */}
        <div id="tour-chart" className="bg-white dark:bg-gray-800 p-5 md:p-10 rounded-3xl md:rounded-[3rem] shadow-lg border border-gray-200 dark:border-gray-700 mb-8 md:mb-10 h-72 md:h-96 relative z-10 w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white">성적 추이 분석</h3>
              <button onClick={handleDownload} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl font-black text-[10px] md:text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Export CSV</button>
            </div>
          {groupedCourses.length < 1 ? <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xs bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">산출할 데이터가 존재하지 않습니다.</div> : <Chart type='bar' data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { padding: 10, color: '#9ca3af', font: { size: 10 } } }, y1: { position: 'right', min: 0, max: 4.5, ticks: { color: '#9ca3af', font: { size: 10 } } }, y: { ticks: { color: '#9ca3af', font: { size: 10 } } } }, plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } } }} />}
        </div>

        {/* 대시보드 */}
        <div id="tour-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 relative z-10">
          <div className="bg-[#111] dark:bg-gray-900 p-6 md:px-10 md:py-10 rounded-3xl shadow-xl border-t-4 border-emerald-600 flex flex-col justify-center items-center text-white">
            <h3 className="text-gray-400 font-black text-xs uppercase mb-2 tracking-widest">CGPA (전체 평점)</h3>
            <div className="text-5xl md:text-6xl font-black font-mono text-emerald-400">{entireGpa.gpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">총 {entireGpa.credits}학점 이수</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center text-gray-800 dark:text-gray-100">
            <h3 className="text-emerald-700 dark:text-emerald-500 font-black text-xs uppercase mb-2 tracking-widest">Major GPA (전공)</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{majorGpa.gpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">전공 {majorGpa.credits}학점 이수</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center text-gray-600 dark:text-gray-300">
            <h3 className="text-gray-500 font-black text-xs uppercase mb-2 tracking-widest">Recent Term (최근)</h3>
            <div className="text-5xl md:text-6xl font-black font-mono">{recentGpa}</div>
            <p className="text-xs font-bold text-gray-500 mt-2">최근 {recentCredits}학점 이수</p>
          </div>
        </div>

        {/* ✅ V5 5.0 추가: 목표 평점 시뮬레이터 섹션 */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-3xl shadow-inner border border-gray-200 dark:border-gray-700 mb-8 md:mb-10 relative z-10 w-full flex flex-col gap-4">
          <h3 className="text-sm md:text-base font-black text-gray-800 dark:text-gray-200 tracking-widest uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Target GPA Simulator</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <input 
              type="number" step="0.01" min="0" max="4.5"
              placeholder="목표 평점 (예: 4.0)" 
              value={targetGpa} 
              onChange={e => setTargetGpa(e.target.value)} 
              className="w-full md:w-1/3 p-3 md:p-4 bg-white dark:bg-gray-700 rounded-xl outline-none font-bold text-gray-800 dark:text-white text-sm border border-gray-200 dark:border-gray-600 focus:border-emerald-400"
            />
            <input 
              type="number" min="1"
              placeholder="남은 수강 학점 (예: 18)" 
              value={remainingCredits} 
              onChange={e => setRemainingCredits(e.target.value)} 
              className="w-full md:w-1/3 p-3 md:p-4 bg-white dark:bg-gray-700 rounded-xl outline-none font-bold text-gray-800 dark:text-white text-sm border border-gray-200 dark:border-gray-600 focus:border-emerald-400"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 min-h-[60px] flex items-center">
            {renderSimulatorFeedback()}
          </div>
        </div>

        {/* 성적 입력 폼 */}
        <form id="tour-form" onSubmit={addCourse} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-8 md:mb-10 items-center relative z-10 w-full">
          <select value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm text-gray-700 dark:text-white outline-none border border-gray-200 dark:border-gray-600 focus:border-emerald-400 w-full">{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <input placeholder="Subject Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none font-black text-gray-800 dark:text-white text-sm border border-gray-200 dark:border-gray-600 focus:border-emerald-400 w-full"/>
          <div className="md:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
            <select value={form.credit} onChange={e=>setForm({...form, credit: e.target.value})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm text-gray-700 dark:text-white outline-none border border-gray-200 dark:border-gray-600 focus:border-emerald-400">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c} Credits</option>)}</select>
            <select value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl font-black text-sm text-emerald-800 dark:text-emerald-300 outline-none border border-emerald-200 dark:border-emerald-700 focus:border-emerald-400">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4 md:h-full">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600 h-full"><input type="checkbox" checked={form.isMajor} onChange={e=>setForm({...form, isMajor: e.target.checked})} className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"/><span className="font-black text-xs text-gray-600 dark:text-gray-300">Major</span></label>
            <button className="bg-emerald-700 text-white p-3 rounded-xl font-black text-sm hover:bg-emerald-800 transition shadow-md tracking-widest h-full">ADD</button>
          </div>
        </form>

        <div id="tour-list" className="mb-6 w-full">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide relative z-10 w-full">{SEMESTERS.map(sem => { const has = courses.some(c => c.semester === sem); return ( <button key={sem} onClick={() => setActiveTab(sem)} className={`px-4 py-1.5 rounded-full whitespace-nowrap font-black text-[10px] md:text-xs transition-all shadow-sm ${activeTab === sem ? 'bg-[#002f6c] dark:bg-blue-800 text-white shadow-md' : has ? 'bg-white dark:bg-gray-800 text-[#002f6c] dark:text-blue-400 border border-[#002f6c] dark:border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border border-transparent'}`}> {sem} {has && '•'} </button> ); })}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] shadow-lg border border-gray-200 dark:border-gray-700 mb-10 relative z-10 w-full overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="font-black text-gray-800 dark:text-white flex flex-wrap items-center gap-2 text-sm md:text-base">
                {activeTab} Summary
                <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-[10px] md:text-xs shadow-sm border border-gray-200 dark:border-gray-600 ml-2">
                  Total {activeSemesterSummary.credits} Credits / GPA: {activeSemesterSummary.gpa}
                </span>
              </div>
              {activeSemesterCourses.length > 0 && <button onClick={()=>{ if(window.confirm(`${activeTab} 데이터 영구 삭제를 진행하시겠습니까?`)) setCourses(courses.filter(c => c.semester !== activeTab)); }} className="bg-white dark:bg-gray-800 text-red-600 border border-gray-200 dark:border-gray-600 px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Delete Semester</button>}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black tracking-widest uppercase border-b border-gray-200 dark:border-gray-700">
                  <tr><th className="p-4">Type</th><th className="p-4 text-left">Subject</th><th className="p-4">Credit</th><th className="p-4">Grade</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody>
                  {activeSemesterCourses.map(course => (
                    <tr key={course.id} className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${editingId === course.id ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                      {editingId === course.id ? (
                        <td colSpan="5" className="p-4 bg-gray-50 dark:bg-gray-700/50 relative z-10">
                          <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm">
                            <select value={editForm.semester} onChange={e=>setEditForm({...editForm, semester: e.target.value})} className="w-full sm:w-auto p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-black text-xs outline-none">{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <input value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full sm:flex-grow p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-xs outline-none focus:border-emerald-400"/>
                            <div className="flex w-full sm:w-auto gap-2">
                              <select value={editForm.credit} onChange={e=>setEditForm({...editForm, credit: e.target.value})} className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-black text-xs">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={editForm.grade} onChange={e=>setEditForm({...editForm, grade: e.target.value})} className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-black text-xs text-emerald-700 dark:text-emerald-400">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
                            </div>
                            <div className="flex w-full sm:w-auto gap-2 items-center">
                              <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-xl text-xs"><input type="checkbox" checked={editForm.isMajor} onChange={e=>setEditForm({...editForm, isMajor: e.target.checked})} className="w-3 h-3 accent-emerald-600 rounded cursor-pointer"/><span className="font-black text-gray-600 dark:text-gray-300">Major</span></label>
                              <div className="flex gap-1.5 flex-grow">
                                <button onClick={saveEdit} className="bg-[#002f6c] dark:bg-blue-800 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-blue-900 transition shadow-sm flex-grow">Save</button>
                                <button onClick={()=>setEditingId(null)} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl font-black text-xs hover:bg-gray-400 transition shadow-sm flex-grow">Cancel</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="p-4 flex justify-center items-center h-full"><label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600"><input type="checkbox" checked={course.isMajor} onChange={e=>{ setCourses(courses.map(c => c.id === course.id ? { ...c, isMajor: e.target.checked } : c)); }} className="w-3 h-3 accent-emerald-600 rounded cursor-pointer"/><span className="font-black text-[10px] text-gray-600 dark:text-gray-300">Major</span></label></td>
                          <td className="p-4 text-left font-black text-gray-800 dark:text-white text-sm md:text-base">{course.name}</td>
                          <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">{course.credit} Credits</td>
                          <td className="p-4 font-black text-base md:text-lg text-emerald-700 dark:text-emerald-400">{course.grade}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={()=>{setEditingId(course.id); setEditForm(course)}} className="text-[10px] font-black uppercase text-gray-500 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-xl transition">Edit</button>
                            <button onClick={()=>{if(window.confirm('해당 성적을 영구 삭제하시겠습니까?')) setCourses(courses.filter(i=>i.id!==course.id))}} className="text-[10px] font-black uppercase text-red-500 hover:text-white bg-white hover:bg-red-600 dark:bg-gray-700 dark:hover:bg-red-800 border border-gray-200 dark:border-gray-600 hover:border-transparent px-3 py-1.5 rounded-xl transition">Del</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {activeSemesterCourses.length === 0 && <tr><td colSpan="5" className="p-20 text-gray-400 font-bold text-xs">해당 학기에 등록된 데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
<footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors w-full">
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

export default GpaPage;