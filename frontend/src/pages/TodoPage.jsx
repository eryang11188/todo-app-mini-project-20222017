// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

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

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  
  const [viewType, setViewType] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8;
  
  // 🚀 3. 초 단위 실시간 카운트다운을 위한 현재 시간 State
  const [now, setNow] = useState(new Date());
  
  // 🚀 4. 마감 30분 전 빨간색 알림 토글 State
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomQuote(); }, [])
  
  // 🚀 1초마다 현재 시간 업데이트 (실시간 카운트다운용)
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }
  const handleRandomQuote = () => setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  // 🚀 3. 초 단위까지 계산하도록 변경
  const getRemainingTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const targetDate = new Date(deadlineStr);
    const diff = targetDate - now;
    if (diff <= 0) return "EXPIRED";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return { days, hours, mins, secs, totalMs: diff };
  }

  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    if (todoDeadline && new Date(todoDeadline) < new Date()) {
      if (!window.confirm("⚠️ 설정하신 마감 기한이 이미 지났습니다. 그래도 추가하시겠습니까?")) return;
    }
    await axios.post(API_URL, { title, importance, todoDeadline }); 
    fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1);
  }

  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-b-[12px] border-blue-900 text-center relative">
          
          {/* 🚀 4. 알림 토글 버튼 */}
          <div className="absolute top-8 right-10 flex items-center gap-2">
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

          <div className="text-7xl font-black mb-10 font-mono tracking-tighter text-white drop-shadow-lg">{formatTime(timerTime)}</div>

          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <button onClick={()=>{
                const h = parseInt(inputs.h)||0; const m = parseInt(inputs.m)||0; const s = parseInt(inputs.s)||0;
                setTimerTime((h*3600 + m*60 + s)*1000); setTimerIsRunning(false);
              }} className="bg-blue-600 px-5 rounded-2xl font-black text-xs hover:bg-blue-500 transition-colors">SET</button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-12 py-4 rounded-full font-black text-lg transition-all ${timerIsRunning?'bg-gray-800 text-gray-500':'bg-white text-black hover:scale-105 active:scale-95'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-12 py-4 rounded-full font-black text-lg text-gray-600 hover:border-gray-600 transition-colors">RESET</button>
          </div>
        </div>

        <div className="text-center mb-10">
          {/* 🚀 10. 제목 간지나게 변경 */}
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black mb-6 tracking-tighter">🎯 EPIC MISSION OBJECTIVES</h2>
          
          {/* 🚀 2 & 11. 명언 가독성/간지 개선 (유리 질감 + 깔끔한 폰트) */}
          <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <p className="text-xl font-serif text-indigo-700 font-bold mb-2 tracking-wide drop-shadow-sm">"{quote.en}"</p>
            <p className="text-gray-600 font-medium text-sm tracking-wide">{quote.ko}</p>
            <button onClick={handleRandomQuote} className="mt-4 text-[10px] bg-white border border-gray-200 text-gray-400 px-4 py-1.5 rounded-full font-bold hover:text-blue-500 hover:border-blue-300 shadow-sm transition">🔄 NEW QUOTE</button>
          </div>
        </div>

        <form onSubmit={addTodo} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-6">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-100 px-4 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-blue-200">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          <input placeholder="어떤 위대한 미션을 수행할까요?" value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-2 outline-none font-bold text-gray-700 focus:border-b-2 border-blue-500 transition-all"/>
          {/* 🚀 8. 클릭 시 달력 팝업 */}
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-48 p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border focus:ring-2 ring-blue-200 cursor-pointer"/>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition">ADD</button>
        </form>

        <div className="flex justify-end mb-6 gap-2">
          <button onClick={() => setViewType('list')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='list'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>LIST</button>
          <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='grid'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>GRID</button>
          <button onClick={() => setViewType('table')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>TABLE</button>
        </div>

        {viewType === 'table' ? (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-6 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#111] text-white text-sm font-bold">
                <tr><th className="p-4">우선순위</th><th className="p-4 text-left">미션명</th><th className="p-4">실시간 마감 카운트</th><th className="p-4">완료</th></tr>
              </thead>
              <tbody>
                {currentTodos.map(todo => {
                  const remain = getRemainingTime(todo.todoDeadline);
                  // 🚀 4. 토글 활성화 시에만 빨간색 깜빡임 적용
                  const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000 && isAlertEnabled;
                  return (
                    <tr key={todo._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}>{todo.importance}</span></td>
                      <td className="p-4 text-left font-black text-gray-700">{todo.title}</td>
                      <td className="p-4">
                        {remain ? (
                          <span className={`text-[11px] font-black ${remain === "EXPIRED" ? "text-gray-400" : isUrgent ? "text-red-500 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-blue-500"}`}>
                            {remain === "EXPIRED" ? "기한 만료" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${remain.secs}초 남음`}
                          </span>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                      </td>
                      <td className="p-4"><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-300 hover:text-red-500 font-black text-lg">✕</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={viewType === 'list' ? "space-y-4 mb-6" : "grid grid-cols-2 gap-4 mb-6"}>
            {currentTodos.map(todo => {
              const remain = getRemainingTime(todo.todoDeadline);
              const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000 && isAlertEnabled;
              return (
                <div key={todo._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-xl group">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}></span>
                      <span className="font-black text-gray-800">{todo.title}</span>
                    </div>
                    {remain && (
                      <span className={`text-[10px] font-black ml-6 ${remain === "EXPIRED" ? "text-gray-300" : isUrgent ? "text-red-500 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-blue-400"}`}>
                        ⏱️ {remain === "EXPIRED" ? "만료됨" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${remain.secs}초 남음`} {isUrgent && " [🚨 임박]"}
                      </span>
                    )}
                  </div>
                  <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-200 group-hover:text-red-500 font-black text-lg transition-colors">✕</button>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="font-black text-[#111] text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Created with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;