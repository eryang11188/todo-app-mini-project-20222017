// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

// 🚀 6. 이모지 제거 및 다양한 동기부여/질문 제목 대량 추가
const TITLE_MENTIONS = [
  "오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", 
  "지루함을 깨뜨릴 오늘의 스케줄을 적어주세요.", "미래의 나에게 부끄럽지 않을 계획을 세웁시다.",
  "작은 목표가 모여 전설을 만듭니다.", "당신의 한계를 돌파할 계획을 적어주세요.",
  "오늘 반드시 끝내야 할 단 하나의 일은?", "오늘 세상을 바꿀 첫 걸음은?"
];

// 🚀 9. 명언 데이터는 MarketPage와 별개로 Todo 특화 명언 대량 추가
const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "Management creates time.", ko: "관리는 시간을 창조한다." },
  { en: "Failure is the opportunity to begin again more intelligently.", ko: "실패는 다시 시작할 기회다." },
  { en: "If you don't walk today, you'll have to run tomorrow.", ko: "오늘 걷지 않으면 내일 뛰어야 한다." },
  { en: "Focus is a skill.", ko: "집중력이 실력이다." },
  { en: "Small habits make big changes.", ko: "작은 습관이 큰 변화를 만든다." },
  { en: "A goal without a timeline is just a dream.", ko: "꿈을 날짜와 적으면 목표가 된다." },
  { en: "The one who finishes is the one who wins.", ko: "끝까지 하는 것이 이기는 것이다." },
  { en: "Time waits for no one.", ko: "시간은 기다려주지 않는다." },
  { en: "Discipline is the bridge between goals and accomplishment.", ko: "규율은 목표와 성취를 잇는 다리이다." }
];

// 도움말 투어 데이터
const TOUR_STEPS = [
  { title: "👋 환영합니다!", desc: "CWNU 포털의 핵심 기능을 빠르게 안내해 드릴게요. (화면이 자동으로 이동합니다)", targetId: "tour-header" },
  { title: "⏱️ 타이머 & 스톱워치", desc: "이곳에서 집중할 시간을 설정하거나 측정이 가능합니다. (스톱워치 모드에선 경고가 해제됩니다)", targetId: "tour-timer" },
  { title: "🚨 30분 전 알림 토글", desc: "오른쪽 위 버튼을 켜면, 메인 타이머가 30분 이하로 남았을 때 빨간색으로 깜빡이며 경고해줍니다!", targetId: "tour-timer-alert" },
  { title: "⏰ 초정밀 마감 카운트다운", desc: "할 일을 추가할 때 달력을 눌러 날짜와 시간을 지정해보세요. 실시간으로 남은 시간이 초 단위로 줄어듭니다.", targetId: "tour-add" },
  { title: "📝 자유로운 뷰 & 관리", desc: "등록된 할 일을 목록, 그리드, 테이블 형태로 자유롭게 보고 관리할 수 있습니다.", targetId: "tour-list" }
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  
  // 🚀 6. 투두 제목 애니메이션 상태
  const [titleMentionIndex, setTitleMentionIndex] = useState(0);

  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  const [viewType, setViewType] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8;
  const [now, setNow] = useState(new Date());
  
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [tourIndex, setTourIndex] = useState(-1)
  const [tourPos, setTourPos] = useState({ top: 0, left: 0 })

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomQuote(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(intervalId); }, []);

  // 🚀 6. 6초마다 투두 제목 변경 인터벌
  useEffect(() => {
    const intervalId = setInterval(() => {
        setTitleMentionIndex(prev => (prev + 1) % TITLE_MENTIONS.length);
    }, 6000); 
    return () => clearInterval(intervalId);
  }, []);

  // 도움말 위치 추적 (요청 5. 3, 4, 5단계 설명 안정화)
  useEffect(() => {
    if (tourIndex >= 0) {
      const step = TOUR_STEPS[tourIndex];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTourPos({ 
            top: rect.bottom + window.scrollY + 15, 
            left: Math.max(20, rect.left + window.scrollX - 20) 
          });
          el.classList.add('ring-4', 'ring-yellow-400', 'z-50', 'relative', 'bg-white', 'transition-all');
          setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400', 'z-50', 'relative', 'bg-white', 'transition-all'), 3000);
        }, 400);
      } else {
        setTourPos({ top: window.scrollY + window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 150 });
      }
    }
  }, [tourIndex]);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const handleRandomQuote = () => setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  const getRemainingTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - now;
    if (diff <= 0) return "EXPIRED";
    const mins = Math.floor(diff / 60000);
    return { mins, hours: Math.floor(mins / 60), totalMs: diff };
  }

  // 🚀 8. 타이머 입력값 검증 (0~59 / 0~23 / 음수/세자리 방지)
  const validateTimerInputs = (h, m, s) => {
    const hour = parseInt(h); const min = parseInt(m); const sec = parseInt(s);
    if (isNaN(hour) || isNaN(min) || isNaN(sec)) return false; // 숫자가 아니면 실패
    if (hour < 0 || min < 0 || sec < 0) return false; // 음수 실패
    if (hour > 23 || min > 59 || sec > 59) return false; // 범위 초과 실패
    if (h.length > 2 || m.length > 2 || s.length > 2) return false; // 세자리 이상 실패
    return true;
  }

  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    if (todoDeadline && new Date(todoDeadline) < new Date()) {
      if (!window.confirm("⚠️ 설정하신 마감 기한이 이미 지났습니다. 그래도 할 일을 추가하시겠습니까?")) return;
    }
    const res = await axios.post(API_URL, { title, importance, todoDeadline }); fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1);
  }

  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col min-h-screen relative">
      <style>{`
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .tour-popup { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        /* 🚀 텍스트 페이드 애니메이션 */
        .submit-mention-enter { opacity: 0; transform: translateY(5px); }
        .submit-mention-enter-active { opacity: 1; transform: translateY(0); transition: all 0.5s ease-out; }
        .submit-mention-exit { opacity: 1; transform: translateY(0); }
        .submit-mention-exit-active { opacity: 0; transform: translateY(-5px); transition: all 0.5s ease-in; }
      `}</style>

      {tourIndex >= 0 && (
        <>
          <div className="fixed inset-0 bg-black/5 z-[90] pointer-events-none transition-opacity duration-300"></div>
          <div className="absolute z-[100] bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-2 border-indigo-400 w-80 tour-popup transition-all duration-500 ease-in-out"
               style={{ top: tourPos.top, left: tourPos.left }}>
            <div className="absolute -top-3 left-6 w-5 h-5 bg-white border-t-2 border-l-2 border-indigo-400 rotate-45"></div>
            <h3 className="text-indigo-600 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
            <h2 className="text-xl font-black text-gray-800 mb-3">{TOUR_STEPS[tourIndex].title}</h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-5">{TOUR_STEPS[tourIndex].desc}</p>
            <div className="flex justify-between gap-2">
              <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">건너뛰기</button>
              <button onClick={() => setTourIndex(prev => prev + 1 >= TOUR_STEPS.length ? -1 : prev + 1)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">
                {tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex-grow 푸터_노출_확인_TODO">
        <div id="tour-header" className="text-center mb-10 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs hover:bg-yellow-200 transition shadow-sm z-10 animate-pulse">💡 도움말 투어 시작</button>
          
          <h2 className="text-5xl font-black text-[#002f6c] mb-3 tracking-tighter flex justify-center items-center">
            CWNU PORTAL V5
            <span className="inline-block ml-3 pr-4 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 hover:scale-110 transition-transform duration-300 italic drop-shadow-lg text-4xl">super</span>
          </h2>
          <p className="text-blue-500 font-black uppercase tracking-widest text-sm bg-blue-50 inline-block px-4 py-1 rounded-full">"{quote.en}"</p>
        </div>

        <div id="tour-timer" className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-b-[12px] border-indigo-900 text-center relative mt-8">
          
          <div id="tour-timer-alert" className="absolute top-8 right-10 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">30분 전 빨간색 경고</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} />
              <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-red-500 peer-focus:ring-2 peer-focus:ring-red-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>스톱워치</button>
          </div>

          <div className={`text-7xl font-black mb-10 font-mono tracking-tighter text-white drop-shadow-lg ${isTimerUrgent ? 'animate-[pulse_1s_ease-in-out_infinite] text-red-500' : ''}`}>{formatTime(timerTime)}</div>

          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <button onClick={()=>{
                const { h, m, s } = inputs;
                if (!validateTimerInputs(h, m, s)) { alert("⚠️ 유효한 시간 입력값(H:0~23, M/S:0~59)을 두 자리 숫자로 입력해주세요."); return; } //요청 8 적용
                const hour = parseInt(h); const min = parseInt(m); const sec = parseInt(s);
                setTimerTime((hour*3600 + min*60 + sec)*1000); setTimerIsRunning(false);
              }} className="bg-blue-600 px-5 rounded-2xl font-black text-xs hover:bg-blue-500 transition-colors shadow-xl">SET</button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-12 py-4 rounded-full font-black text-lg transition-all ${timerIsRunning?'bg-gray-800 text-gray-400':'bg-white text-black hover:scale-105 active:scale-95'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-12 py-4 rounded-full font-black text-lg text-gray-600 hover:border-gray-600 transition-colors">RESET</button>
          </div>
        </div>

        <div className="text-center mb-10">
          {/* 🚀 6. 이모지 제거 및 다양한 미션 제목 애니메이션 */}
          <h2 className="text-4xl font-black text-gray-800 mb-6 tracking-tighter overflow-hidden relative h-12 flex justify-center items-center">
            <span key={TITLE_MENTIONS[titleMentionIndex]} className="inline-block animate-submit-text-fade">
              {TITLE_MENTIONS[titleMentionIndex]}
            </span>
          </h2>
          
          <div className="flex flex-col items-center bg-gray-50 p-6 rounded-3xl border shadow-inner">
            <p className="text-2xl font-[cursive] italic bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-2 leading-relaxed tracking-wide">
              "{quote.en}"
            </p>
            <p className="text-gray-500 font-bold text-sm tracking-wide">{quote.ko}</p>
            <button onClick={handleRandomQuote} className="mt-4 text-[10px] bg-white border text-gray-400 px-3 py-1 rounded-full font-bold hover:text-blue-500 shadow-sm transition">🔄 New Quote</button>
          </div>
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-6">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-100 px-4 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-blue-200">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          <input placeholder="어떤 위대한 미션을 수행할까요?" value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-2 outline-none font-bold text-gray-700 focus:border-b-2 border-blue-500 transition-all"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-48 p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border focus:ring-2 ring-blue-200 cursor-pointer"/>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition tracking-widest uppercase text-sm">추가하기</button>
        </form>

        <div id="tour-list" className="flex justify-end mb-6 gap-2">
          <button onClick={() => setViewType('list')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='list'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>LIST</button>
          <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='grid'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>GRID</button>
          <button onClick={() => setViewType('table')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>TABLE</button>
        </div>

        <div className={viewType === 'list' ? "space-y-4 mb-6" : "grid grid-cols-2 gap-4 mb-6"}>
          {currentTodos.map(todo => {
            const remain = getRemainingTime(todo.todoDeadline);
            const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000;
            return (
              <div key={todo._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-xl group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}></span>
                    <span className="font-black text-gray-800">{todo.title}</span>
                  </div>
                  {remain && (
                    <span className={`text-[10px] font-black ml-6 ${remain === "EXPIRED" ? "text-gray-300" : isUrgent ? "animate-[pulse_1s_ease-in-out_infinite] text-red-500" : "text-blue-400"}`}>
                      ⏱️ {remain === "EXPIRED" ? "만료됨 💀" : `남은 시간: ${remain.hours}시간 ${remain.mins}분`} {isUrgent && " [🚨 마감 임박!!]"}
                    </span>
                  )}
                </div>
                <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-200 group-hover:text-red-500 font-black text-lg transition-colors">✕</button>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition">PREV</button>
            <span className="font-black text-[#002f6c] text-xl bg-blue-50 px-6 py-2 rounded-2xl">{currentPage} <span className="text-gray-300 mx-1">/</span> {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10 푸터_노출_확인_TODO">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;