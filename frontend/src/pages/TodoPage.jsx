import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const TITLE_MENTIONS = {
  ko: ["오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", "지루함을 깨뜨릴 오늘의 스케줄을 적어주세요.", "미래의 나에게 부끄럽지 않을 계획을 세웁시다.", "작은 목표가 모여 전설을 만듭니다.", "오늘 하루, 어떤 멋진 일들을 계획하고 있나요?", "기록하는 순간, 목표는 이미 현실에 한 걸음 다가섭니다.", "어제보다 더 나은 오늘을 위한 당신만의 계획!", "성공적인 하루의 시작, 명확한 목표 설정부터!", "작은 성취들이 모여 눈부신 미래를 완성합니다."],
  en: ["What is your mission today?", "One step for growth, what to do?", "Write down today's schedule to break the boredom.", "Plan something you won't regret to your future self.", "Small goals make legends.", "What wonderful things are you planning today?", "The moment you record, the goal is one step closer.", "Your own plan for a better today than yesterday!", "A successful day starts with clear goals!", "Small achievements gather to complete a dazzling future."]
};

const PLACEHOLDERS = {
  ko: ["어떤 위대한 미션을 수행할까요?", "성장을 위한 작은 습관 추가", "목표를 적는 순간 이미 반은 성공입니다.", "여기에 오늘의 핵심 목표를 입력하세요.", "가장 먼저 끝내고 싶은 일은 무엇인가요?", "오늘 하루를 알차게 만들 작은 미션 하나!", "세상을 바꿀 당신의 오늘 첫 번째 할 일은?", "미루고 미뤘던 그 과제, 오늘 한 번 끝내봅시다!", "작은 것부터 하나씩, 천천히 적어보세요.", "목표를 구체적으로 적을수록 실행력은 배가 됩니다."],
  en: ["What great mission will you undertake?", "Add a small habit for growth", "The moment you write down a goal, it's half success.", "Enter your core goal for today here.", "What do you want to finish first?", "One small mission to make today fruitful!", "What is your first task today to change the world?", "That assignment you've been putting off, let's finish it today!", "Write them down slowly, starting with small things.", "The more specific the goal, the doubled the execution."]
};

// 🔴 [명언 배열]
const QUOTES = [];

function TodoPage({ lang, timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0); const [titleMentionIndex, setTitleMentionIndex] = useState(0); const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' }); const [editingId, setEditingId] = useState(null); const [editForm, setEditForm] = useState({});
  const [viewType, setViewType] = useState('list'); const [currentPage, setCurrentPage] = useState(1); const itemsPerPage = 8;
  const [now, setNow] = useState(new Date()); const [isAlertEnabled, setIsAlertEnabled] = useState(true); const [tourIndex, setTourIndex] = useState(-1);
  const [showVersionInfo, setShowVersionInfo] = useState(false); const [showModalConfetti, setShowModalConfetti] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  
  // ✅ AI 챗봇을 위한 상태 및 Ref 관리
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); 
  const [followUpInput, setFollowUpInput] = useState('');
  const chatContainerRef = useRef(null);

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items';

  const t = {
    ko: {
      tourSteps: [
        { title: "👋 환영합니다!", desc: "CWNU 포털의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, 
        { title: "⏱️ 타이머 & 스톱워치", desc: "집중할 시간을 설정하거나 측정이 가능합니다.", targetId: "tour-timer" }, 
        { title: "🚨 30분 전 알림", desc: "타이머가 30분 이하일 때 적색으로 경고해줍니다.", targetId: "tour-timer-alert" }, 
        // 💡 도움말(투어)에 AI 비서 기능 안내 추가!
        { title: "🤖 AI 챗봇 비서 (NEW!)", desc: "질문이나 할 일을 적고 AI 버튼을 눌러 스마트한 답변을 받아보세요!", targetId: "tour-add" }, 
        { title: "📝 자유로운 뷰", desc: "목록, 그리드, 테이블 형태로 관리가 가능합니다.", targetId: "tour-list-buttons" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 보기 ▶", tourEnd: "투어 종료 🎉", help: "💡 도움말", verCheck: "(버전 클릭 시 업데이트 내역 확인)",
      alarm: "30분 전 알람", focus: "집중 타이머", stop: "스톱워치", reset: "RESET", searchP: "🔍 찾으시는 할 일을 검색해보세요!",
      addBtn: "추가하기", newQuote: "🔄 New Quote", remainDay: "일", remainLeft: "남음", expired: "만료됨", expiredIcon: "💀 만료",
      thImp: "순서/우선순위", thTitle: "미션명", thRemain: "남은 시간", thAct: "관리", btnSave: "저장", btnCancel: "취소", btnEdit: "수정", btnDel: "삭제",
      impObj: { '긴급': '긴급', '보통': '보통', '낮음': '낮음' },
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      modalTitle: "Todo V5 5.0 ver 업데이트 내역", modalSub: "25년 2학기 웹프로그래밍 기말대체 과제 `todos_v4`의 최종 진화형!",
      modalPrevTitle: "🤔 이전 버전", modalPrev1: "❌ 타이머 및 스톱워치 부재", modalPrev2: "❌ 마감 기한 시각화 기능 부재",
      modalCurTitle: "✨ 현재 버전 (V5 5.0)", modalCur1: "✅ 집중 타이머 & 스톱워치 탑재", modalCur2: "✅ 30분 전 알람 및 실시간 카운트다운", modalCur3: "✅ 할 일 통합 검색 기능 추가", modalCur4: "✅ 글로벌 다국어(KOR/ENG) 완벽 지원!",
      modalCur5: "🤖 대화형 Gemini AI 비서 전격 도입!", // 💡 모달창 업데이트 내역 추가
      modalHistTitle: "🛠️ CWNU PORTAL 발전 과정",
      modalHistV1: "할 일 등록 및 기본적인 체크리스트 기능 구현", modalHistV2: "중요도 분류 시스템 및 마감 기한 설정 도입", modalHistV3: "리스트/그리드/테이블 다중 뷰 모드 지원", modalHistV4: "정밀 집중 타이머 및 30분 전 스마트 알림 통합", modalHistV5: "글로벌 다국어 완벽 지원 및 UI 고도화",
      modalFreeTitle: "\"아... 유료인가요?\"", modalFreeDesc1: "아닙니다! 창대인을 위한 완전 무료 서비스입니다!", modalFreeDesc2: "철저한 시간 관리로 당신의 꿈을 앞당기세요!", modalBtn: "확인 완료!",
      aiBtn: "✨ AI 비서", aiLoading: "⏳ 생각 중...", aiEmpty: "질문이나 할 일을 먼저 적어주세요!", aiFollowUpP: "AI에게 추가로 물어보세요...", aiClear: "초기화", aiClose: "닫기"
    },
    en: {
      tourSteps: [
        { title: "👋 Welcome!", desc: "Let me guide you through the core features.", targetId: "tour-header" }, 
        { title: "⏱️ Timer & Stopwatch", desc: "Set or measure time to focus.", targetId: "tour-timer" }, 
        { title: "🚨 30-Min Alert", desc: "Alerts in red when under 30 mins.", targetId: "tour-timer-alert" }, 
        // 💡 영문 도움말(투어) AI 추가!
        { title: "🤖 AI Assistant (NEW!)", desc: "Enter a task and click the AI button for smart advice!", targetId: "tour-add" }, 
        { title: "📝 Free View", desc: "Manage in list, grid, or table formats.", targetId: "tour-list-buttons" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", tourEnd: "End Tour 🎉", help: "💡 Guide", verCheck: "(Click version to check updates)",
      alarm: "30m Alert", focus: "Focus Timer", stop: "Stopwatch", reset: "RESET", searchP: "🔍 Search for tasks you are looking for!",
      addBtn: "Add Task", newQuote: "🔄 New Quote", remainDay: "d", remainLeft: "left", expired: "Expired", expiredIcon: "💀 Expired",
      thImp: "Order/Priority", thTitle: "Mission", thRemain: "Remaining Time", thAct: "Action", btnSave: "Save", btnCancel: "Cancel", btnEdit: "Edit", btnDel: "Del",
      impObj: { '긴급': 'Urgent', '보통': 'Normal', '낮음': 'Low' },
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      modalTitle: "Todo V5 5.0 ver Updates", modalSub: "The ultimate evolution of the Fall '25 Web Programming final project `todos_v4`!",
      modalPrevTitle: "🤔 Previous Version", modalPrev1: "❌ No timer and stopwatch", modalPrev2: "❌ No visual deadline tracking",
      modalCurTitle: "✨ Current Version (V5 5.0)", modalCur1: "✅ Focus Timer & Stopwatch included", modalCur2: "✅ 30-min alert & real-time countdown", modalCur3: "✅ Integrated task search added", modalCur4: "✅ Global bilingual (KOR/ENG) support!",
      modalCur5: "🤖 Interactive Gemini AI Assistant integrated!", // 💡 모달창 업데이트 내역 추가
      modalHistTitle: "🛠️ CWNU PORTAL Evolution",
      modalHistV1: "Task registration & basic checklist", modalHistV2: "Priority system & deadline settings", modalHistV3: "List/Grid/Table multi-view support", modalHistV4: "Precision focus timer & smart alerts", modalHistV5: "Full bilingual support & UI enhancement",
      modalFreeTitle: "\"Wait, is this paid?\"", modalFreeDesc1: "No! It's a completely free service for CWNU students!", modalFreeDesc2: "Advance your dreams with thorough time management!", modalBtn: "Confirmed!",
      aiBtn: "✨ AI", aiLoading: "⏳ Thinking...", aiEmpty: "Please enter a task or question first!", aiFollowUpP: "Ask follow-up questions...", aiClear: "Clear", aiClose: "Close"
    }
  };
  const current = t[lang];

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 50); return () => clearInterval(intervalId); }, []);
  useEffect(() => { const intervalId = setInterval(() => { setTitleMentionIndex(p => (p + 1) % TITLE_MENTIONS[lang].length); setPlaceholderIndex(p => (p + 1) % PLACEHOLDERS[lang].length); }, 6000); return () => clearInterval(intervalId); }, [lang]);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  // 화면 전체 스크롤 방지, 채팅창 내부만 스크롤 되게 하기
  useEffect(() => { 
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      if (tourIndex === 2 && timerMode !== 'timer') setTimerMode('timer'); 
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, timerMode, current.tourSteps]);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const handleRandomize = () => { if(QUOTES.length > 0) setQuoteIndex(Math.floor(Math.random() * QUOTES.length)); setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS[lang].length)); }
  const formatTime = (ms) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); const mi = Math.floor((ms % 1000) / 10); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mi).padStart(2,'0')}`; }
  
  const getRemainingTime = (deadline) => { if (!deadline) return null; const diff = new Date(deadline) - now; if (diff <= 0) return "EXPIRED"; return { days: Math.floor(diff/86400000), hours: Math.floor((diff/3600000)%24), mins: Math.floor((diff/60000)%60), secs: Math.floor((diff/1000)%60), ms: Math.floor((diff%1000)/10) }; }
  
  const addTodo = async (e) => { 
    e.preventDefault(); 
    if(!title) return; 
    await axios.post(API_URL, { title, importance, todoDeadline }); 
    fetchTodos(); setTitle(''); setTodoDeadline(''); 
    setShowAiBox(false); setChatHistory([]); 
    setCurrentPage(1); handleRandomize(); 
  }
  const saveEditTodo = async (id) => { await axios.put(`${COMMON_URL}/${id}`, editForm); fetchTodos(); setEditingId(null); }

  const handleTimeInput = (field, value) => {
    const rawValue = value.replace(/[^0-9]/g, ''); 
    if (rawValue.length > 2) return; 
    let num = parseInt(rawValue, 10);
    if (!isNaN(num)) {
      if (field === 'h' && num > 23) num = 23;
      if ((field === 'm' || field === 's') && num > 59) num = 59;
      setInputs(prev => ({ ...prev, [field]: num.toString() })); 
    } else { setInputs(prev => ({ ...prev, [field]: '' })); }
  };
  const handleTimeBlur = (field) => { setInputs(prev => { if (prev[field] === '') return { ...prev, [field]: '00' }; return { ...prev, [field]: String(prev[field]).padStart(2, '0') }; }); };
  const handleStartPause = () => {
    if (!timerIsRunning) {
      if (timerMode === 'timer') {
        if (timerTime === 0) {
          const ms = ((parseInt(inputs.h || 0) * 3600) + (parseInt(inputs.m || 0) * 60) + parseInt(inputs.s || 0)) * 1000;
          if (ms === 0) return; 
          setTimerTime(ms);
        }
      }
      setTimerIsRunning(true);
    } else { setTimerIsRunning(false); }
  };

  const handleDragStart = (e, index) => { setDragItemIndex(index); setTimeout(() => { e.target.classList.add('opacity-40', 'scale-[0.98]'); }, 0); };
  const handleDragEnter = (e, index) => { setDragOverItemIndex(index); };
  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40', 'scale-[0.98]');
    if (dragItemIndex !== null && dragOverItemIndex !== null && dragItemIndex !== dragOverItemIndex) {
      const newFilteredTodos = [...filteredTodos];
      const draggedItemContent = newFilteredTodos[dragItemIndex];
      newFilteredTodos.splice(dragItemIndex, 1);
      newFilteredTodos.splice(dragOverItemIndex, 0, draggedItemContent);
      if (searchTerm === '') setTodos(newFilteredTodos);
    }
    setDragItemIndex(null); setDragOverItemIndex(null);
  };

  const askAi = async (inputText, isInitial = false) => {
    if (!inputText.trim()) {
      if (isInitial) alert(current.aiEmpty);
      return;
    }
    
    setShowAiBox(true);
    setIsGenerating(true);

    const currentMsg = { sender: 'user', text: inputText };
    let newHistory = isInitial ? [currentMsg] : [...chatHistory, currentMsg];
    setChatHistory(newHistory);
    if (!isInitial) setFollowUpInput(''); 

    try {
      let promptContext = lang === 'ko' 
        ? "당신은 사용자에게 유용하고 친절한 AI 어시스턴트입니다. 불필요한 농담이나 과장된 롤플레이 없이, 사용자의 질문에 명확하고 자연스럽게 대답해주세요.\n\n[대화 내역]\n"
        : "You are a helpful and friendly AI assistant. Answer the user clearly and naturally without forced jokes or roleplay.\n\n[Chat History]\n";
      
      newHistory.forEach(msg => {
        promptContext += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n`;
      });
      promptContext += "AI: ";

      const res = await axios.post('/api/ai/generate', { prompt: promptContext });
      const aiResult = res.data.text.trim(); 
      
      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResult }]);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: (lang === 'ko' ? "❌ 통신 중 오류가 발생했습니다." : "❌ Error connecting to server.") }]);
    } finally {
      setIsGenerating(false);
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
        .drag-over-top { border-top: 4px solid #6366f1 !important; transform: translateY(2px); transition: all 0.2s; }
        .drag-over-bottom { border-bottom: 4px solid #6366f1 !important; transform: translateY(-2px); transition: all 0.2s; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-indigo-400 dark:border-indigo-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-indigo-600 dark:text-indigo-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{current.tourSkip}</button><button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button></div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-indigo-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center">{current.modalTitle}</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">{current.modalSub}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">{current.modalPrevTitle}</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 text-center">
                  <li>{current.modalPrev1}</li>
                  <li>{current.modalPrev2}</li>
                </ul>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-inner">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-black text-sm mb-3 text-center">{current.modalCurTitle}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 text-center">
                  <li>{current.modalCur1}</li>
                  <li>{current.modalCur2}</li>
                  <li>{current.modalCur3}</li>
                  <li>{current.modalCur4}</li>
                  {/* 💡 업데이트 모달창 내역 추가 부분 */}
                  <li className="text-indigo-600 dark:text-indigo-400">{current.modalCur5}</li> 
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">{current.modalHistTitle}</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V2.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V4.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V5.0:</span><span className="text-slate-800 dark:text-gray-200 italic">{current.modalHistV5}</span></p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-indigo-800 dark:text-indigo-400 mb-1">{current.modalFreeTitle}</h4>
                <p className="text-indigo-700 dark:text-indigo-300 font-bold text-xs"><span className="font-black text-sm">{current.modalFreeDesc1}</span><br/>{current.modalFreeDesc2}</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">{current.modalBtn}</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-6 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              TODO <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">V5 5.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              {current.help}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-indigo-400 dark:text-indigo-500 font-black cursor-pointer hover:text-indigo-600 transition tracking-widest">{current.verCheck}</p>
        </div>

        <div id="tour-timer" className="bg-[#111] dark:bg-gray-950 text-white p-6 md:p-10 rounded-3xl md:rounded-[4rem] mb-8 md:mb-12 shadow-2xl border-b-[8px] md:border-b-[12px] border-indigo-900 dark:border-indigo-800 text-center relative mt-6 md:mt-8">
          {timerMode === 'timer' && (
            <div id="tour-timer-alert" className="absolute top-4 right-4 md:top-8 md:right-10 flex items-center gap-1 md:gap-2 bg-gray-900 p-1.5 md:p-2 rounded-lg md:rounded-xl border border-gray-700 z-10">
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider hidden sm:inline ${isAlertEnabled ? 'text-red-400' : 'text-gray-500'}`}>{current.alarm}</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} /><div className="w-7 md:w-9 h-4 md:h-5 bg-gray-700 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 md:after:h-4 after:w-3 md:after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label>
            </div>
          )}
          <div className="flex justify-center gap-3 md:gap-4 mb-4 md:mb-6 mt-4 sm:mt-0">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>{current.focus}</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>{current.stop}</button>
          </div>
          
          {!timerIsRunning && timerMode === 'timer' && timerTime === 0 ? (
            <div className="flex justify-center items-center gap-2 text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter">
              <input value={inputs.h} onBlur={()=>handleTimeBlur('h')} onChange={e=>handleTimeInput('h', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.m} onBlur={()=>handleTimeBlur('m')} onChange={e=>handleTimeInput('m', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.s} onBlur={()=>handleTimeBlur('s')} onChange={e=>handleTimeInput('s', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>
            </div>
          ) : (
            <div className={`text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter ${isTimerUrgent ? 'animate-[pulse_1s_ease-in-out_infinite] text-red-500' : (!timerIsRunning && timerTime > 0 ? 'opacity-50' : '')}`}>
              {formatTime(timerTime)}
            </div>
          )}
          
          <div className="flex justify-center gap-3 md:gap-4">
            <button onClick={handleStartPause} className={`px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg transition-all ${timerIsRunning?'bg-red-600 text-white shadow-lg':'bg-white text-black hover:scale-105'}`}>
              {timerIsRunning ? 'PAUSE' : (timerTime > 0 ? 'RESUME' : 'START')}
            </button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg text-gray-600 hover:border-gray-600">{current.reset}</button>
          </div>
        </div>

        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-[2.5rem] py-2 font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-800 to-black dark:from-white dark:via-indigo-300 dark:to-gray-300 mb-6 md:mb-8 tracking-tighter flex justify-center items-center">
             <span key={TITLE_MENTIONS[lang][titleMentionIndex]} className="inline-block animate-submit-text-fade">{TITLE_MENTIONS[lang][titleMentionIndex]}</span>
          </h2>
          
          <div className="flex flex-col items-center p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-2 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-b from-white to-indigo-50/50 dark:from-gray-800 dark:to-gray-900 shadow-sm relative overflow-hidden">
            {QUOTES.length > 0 && (() => {
                const rawQuoteEn = QUOTES[quoteIndex]?.en || "";
                const enParts = rawQuoteEn.split(' - ');
                const enBody = enParts[0];
                const enSource = enParts.length > 1 ? enParts.slice(1).join(' - ') : '';

                const rawQuoteKo = QUOTES[quoteIndex]?.ko || "";
                const koParts = rawQuoteKo.split(' - ');
                const koBody = koParts[0];
                const koSource = koParts.length > 1 ? koParts.slice(1).join(' - ') : '';

                return (
                    <>
                        <div className="flex flex-col items-center mb-6 md:mb-8 px-2 md:px-4 w-full relative group">
                            <p className="text-2xl md:text-[2.5rem] py-2 font-cursive-custom font-black drop-shadow-md text-center leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 transition-all duration-300">
                                "{enBody}"
                            </p>
                            {enSource && (
                                <p className="self-end text-[11px] md:text-sm font-bold text-gray-500 dark:text-gray-400 font-mono tracking-tighter mt-[-6px] md:mt-[-10px] opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    - {enSource}
                                </p>
                            )}
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 px-6 py-3 md:px-8 md:py-4 rounded-3xl md:rounded-full shadow-sm border border-gray-100 flex flex-col items-center mb-2 w-[95%] md:w-auto md:max-w-[95%]">
                            <p className="text-xl md:text-3xl font-korean-cursive text-gray-700 dark:text-gray-200 font-bold leading-tight text-center break-keep w-full">
                                {koBody}
                            </p>
                            {koSource && (
                                <p className="self-end text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight mt-1 whitespace-nowrap">
                                    - {koSource}
                                </p>
                            )}
                        </div>
                    </>
                );
            })()}
            <button onClick={handleRandomize} className="mt-6 md:mt-8 text-[10px] md:text-[11px] bg-white dark:bg-gray-700 border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-full font-black hover:text-indigo-600 transition-all hover:scale-105 z-10 uppercase tracking-widest">{current.newQuote}</button>
          </div>
        </div>

        <div className="mb-6 w-full relative z-10">
          <input 
            type="text" placeholder={current.searchP} value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            className="w-full p-3 md:p-4 border-2 text-sm md:text-base border-indigo-100 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-indigo-400 dark:bg-gray-800 dark:text-white transition-all font-bold"
          />
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col mb-6 relative">
          
          <div className="flex flex-col md:flex-row flex-wrap gap-3 w-full items-center">
            <select value={importance} onChange={e=>setImportance(e.target.value)} className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 dark:text-white p-3 md:px-5 rounded-2xl font-black text-sm outline-none border border-gray-100 z-10"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
            
            <div className="w-full md:w-auto flex-grow flex items-center bg-transparent border border-gray-100 md:border-none rounded-2xl md:rounded-none z-10 relative">
              <input 
                type="text"
                placeholder={PLACEHOLDERS[lang][placeholderIndex]} 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                className="w-full p-3 pr-24 outline-none bg-transparent font-bold text-gray-800 dark:text-white text-base md:text-lg"
              />
              <button 
                type="button" 
                onClick={() => askAi(title, true)}
                disabled={isGenerating}
                className={`absolute right-2 px-3 py-1.5 rounded-xl font-black text-[10px] md:text-xs transition-all shadow-sm ${isGenerating ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105 hover:shadow-md'}`}
              >
                {isGenerating && chatHistory.length === 0 ? current.aiLoading : current.aiBtn}
              </button>
            </div>

            <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-full md:w-56 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-xs font-black cursor-pointer text-gray-600 dark:text-gray-300 z-10 border-gray-100 md:border-none"/>
            <button className="w-full md:w-auto bg-indigo-900 dark:bg-indigo-700 text-white px-6 py-3 md:px-10 md:py-4 rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 transition shadow-lg z-10">{current.addBtn}</button>
          </div>

          {/* AI 챗봇 박스 */}
          {showAiBox && (
            <div className="w-full mt-4 p-4 md:p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-inner flex flex-col animate-[slide-up_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  ✨ Gemini AI 비서
                </h4>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setChatHistory([]); askAi(title, true); }} className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition bg-white dark:bg-gray-800 px-2 py-1 rounded-md border">{current.aiClear}</button>
                  <button type="button" onClick={() => setShowAiBox(false)} className="text-xs font-bold text-gray-500 hover:text-red-500 transition bg-white dark:bg-gray-800 px-2 py-1 rounded-md border">{current.aiClose}</button>
                </div>
              </div>
              
              <div ref={chatContainerRef} className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-3">
                {chatHistory.length === 0 && isGenerating && (
                   <div className="text-xs font-bold text-gray-400 p-2">{current.aiLoading}</div>
                )}
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex w-full ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-bold whitespace-pre-wrap leading-relaxed shadow-sm
                      ${chat.sender === 'user' 
                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-600'}
                    `}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {isGenerating && chatHistory.length > 0 && (
                   <div className="flex w-full justify-start"><div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none text-sm font-bold text-gray-500 animate-pulse">...</div></div>
                )}
              </div>

              {/* 후속 질문 입력칸 */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:border-indigo-400 transition-colors">
                <input 
                  type="text" 
                  value={followUpInput} 
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => { 
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'Enter') { 
                      e.preventDefault(); 
                      askAi(followUpInput); 
                    } 
                  }}
                  placeholder={current.aiFollowUpP}
                  className="flex-grow p-2 outline-none bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200"
                />
                <button 
                  type="button"
                  onClick={() => askAi(followUpInput)}
                  disabled={isGenerating || !followUpInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          )}
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
            <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-xl overflow-x-auto border-2 border-gray-100 dark:border-gray-700 mb-8 w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-[#111] text-white text-xs md:text-sm font-bold uppercase tracking-widest"><tr><th className="p-3 md:p-5">{current.thImp}</th><th className="p-3 md:p-5 text-left">{current.thTitle}</th><th className="p-3 md:p-5">{current.thRemain}</th><th className="p-3 md:p-5">{current.thAct}</th></tr></thead>
                <tbody>
                {currentTodos.map((todo, index) => { 
                  const remain = getRemainingTime(todo.todoDeadline);
                  return ( 
                  <tr key={todo._id} draggable={searchTerm === ''} onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className={`border-b dark:border-gray-700 hover:bg-indigo-50/30 transition-colors cursor-move ${dragItemIndex === index ? 'opacity-40 bg-gray-50 dark:bg-gray-800' : ''} ${dragOverItemIndex === index && dragItemIndex !== null ? (dragItemIndex < dragOverItemIndex ? 'drag-over-bottom' : 'drag-over-top') : ''}`}> 
                    {editingId === todo._id ? (
                      <td colSpan="4" className="p-3 md:p-4 bg-indigo-50/50 dark:bg-indigo-900/20">
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="w-full sm:w-auto p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-xs"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
                          <input type="text" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="w-full sm:flex-grow p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-sm outline-none"/>
                          <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="w-full sm:w-auto p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl text-xs font-bold outline-none"/>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => saveEditTodo(todo._id)} className="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs">{current.btnSave}</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 sm:flex-none bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs">{current.btnCancel}</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-3 md:p-5 flex items-center justify-center gap-2"><span className="text-gray-300 dark:text-gray-600 mr-1 hidden sm:inline" title="드래그하여 순서 변경">☰</span><span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400 text-gray-900':'bg-green-500'}`}>{current.impObj[todo.importance] || todo.importance}</span></td> 
                        <td className="p-3 md:p-5 text-left font-black text-gray-800 dark:text-gray-100 text-sm md:text-lg">{todo.title}</td> 
                        <td className="p-3 md:p-5 text-sm md:text-base font-black text-indigo-600 dark:text-indigo-300 whitespace-nowrap">{remain === "EXPIRED" ? current.expiredIcon : remain ? `${remain.days}${current.remainDay} ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}` : "-"}</td> 
                        <td className="p-3 md:p-5 flex justify-center gap-1.5">
                          <button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full transition">{current.btnEdit}</button>
                          <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[10px] font-black uppercase text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full transition">{current.btnDel}</button>
                        </td> 
                      </>
                    )}
                  </tr> 
                )})}
                </tbody></table></div>
          ) : (
            <div className={viewType === 'list' ? "space-y-3 md:space-y-4 mb-8" : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8"}>
              {currentTodos.map((todo, index) => { 
                const remain = getRemainingTime(todo.todoDeadline); 
                return ( 
                <div key={todo._id} draggable={searchTerm === ''} onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className={`bg-white dark:bg-gray-800 p-5 md:p-7 rounded-3xl md:rounded-[2.5rem] shadow-md border border-gray-100 dark:border-gray-700 flex flex-col group transition-all hover:-translate-y-1 cursor-move ${dragItemIndex === index ? 'opacity-40 bg-gray-50 dark:bg-gray-800 scale-[0.98]' : ''} ${dragOverItemIndex === index && dragItemIndex !== null ? (dragItemIndex < dragOverItemIndex ? 'drag-over-bottom' : 'drag-over-top') : ''}`}> 
                  {editingId === todo._id ? (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-xs"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
                      <input type="text" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl font-black outline-none text-sm"/>
                      <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl text-xs font-bold"/>
                      <div className="flex gap-2"><button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white flex-grow py-2 rounded-xl font-black text-xs">{current.btnSave}</button><button onClick={() => setEditingId(null)} className="bg-gray-400 text-white flex-grow py-2 rounded-xl font-black text-xs">{current.btnCancel}</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-gray-300 dark:text-gray-600" title="드래그하여 순서 변경">☰</span>
                        <span className={`min-w-[12px] h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}></span>
                        <span className="font-black text-gray-800 dark:text-gray-100 text-lg md:text-xl truncate">{todo.title}</span>
                      </div> 
                      {remain && <div className={`text-sm md:text-base font-black ml-9 mt-2 inline-block self-start px-3 py-1.5 rounded-lg border ${remain === "EXPIRED" ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/30"}`}>⏱️ {remain === "EXPIRED" ? current.expired : `${remain.days}${current.remainDay} ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')} ${current.remainLeft}`}</div>} 
                      <div className="flex gap-2 mt-4 ml-9"><button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition">{current.btnEdit}</button><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition">{current.btnDel}</button></div> 
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
                <button key={num} onClick={() => setCurrentPage(num)} className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === num ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-indigo-100 dark:border-gray-700 hover:border-indigo-300'}`}>
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">{current.footerDept}</p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold mt-1 md:mt-2">{current.footerCopy}</p>
      </footer>
    </div>
  )
}
export default TodoPage;