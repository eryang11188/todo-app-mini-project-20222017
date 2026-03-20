import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function TodoPage() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  
  const [mode, setMode] = useState('timer'); const [time, setTime] = useState(0); const [isRunning, setIsRunning] = useState(false)
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  const timerRef = useRef(null)

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => mode === 'timer' ? (prev <= 10 ? 0 : prev - 10) : prev + 10);
        if (mode === 'timer' && time <= 10) setIsRunning(false);
      }, 10);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, time]);

  useEffect(() => { fetchTodos() }, [])
  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }

  const addTodo = async (e) => {
    e.preventDefault(); if (!title) return
    const res = await axios.post(API_URL, { title, importance, todoDeadline })
    setTodos([...todos, res.data]); setTitle(''); setTodoDeadline('')
  }
  const deleteTodo = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setTodos(todos.filter(t => t._id !== id)) }

  const formatTime = (ms) => {
    const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="bg-black text-white p-8 rounded-[3rem] mb-12 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <button onClick={()=>{setMode('timer'); setTime(0)}} className="bg-blue-600 px-4 py-1 rounded-full text-xs">타이머</button>
            <button onClick={()=>{setMode('stopwatch'); setTime(0)}} className="bg-red-600 px-4 py-1 rounded-full text-xs">스톱워치</button>
          </div>
          <div className="text-7xl font-mono mb-6 text-blue-400">{formatTime(time)}</div>
          
          {mode === 'timer' && !isRunning && (
            <div className="flex justify-center gap-2 mb-4 text-black">
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-2 rounded"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-2 rounded"/>
              <button onClick={()=>{setTime(((parseInt(inputs.m)||0)*60 + (parseInt(inputs.s)||0))*1000)}} className="bg-blue-600 text-white px-4 rounded">SET</button>
            </div>
          )}

          <button onClick={()=>setIsRunning(!isRunning)} className="bg-white text-black px-10 py-3 rounded-full font-black">{isRunning?'PAUSE':'START'}</button>
        </div>

        <div className="mb-10 text-center"><h2 className="text-4xl font-black">✅ 해야 할 것</h2></div>
        
        <form onSubmit={addTodo} className="bg-white p-4 flex gap-3 mb-8 border rounded-xl">
          <select value={importance} onChange={(e)=>setImportance(e.target.value)} className="bg-gray-100 p-2"><option>긴급</option><option>보통</option><option>낮음</option></select>
          <input placeholder="할 일 입력" value={title} onChange={(e)=>setTitle(e.target.value)} className="flex-grow p-2"/>
          {/* ⏰ 투두 마감시간 입력칸 */}
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="p-2 bg-gray-50 rounded border text-xs"/>
          <button className="bg-black text-white px-8 py-2 rounded-xl">추가</button>
        </form>
        
        <div className="space-y-4">
          {todos.map(todo => (
            <div key={todo._id} className="bg-white p-6 rounded-2xl border flex justify-between">
              <div>
                <span className="font-bold">[{todo.importance}] {todo.title}</span>
                {todo.todoDeadline && <p className="text-xs text-blue-500 mt-1">마감: {todo.todoDeadline}</p>}
              </div>
              <button onClick={() => deleteTodo(todo._id)} className="text-red-500 font-bold">X</button>
            </div>
          ))}
        </div>
      </div>
      <footer className="py-8 text-center border-t border-gray-100 mt-10">
        <p className="text-gray-500 font-bold text-sm">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-300 text-xs mt-1">© 2026 Jung Yi Ryang</p>
      </footer>
    </div>
  )
}
export default TodoPage;