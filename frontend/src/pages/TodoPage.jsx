// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

const TITLE_MENTIONS = ["오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", "지루함을 깨뜨릴 오늘의 스케줄을 적어주세요.", "미래의 나에게 부끄럽지 않을 계획을 세웁시다.", "작은 목표가 모여 전설을 만듭니다."];
const PLACEHOLDERS = ["어떤 위대한 미션을 수행할까요?", "성장을 위한 작은 습관 추가", "목표를 적는 순간 이미 반은 성공입니다."];
const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "Management creates time.", ko: "관리는 시간을 창조한다." },
  { en: "Failure is the opportunity to begin again more intelligently.", ko: "실패는 다시 시작할 기회다." },
  { en: "Time waits for no one.", ko: "시간은 기다려주지 않는다." },
  { en: "Small habits make big changes.", ko: "작은 습관이 큰 변화를 만든다." }
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
  const API_URL = '/api/todo'; const COMMON_URL = '/api/items';

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 50); return () => clearInterval(intervalId); }, []);
  useEffect(() => { const intervalId = setInterval(() => { setTitleMentionIndex(p => (p + 1) % TITLE_MENTIONS.length); setPlaceholderIndex(p => (p + 1) % PLACEHOLDERS.length); }, 6000); return () => clearInterval(intervalId); }, []);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  // 🚀 가이드 투어 로직 완벽 복구
  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < TOUR_STEPS.length) {
      if (tourIndex === 2 && timerMode !== 'timer') setTimerMode('timer'); 
      const el = document.getElementById(TOUR_STEPS[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, timerMode]);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const handleRandomize = () => { setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]); setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS.length)); }
  const formatTime = (ms) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); const mi = Math.floor((ms % 1000) / 10); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mi).padStart(2,'0')}`; }
  const getRemainingTime = (deadline) => { if (!deadline) return null; const diff = new Date(deadline) - now; if (diff <= 0) return "EXPIRED"; return { days: Math.floor(diff/86400000), hours: Math.floor((diff/3600000)%24), mins: Math.floor((diff/60000)%60), secs: Math.floor((diff/1000)%60), ms: Math.floor((diff%1000)/10), totalMs: diff }; }
  
  const addTodo = async (e) => { e.preventDefault(); if(!title) return; await axios.post(API_URL, { title, importance, todoDeadline }); fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1); handleRandomize(); }
  const saveEditTodo = async (id) => { await axios.put(`${COMMON_URL}/${id}`, editForm); fetchTodos(); setEditingId(null); }
  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col min-h-screen relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nanum+Pen+Script&display=swap');
        .font-cursive-custom { font-family: 'Caveat', 'Nanum Pen Script', cursive; letter-spacing: 0.05em; }
        .font-korean-cursive { font-family: 'Nanum Pen Script', cursive; letter-spacing: 0.1em; }
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white p-6 rounded-3xl shadow-2xl border-[3px] border-indigo-400 w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-indigo-600 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-xl font-black mb-3">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 text-sm font-bold mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">건너뛰기</button><button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">{tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}</button></div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-indigo-50 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            <h3 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center">🚀 Todo V5_super_3.5 ver 업데이트 내역</h3>
            <p className="text-center text-gray-500 font-bold mb-8 text-xs">웹프로그래밍 과제 25-2 기말대체 `todos_v4`의 최종 진화형!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-6">
              <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 text-center text-xs">❌ 이전: 타이머 및 마감기한 부재</div>
              <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-200 shadow-inner text-center text-xs font-black">✅ 현재: 30분 전 알람 및 실시간 카운트다운</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8"><h4 className="text-xl font-black text-gray-800 mb-4 text-center flex items-center justify-center gap-3">🛠️ CWNU PORTAL V5 발전 과정</h4><div className="space-y-4 text-sm font-medium text-gray-600"><p>• <span className="text-indigo-600 font-black">V1.0:</span> 투두 CRUD 및 서버 연동</p><p>• <span className="text-indigo-600 font-black">V2.0:</span> 중고마켓 서비스 추가</p><p>• <span className="text-indigo-600 font-black">V3.0:</span> 학점계산기 통합 및 데이터 시각화</p></div></div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition">확인 완료!</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-6 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs animate-pulse">💡 가이드 시작</button>
          <h2 className="text-5xl font-black text-[#002f6c] mb-3 tracking-tighter flex justify-center items-center cursor-pointer">
            CWNU TODO <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 transition-transform duration-300 italic drop-shadow-lg text-4xl">V5_super_3.5</span>
          </h2>
          <p className="text-gray-400 font-bold text-xs mb-3 cursor-pointer hover:text-indigo-400 transition" onClick={() => setShowVersionInfo(true)}>(업데이트 내역을 보려면 V5를 클릭하세요! 🚀)</p>
        </div>

        <div id="tour-timer" className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-2xl border-b-[12px] border-indigo-900 text-center relative mt-8">
          {timerMode === 'timer' && (
            <div id="tour-timer-alert" className="absolute top-8 right-10 flex items-center gap-2 bg-gray-900 p-2 rounded-xl border border-gray-700 z-10">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isAlertEnabled ? 'text-red-400' : 'text-gray-500'}`}>30분 전 알람</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} /><div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label>
            </div>
          )}
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>스톱워치</button>
          </div>
          <div className={`text-7xl font-black mb-10 font-mono tracking-tighter ${isTimerUrgent ? 'animate-[pulse_1s_ease-in-out_infinite] text-red-500' : ''}`}>{formatTime(timerTime)}</div>
          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/><input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/><input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/><button onClick={()=>{ const hour = parseInt(inputs.h || 0); const min = parseInt(inputs.m || 0); const sec = parseInt(inputs.s || 0); setTimerTime((hour*3600 + min*60 + sec)*1000); setTimerIsRunning(false); }} className="bg-blue-600 px-5 rounded-2xl font-black text-xs hover:bg-blue-500 transition shadow-xl">SET</button>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-12 py-4 rounded-full font-black text-lg transition-all ${timerIsRunning?'bg-gray-800 text-gray-400':'bg-white text-black hover:scale-105 active:scale-95'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-12 py-4 rounded-full font-black text-lg text-gray-600 hover:border-gray-600 transition-colors">RESET</button>
          </div>
        </div>

        {/* 🚀 명언 섹션: 글자 짤림 방지를 위해 h-14 제거 및 py-2 추가 */}
        <div className="text-center mb-10">
          <h2 className="text-[2.5rem] py-2 font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-800 to-black mb-8 tracking-tighter drop-shadow-sm flex justify-center items-center relative">
             <span key={TITLE_MENTIONS[titleMentionIndex]} className="inline-block animate-submit-text-fade">{TITLE_MENTIONS[titleMentionIndex]}</span>
          </h2>
          <div className="flex flex-col items-center p-10 rounded-[3rem] border-2 border-indigo-100 bg-gradient-to-b from-white to-indigo-50/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/50 rounded-tr-full opacity-50"></div>
            {/* 🚀 명언 텍스트 짤림 방지 py-2 */}
            <p className="text-[2.5rem] py-2 font-cursive-custom font-black mb-5 drop-shadow-md text-center px-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">"{quote.en}"</p>
            <p className="text-3xl font-korean-cursive text-gray-700 font-bold bg-white/80 px-8 py-3 rounded-full shadow-sm border border-gray-100">{quote.ko}</p>
            <button onClick={handleRandomize} className="mt-8 text-[11px] bg-white border-2 border-gray-200 text-gray-500 px-6 py-2.5 rounded-full font-black hover:text-indigo-600 hover:border-indigo-400 shadow-sm transition-all hover:scale-105 z-10 uppercase tracking-widest">🔄 New Quote</button>
          </div>
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-6 relative overflow-hidden">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-50 px-5 rounded-2xl font-black text-sm outline-none border border-gray-100 z-10"><option>긴급</option><option>보통</option><option>낮음</option></select>
          <input placeholder={PLACEHOLDERS[placeholderIndex]} value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-3 outline-none font-bold text-gray-800 text-lg z-10"/><input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-56 p-3 bg-gray-50 rounded-2xl text-xs font-black cursor-pointer text-gray-600 z-10"/><button className="bg-indigo-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-lg z-10">추가하기</button>
        </form>

        <div className="flex justify-end mb-6">
          <div id="tour-list-buttons" className="flex gap-2 bg-white/50 p-1.5 rounded-full border border-gray-200 shadow-sm">
            <button onClick={() => setViewType('list')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='list'?'bg-indigo-900 text-white':'bg-white text-gray-400 hover:text-indigo-500'}`}>LIST</button>
            <button onClick={() => setViewType('grid')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='grid'?'bg-indigo-900 text-white':'bg-white text-gray-400 hover:text-indigo-500'}`}>GRID</button>
            <button onClick={() => setViewType('table')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='table'?'bg-indigo-900 text-white':'bg-white text-gray-400 hover:text-indigo-500'}`}>TABLE</button>
          </div>
        </div>

        <div className="transition-all">
          {viewType === 'table' ? (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-8 w-full"><table className="w-full text-center"><thead className="bg-[#111] text-white text-sm font-bold uppercase tracking-widest"><tr><th className="p-5">우선순위</th><th className="p-5 text-left">미션명</th><th className="p-5">남은 시간</th><th className="p-5">관리</th></tr></thead><tbody>
              {currentTodos.map(todo => { 
                const remain = getRemainingTime(todo.todoDeadline); 
                return ( 
                <tr key={todo._id} className="border-b hover:bg-indigo-50/30 transition-colors"> 
                  {editingId === todo._id ? (
                    <td colSpan="4" className="p-4 bg-indigo-50/50">
                      <div className="flex gap-2 items-center">
                        <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-2 border rounded-xl font-bold text-xs"><option>긴급</option><option>보통</option><option>낮음</option></select>
                        <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="flex-grow p-2 border rounded-xl font-bold text-sm outline-none"/>
                        <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-2 border rounded-xl text-xs font-bold outline-none"/>
                        <button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-green-600 transition">저장</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-gray-500 transition">취소</button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="p-5"><span className={`px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}>{todo.importance}</span></td> 
                      <td className="p-5 text-left font-black text-gray-800 text-lg">{todo.title}</td> 
                      <td className="p-5 text-xs font-black text-indigo-600">{remain === "EXPIRED" ? "💀 기한만료" : remain ? `${remain.days}일 ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}` : "-"}</td> 
                      <td className="p-5 flex justify-center gap-2"><button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full transition">Edit</button><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[10px] font-black uppercase text-red-400 hover:text-white hover:bg-red-500 bg-red-50 px-3 py-1.5 rounded-full transition">Del</button></td> 
                    </>
                  )}
                </tr> 
              )})}
            </tbody></table></div>
          ) : (
            <div className={viewType === 'list' ? "space-y-4 mb-8" : "grid grid-cols-2 gap-5 mb-8"}>
              {currentTodos.map(todo => { 
                const remain = getRemainingTime(todo.todoDeadline); 
                return ( 
                <div key={todo._id} className="bg-white p-7 rounded-[2.5rem] shadow-md border border-gray-100 flex flex-col group transition-all hover:-translate-y-1 hover:shadow-xl"> 
                  {editingId === todo._id ? (
                    <div className="flex flex-col gap-3">
                      <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl font-bold text-sm outline-none"><option>긴급</option><option>보통</option><option>낮음</option></select>
                      <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl font-black text-gray-800 outline-none"/>
                      <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl text-xs font-bold text-gray-600 outline-none"/>
                      <div className="flex gap-2"><button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white flex-grow py-2.5 rounded-xl font-black text-xs shadow-md hover:bg-green-600 transition">저장</button><button onClick={() => setEditingId(null)} className="bg-gray-400 text-white flex-grow py-2.5 rounded-xl font-black text-xs shadow-md hover:bg-gray-500 transition">취소</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 w-full"><span className={`min-w-[12px] h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}></span><span className="font-black text-gray-800 text-xl truncate">{todo.title}</span></div> 
                      {remain && <div className={`text-[10px] font-black ml-6 mt-1 bg-gray-50 inline-block px-3 py-1 rounded-lg border ${remain === "EXPIRED" ? "text-gray-400 border-gray-200" : "text-indigo-600 border-indigo-100"}`}>⏱️ {remain === "EXPIRED" ? "만료됨" : `${remain.days}일 ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')} 남음`}</div>} 
                      <div className="flex gap-2 mt-4 ml-6"><button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="px-4 py-2 bg-indigo-50 text-indigo-500 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition">Edit</button><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="px-4 py-2 bg-red-50 text-red-400 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition">Delete</button></div> 
                    </>
                  )}
                </div> 
              ); })}
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">PREV</button>
            <span className="font-black text-[#111] text-xl bg-gray-100 px-6 py-2 rounded-2xl">{currentPage} <span className="text-gray-400 mx-1">/</span> {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>
      <footer className="py-12 text-center border-t border-gray-200 mt-10 z-10"><p className="text-gray-500 font-black text-base uppercase tracking-widest">Software Engineering Project: CWNU Portal System</p><p className="text-gray-400 text-sm font-bold">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p></footer>
    </div>
  )
}
export default TodoPage;