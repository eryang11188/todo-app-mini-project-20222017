import { useState, useEffect } from 'react'
import axios from 'axios'

const QUOTES = [
  "내일의 할 일을 오늘 하라.", "관리는 시간을 창조한다.", "실패는 다시 시작할 기회다.", "오늘 걷지 않으면 내일 뛰어야 한다.",
  "집중력이 실력이다.", "작은 습관이 큰 변화를 만든다.", "시작이 반이다.", "지금 이 순간은 다시 오지 않는다.",
  "생각만 하지 말고 행동하라.", "꿈을 날짜와 적으면 목표가 된다.", "할 수 있다고 믿는 순간 성공은 시작된다.",
  "어제보다 나은 오늘을 위해.", "끝까지 하는 것이 이기는 것이다.", "가장 큰 위험은 아무것도 하지 않는 것이다.",
  "성공은 준비된 자의 몫이다.", "시간은 기다려주지 않는다.", "지식보다 중요한 것은 상상력이다.", "천재는 99%의 노력이다.",
  "할 일이 많을수록 단순하게 생각하라.", "한 번에 하나씩만 집중하라.", "포기하고 싶을 때가 가장 가까운 때다.",
  "고통은 지나가고 보람은 남는다.", "자신을 믿는 것이 첫 번째 비결이다.", "계획 없는 목표는 희망 사항일 뿐이다.",
  "가장 바쁜 사람이 가장 많은 시간을 가진다.", "오늘의 노력이 내일의 나를 만든다.", "변화는 내면에서 시작된다.",
  "승리자는 결코 그만두지 않는다.", "열정 없이는 아무것도 이룰 수 없다.", "기회는 찾는 자에게 온다.",
  "어려움 속에 기회가 있다.", "할 수 있다는 믿음이 산을 옮긴다.", "시간을 정복하는 자가 승리한다.",
  "나중은 없다. 지금 하라.", "꾸준함이 비결이다.", "열심히가 아니라 제대로 하라.", "배움에는 끝이 없다.",
  "지루함을 견디는 자가 성공한다.", "목표를 높게 잡아라.", "실천이 답이다.", "스스로를 이기는 자가 강한 자다.",
  "성공의 반대말은 포기가 아니라 도전하지 않는 것이다.", "오늘의 땀방울이 내일의 기쁨이 된다.", "꿈을 꾸는 자만이 이룰 수 있다.",
  "자신의 한계를 규정하지 마라.", "가장 큰 영광은 넘어지지 않는 것이 아니라 일어나는 것이다.",
  "준비가 기회를 만나면 성공이다.", "긍정적인 생각이 긍정적인 결과를 낳는다.", "남과 비교하지 말고 어제의 나와 비교하라.",
  "매 순간 최선을 다하라."
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomQuote(); }, [])
  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }
  const handleRandomQuote = () => setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  const getRemainingTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - new Date();
    if (diff <= 0) return "EXPIRED";
    const mins = Math.floor(diff / 60000);
    return { mins, hours: Math.floor(mins / 60), totalMs: diff };
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-2xl border-b-[12px] border-blue-900 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600':'bg-gray-800'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600':'bg-gray-800'}`}>스톱워치</button>
          </div>

          <div className="text-7xl font-black mb-10 font-mono tracking-tighter text-white">{formatTime(timerTime)}</div>

          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none"/>
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none"/>
              <button onClick={()=>{
                const h = parseInt(inputs.h)||0; const m = parseInt(inputs.m)||0; const s = parseInt(inputs.s)||0;
                setTimerTime((h*3600 + m*60 + s)*1000); setTimerIsRunning(false);
              }} className="bg-blue-600 px-5 rounded-2xl font-black text-xs hover:bg-blue-500">SET</button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-12 py-4 rounded-full font-black text-lg ${timerIsRunning?'bg-gray-800 text-gray-500':'bg-white text-black'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-12 py-4 rounded-full font-black text-lg text-gray-600">RESET</button>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-800 mb-2">✅ 해야 할 것</h2>
          <div className="flex flex-col items-center">
            <p className="text-blue-500 font-bold text-sm italic">"{quote}"</p>
            <button onClick={handleRandomQuote} className="mt-2 text-[8px] bg-gray-100 text-gray-400 px-2 py-1 rounded-full font-bold">NEW QUOTE</button>
          </div>
        </div>

        <form onSubmit={async (e)=>{e.preventDefault(); if(!title) return; await axios.post(API_URL,{title,importance,todoDeadline}); fetchTodos(); setTitle(''); setTodoDeadline('')}} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-10">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-100 px-4 rounded-2xl font-black text-xs">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          <input placeholder="어떤 일을 완료할까요?" value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-2 outline-none font-bold text-gray-700"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-48 p-2 bg-gray-50 rounded-xl text-[10px] font-bold outline-none"/>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black">ADD</button>
        </form>

        <div className="space-y-4 mb-20">
          {todos.map(todo => {
            const remain = getRemainingTime(todo.todoDeadline);
            const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000;
            return (
              <div key={todo._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-xl group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}></span>
                    <span className="font-black text-gray-700">{todo.title}</span>
                  </div>
                  {remain && (
                    <span className={`text-[10px] font-black ml-6 ${remain === "EXPIRED" ? "text-gray-300" : isUrgent ? "text-red-500 animate-pulse" : "text-blue-400"}`}>
                      ⏱️ {remain === "EXPIRED" ? "만료됨" : `남은 시간: ${remain.hours}시간 ${remain.mins % 60}분`} {isUrgent && " [마감 임박!!]"}
                    </span>
                  )}
                </div>
                <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-100 group-hover:text-red-500 font-black text-lg">✕</button>
              </div>
            );
          })}
        </div>
      </div>
      <footer className="py-12 text-center border-t border-gray-100 mt-10">
        <p className="text-gray-500 font-black text-sm tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-300 text-[10px] font-medium tracking-widest">© 2026 Jung Yi Ryang | Created with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;