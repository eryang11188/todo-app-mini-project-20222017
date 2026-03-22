import { useState, useEffect } from 'react'
import axios from 'axios'

const TITLE_MENTIONS = [
  "오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", "지루함을 깨뜨릴 오늘의 스케줄을 적어주세요.", "미래의 나에게 부끄럽지 않을 계획을 세웁시다.", "작은 목표가 모여 전설을 만듭니다.",
  "오늘 하루, 어떤 멋진 일들을 계획하고 있나요?", "기록하는 순간, 목표는 이미 현실에 한 걸음 다가섭니다.", "어제보다 더 나은 오늘을 위한 당신만의 계획!", "성공적인 하루의 시작, 명확한 목표 설정부터!", "작은 성취들이 모여 눈부신 미래를 완성합니다.",
  "오늘 하루도 힘차게! 어떤 과제들을 부숴볼까요?", "머릿속의 복잡한 생각들, 여기에 적고 가볍게 시작하세요.", "오늘의 나를 이기는 가장 확실한 방법, 철저한 계획!", "창대인의 열정을 보여줄 오늘의 미션들을 채워주세요.", "눈부신 성장을 위한 오늘의 스케줄을 디자인해보세요.",
  "당신의 귀한 시간을 가장 가치 있게 써봅시다.", "망설임은 시간만 늦출 뿐, 지금 바로 적고 실행합시다.", "거창하지 않아도 좋습니다. 오늘의 작고 소중한 목표는?", "하루를 지배하는 자가 인생을 지배합니다. 스케줄을 세워보세요.", "무엇이든 해낼 수 있는 오늘, 당신의 첫 번째 스텝은?"
];

const PLACEHOLDERS = [
  "어떤 위대한 미션을 수행할까요?", "성장을 위한 작은 습관 추가", "목표를 적는 순간 이미 반은 성공입니다.",
  "여기에 오늘의 핵심 목표를 입력하세요.", "가장 먼저 끝내고 싶은 일은 무엇인가요?", "오늘 하루를 알차게 만들 작은 미션 하나!", "세상을 바꿀 당신의 오늘 첫 번째 할 일은?", "미루고 미뤘던 그 과제, 오늘 한 번 끝내봅시다!",
  "작은 것부터 하나씩, 천천히 적어보세요.", "목표를 구체적으로 적을수록 실행력은 배가 됩니다.", "과제, 복습, 운동, 약속 등 무엇이든 적어주세요!", "머릿속에 맴도는 할 일을 텍스트로 꺼내보세요.", "한 줄의 계획이 당신의 하루를 완벽하게 바꿉니다.",
  "오늘의 나를 더 멋지게 만들어줄 할 일 추가하기", "일단 적어두면 뇌가 알아서 움직이기 시작합니다.", "ex) 웹프로그래밍 기말과제 완벽하게 마무리하기", "ex) 하루 30분 전공 서적 읽고 핵심 노트 정리하기", "ex) 오늘은 스마트폰 줄이고 무조건 12시 전에 자기",
  "나태해진 나를 깨울 강력한 목표 한 줄!", "오늘 하루, 나 자신과의 소중한 약속을 적어주세요."
];

const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "The secret of getting ahead is getting started.", ko: "앞서가는 비밀은 시작하는 것이다." },
  { en: "Done is better than perfect.", ko: "완성하는 것이 완벽한 것보다 낫다." },
  { en: "Motivation is what gets you started. Habit is what keeps you going.", ko: "동기부여는 시작하게 만들고, 습관은 계속 나아가게 만든다." },
  { en: "Turn your wounds into wisdom.", ko: "당신의 상처를 지혜로 바꿔라." }
];

const TOUR_STEPS = [
  { title: "👋 환영합니다!", desc: "CWNU 포털의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, 
  { title: "⏱️ 타이머 & 스톱워치", desc: "집중할 시간을 설정하거나 측정이 가능합니다.", targetId: "tour-timer" }, 
  { title: "🚨 30분 전 알림", desc: "타이머가 30분 이하일 때 적색으로 경고해줍니다.", targetId: "tour-timer-alert" }, 
  { title: "⏰ 초정밀 카운트다운", desc: "할 일마다 실시간 남은 시간을 확인할 수 있습니다.", targetId: "tour-add" }, 
  { title: "📝 자유로운 뷰", desc: "목록, 그리드, 테이블 형태로 관리가 가능합니다.", targetId: "tour-list-buttons" }
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('');
  const [quote, setQuote] = useState(QUOTES[0]); const [titleMentionIndex, setTitleMentionIndex] = useState(0); const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' }); const [editingId, setEditingId] = useState(null); const [editForm, setEditForm] = useState({});
  const [viewType, setViewType] = useState('list'); const [currentPage, setCurrentPage] = useState(1); const itemsPerPage = 8;
  const [now, setNow] = useState(new Date()); const [isAlertEnabled, setIsAlertEnabled] = useState(true); const [tourIndex, setTourIndex] = useState(-1);
  const [showVersionInfo, setShowVersionInfo] = useState(false); const [showModalConfetti, setShowModalConfetti] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items';

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 50); return () => clearInterval(intervalId); }, []);
  useEffect(() => { const intervalId = setInterval(() => { setTitleMentionIndex(p => (p + 1) % TITLE_MENTIONS.length); setPlaceholderIndex(p => (p + 1) % PLACEHOLDERS.length); }, 6000); return () => clearInterval(intervalId); }, []);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  // 글로벌 이벤트 수신 코드는 삭제되었습니다. (직접 버튼으로 제어)

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < TOUR_STEPS.length) {
      if (tourIndex === 2 && timerMode !== 'timer') setTimerMode('timer'); 
      const el = document.getElementById(TOUR_STEPS[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, timerMode]);

  useEffect(() => {
    if (!timerIsRunning && timerMode === 'timer') {
       const h = Math.floor(timerTime / 3600000);
       const m = Math.floor((timerTime % 3600000) / 60000);
       const s = Math.floor((timerTime % 60000) / 1000);
       setInputs({
         h: String(h).padStart(2, '0'),
         m: String(m).padStart(2, '0'),
         s: String(s).padStart(2, '0')
       });
    }
  }, [timerIsRunning, timerMode]);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const handleRandomize = () => { setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]); setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS.length)); }
  const formatTime = (ms) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); const mi = Math.floor((ms % 1000) / 10); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mi).padStart(2,'0')}`; }
  
  const getRemainingTime = (deadline) => { if (!deadline) return null; const diff = new Date(deadline) - now; if (diff <= 0) return "EXPIRED"; return { days: Math.floor(diff/86400000), hours: Math.floor((diff/3600000)%24), mins: Math.floor((diff/60000)%60), secs: Math.floor((diff/1000)%60), ms: Math.floor((diff%1000)/10) }; }
  
  const addTodo = async (e) => { e.preventDefault(); if(!title) return; await axios.post(API_URL, { title, importance, todoDeadline }); fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1); handleRandomize(); }
  const saveEditTodo = async (id) => { await axios.put(`${COMMON_URL}/${id}`, editForm); fetchTodos(); setEditingId(null); }

  const handleTimeInput = (field, value) => {
    const rawValue = value.replace(/[^0-9]/g, ''); 
    if (rawValue.length > 2) return; 

    let num = parseInt(rawValue, 10);
    if (!isNaN(num)) {
      if (field === 'h' && num > 23) num = 23;
      if ((field === 'm' || field === 's') && num > 59) num = 59;
      setInputs(prev => ({ ...prev, [field]: num.toString() })); 
    } else {
      setInputs(prev => ({ ...prev, [field]: '' })); 
    }
  };

  const handleTimeBlur = (field) => {
    setInputs(prev => {
      if (prev[field] === '') return { ...prev, [field]: '00' };
      return { ...prev, [field]: String(prev[field]).padStart(2, '0') };
    });
  };

  const handleStartPause = () => {
    if (!timerIsRunning) {
      if (timerMode === 'timer') {
        const ms = ((parseInt(inputs.h || 0) * 3600) + (parseInt(inputs.m || 0) * 60) + parseInt(inputs.s || 0)) * 1000;
        setTimerTime(ms);
      }
      setTimerIsRunning(true);
    } else {
      setTimerIsRunning(false); 
    }
  };

  const filteredTodos = todos.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage) || 1;
  const currentTodos = filteredTodos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;
  
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nanum+Pen+Script&display=swap');
        .font-cursive-custom { font-family: 'Caveat', 'Nanum Pen Script', cursive; letter-spacing: 0.05em; }
        .font-korean-cursive { font-family: 'Nanum Pen Script', cursive; letter-spacing: 0.1em; }
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
      `}</style>

      {/* 모바일 도움말 최적화 */}
      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-indigo-400 dark:border-indigo-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-indigo-600 dark:text-indigo-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">건너뛰기</button><button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">{tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}</button></div>
        </div>
      )}

      {/* 업데이트 내역 모달 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-indigo-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center">Todo V5_super_4.0 ver 업데이트 내역</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">25년 2학기 웹프로그래밍 기말대체 과제 `todos_v4`의 최종 진화형!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">🤔 이전 버전</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 text-center">
                  <li>❌ 타이머 및 스톱워치 부재</li>
                  <li>❌ 마감 기한 시각화 기능 부재</li>
                </ul>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-inner">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-black text-sm mb-3 text-center">✨ 현재 버전 (v5)</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 text-center">
                  <li>✅ <span className="text-indigo-600 font-black">집중 타이머 & 스톱워치</span> 탑재</li>
                  <li>✅ 30분 전 알람 및 실시간 카운트다운</li>
                  <li>✅ <span className="text-indigo-600 font-black">할 일 통합 검색 기능</span> 추가</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">🛠️ CWNU PORTAL V5 발전 과정</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">할 일 등록 및 기본적인 체크리스트 기능 구현</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V2.0:</span><span className="text-slate-600 dark:text-gray-400">중요도 분류 시스템 및 마감 기한 설정 도입</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">리스트/그리드/테이블 다중 뷰 모드 지원</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V4.0:</span><span className="text-slate-800 dark:text-gray-200 italic">정밀 집중 타이머 및 30분 전 스마트 알림 통합</span></p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-indigo-800 dark:text-indigo-400 mb-1"> "아... 유료인가요?"</h4>
                <p className="text-indigo-700 dark:text-indigo-300 font-bold text-xs">아닙니다! 창대인을 위한 <span className="font-black text-sm">완전 무료</span> 서비스입니다!<br/> 철저한 시간 관리로 당신의 꿈을 앞당기세요!</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">확인 완료!</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        {/* 타이틀과 도움말 버튼 나란히 배치 */}
        <div id="tour-header" className="text-center mb-6 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              TODO <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">V5_super_4.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              💡 도움말
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-indigo-400 dark:text-indigo-500 font-black cursor-pointer hover:text-indigo-600 transition tracking-widest">(버전 클릭 시 업데이트 내역 확인)</p>
        </div>

        {/* 타이머 영역 */}
        <div id="tour-timer" className="bg-[#111] dark:bg-gray-950 text-white p-6 md:p-10 rounded-3xl md:rounded-[4rem] mb-8 md:mb-12 shadow-2xl border-b-[8px] md:border-b-[12px] border-indigo-900 dark:border-indigo-800 text-center relative mt-6 md:mt-8">
          {timerMode === 'timer' && (
            <div id="tour-timer-alert" className="absolute top-4 right-4 md:top-8 md:right-10 flex items-center gap-1 md:gap-2 bg-gray-900 p-1.5 md:p-2 rounded-lg md:rounded-xl border border-gray-700 z-10">
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider hidden sm:inline ${isAlertEnabled ? 'text-red-400' : 'text-gray-500'}`}>30분 전 알람</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} /><div className="w-7 md:w-9 h-4 md:h-5 bg-gray-700 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 md:after:h-4 after:w-3 md:after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label>
            </div>
          )}
          <div className="flex justify-center gap-3 md:gap-4 mb-4 md:mb-6 mt-4 sm:mt-0">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>스톱워치</button>
          </div>
          
          {/* 타이머 시간 입력 (onBlur 속성 추가 적용) */}
          {!timerIsRunning && timerMode === 'timer' ? (
            <div className="flex justify-center items-center gap-2 text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter">
              <input value={inputs.h} onBlur={()=>handleTimeBlur('h')} onChange={e=>handleTimeInput('h', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.m} onBlur={()=>handleTimeBlur('m')} onChange={e=>handleTimeInput('m', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.s} onBlur={()=>handleTimeBlur('s')} onChange={e=>handleTimeInput('s', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>
            </div>
          ) : (
            <div className={`text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter ${isTimerUrgent ? 'animate-[pulse_1s_ease-in-out_infinite] text-red-500' : ''}`}>{formatTime(timerTime)}</div>
          )}
          
          <div className="flex justify-center gap-3 md:gap-4">
            <button onClick={handleStartPause} className={`px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg transition-all ${timerIsRunning?'bg-red-600 text-white shadow-lg':'bg-white text-black hover:scale-105'}`}>
              {timerIsRunning ? 'PAUSE' : 'START'}
            </button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg text-gray-600 hover:border-gray-600">RESET</button>
          </div>
        </div>

        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-[2.5rem] py-2 font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-800 to-black dark:from-white dark:via-indigo-300 dark:to-gray-300 mb-6 md:mb-8 tracking-tighter flex justify-center items-center">
             <span key={TITLE_MENTIONS[titleMentionIndex]} className="inline-block animate-submit-text-fade">{TITLE_MENTIONS[titleMentionIndex]}</span>
          </h2>
          <div className="flex flex-col items-center p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-2 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-b from-white to-indigo-50/50 dark:from-gray-800 dark:to-gray-900 shadow-sm relative overflow-hidden">
            <p className="text-2xl md:text-[2.5rem] py-2 font-cursive-custom font-black mb-4 md:mb-5 drop-shadow-md text-center px-2 md:px-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">"{quote.en}"</p>
            <p className="text-xl md:text-3xl font-korean-cursive text-gray-700 dark:text-gray-200 font-bold bg-white/80 dark:bg-gray-800/80 px-6 py-2 md:px-8 md:py-3 rounded-full shadow-sm border border-gray-100">{quote.ko}</p>
            <button onClick={handleRandomize} className="mt-6 md:mt-8 text-[10px] md:text-[11px] bg-white dark:bg-gray-700 border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-full font-black hover:text-indigo-600 transition-all hover:scale-105 z-10 uppercase tracking-widest">🔄 New Quote</button>
          </div>
        </div>

        <div className="mb-6 w-full relative z-10">
          <input 
            type="text" 
            placeholder="🔍 찾으시는 할 일을 검색해보세요!" 
            value={searchTerm} 
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            className="w-full p-3 md:p-4 border-2 text-sm md:text-base border-indigo-100 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-indigo-400 dark:bg-gray-800 dark:text-white transition-all font-bold"
          />
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row flex-wrap gap-3 mb-6 relative overflow-hidden">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 dark:text-white p-3 md:px-5 rounded-2xl font-black text-sm outline-none border border-gray-100 z-10"><option>긴급</option><option>보통</option><option>낮음</option></select>
          <input placeholder={PLACEHOLDERS[placeholderIndex]} value={title} onChange={e=>setTitle(e.target.value)} className="w-full md:w-auto flex-grow p-3 outline-none bg-transparent font-bold text-gray-800 dark:text-white text-base md:text-lg z-10 border-gray-100 md:border-none rounded-2xl md:rounded-none"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-full md:w-56 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-xs font-black cursor-pointer text-gray-600 dark:text-gray-300 z-10 border-gray-100 md:border-none"/>
          <button className="w-full md:w-auto bg-indigo-900 dark:bg-indigo-700 text-white px-6 py-3 md:px-10 md:py-4 rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 transition shadow-lg z-10">추가하기</button>
        </form>

        <div className="flex justify-end mb-6">
          <div id="tour-list-buttons" className="flex gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-200 shadow-sm">
            <button onClick={() => setViewType('list')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='list'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>LIST</button>
            <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='grid'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>GRID</button>
            <button onClick={() => setViewType('table')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='table'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>TABLE</button>
          </div>
        </div>

        <div className="transition-all">
          {viewType === 'table' ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-xl overflow-x-auto border-2 border-gray-100 mb-8 w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-[#111] text-white text-xs md:text-sm font-bold uppercase tracking-widest"><tr><th className="p-3 md:p-5">우선순위</th><th className="p-3 md:p-5 text-left">미션명</th><th className="p-3 md:p-5">남은 시간</th><th className="p-3 md:p-5">관리</th></tr></thead>
                <tbody>
                {currentTodos.map(todo => { 
                  const remain = getRemainingTime(todo.todoDeadline); 
                  return ( 
                  <tr key={todo._id} className="border-b dark:border-gray-700 hover:bg-indigo-50/30 transition-colors"> 
                    {editingId === todo._id ? (
                      <td colSpan="4" className="p-3 md:p-4 bg-indigo-50/50">
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="w-full sm:w-auto p-2 border rounded-xl font-bold text-xs"><option>긴급</option><option>보통</option><option>낮음</option></select>
                          <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="w-full sm:flex-grow p-2 border rounded-xl font-bold text-sm outline-none"/>
                          <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="w-full sm:w-auto p-2 border rounded-xl text-xs font-bold outline-none"/>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => saveEditTodo(todo._id)} className="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs">저장</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 sm:flex-none bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs">취소</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-3 md:p-5"><span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400 text-gray-900':'bg-green-500'}`}>{todo.importance}</span></td> 
                        <td className="p-3 md:p-5 text-left font-black text-gray-800 dark:text-gray-100 text-sm md:text-lg">{todo.title}</td> 
                        <td className="p-3 md:p-5 text-sm md:text-base font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{remain === "EXPIRED" ? "💀 만료" : remain ? `${remain.days}일 ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}` : "-"}</td> 
                        <td className="p-3 md:p-5 flex justify-center gap-1.5">
                          <button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full transition">Edit</button>
                          <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[10px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white bg-red-50 px-3 py-1.5 rounded-full transition">Del</button>
                        </td> 
                      </>
                    )}
                  </tr> 
                )})}
                </tbody></table></div>
          ) : (
            <div className={viewType === 'list' ? "space-y-3 md:space-y-4 mb-8" : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8"}>
              {currentTodos.map(todo => { 
                const remain = getRemainingTime(todo.todoDeadline); 
                return ( 
                <div key={todo._id} className="bg-white dark:bg-gray-800 p-5 md:p-7 rounded-3xl md:rounded-[2.5rem] shadow-md border border-gray-100 flex flex-col group transition-all hover:-translate-y-1"> 
                  {editingId === todo._id ? (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-2 border-2 border-indigo-100 rounded-xl font-bold text-xs"><option>긴급</option><option>보통</option><option>낮음</option></select>
                      <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="p-2 border-2 border-indigo-100 rounded-xl font-black outline-none text-sm"/>
                      <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-2 border-2 border-indigo-100 rounded-xl text-xs font-bold"/>
                      <div className="flex gap-2"><button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white flex-grow py-2 rounded-xl font-black text-xs">저장</button><button onClick={() => setEditingId(null)} className="bg-gray-400 text-white flex-grow py-2 rounded-xl font-black text-xs">취소</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 w-full"><span className={`min-w-[12px] h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}></span><span className="font-black text-gray-800 dark:text-gray-100 text-lg md:text-xl truncate">{todo.title}</span></div> 
                      {remain && <div className={`text-sm md:text-base font-black ml-6 mt-2 bg-gray-50 dark:bg-gray-700 inline-block px-3 py-1.5 rounded-lg border ${remain === "EXPIRED" ? "text-gray-400" : "text-indigo-600 border-indigo-100"}`}>⏱️ {remain === "EXPIRED" ? "만료됨" : `${remain.days}일 ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')} 남음`}</div>} 
                      <div className="flex gap-2 mt-4 ml-6"><button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="px-4 py-2 bg-indigo-50 text-indigo-500 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition">Edit</button><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="px-4 py-2 bg-red-50 text-red-400 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition">Delete</button></div> 
                    </>
                  )}
                </div> 
              ); })}
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">PREV</button>
            <div className="flex gap-1">
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  onClick={() => setCurrentPage(num)} 
                  className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === num ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-indigo-100 dark:border-gray-700 hover:border-indigo-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
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
  )
}
export default TodoPage;