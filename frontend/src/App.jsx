import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import './App.css' // 2학년 때 썼던 style.css 내용을 여기 넣으세요!

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isMarketMode, setIsMarketMode] = useState(true) // 기본을 중고마켓으로!
  const [viewType, setViewType] = useState('card') // 'card' or 'table'
  const [filter, setFilter] = useState('all') // 'all', 'unsold', 'sold'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
  const [searchQuery, setSearchQuery] = useState('')

  const API_URL = '/api/todos'

  useEffect(() => { fetchTodos() }, [])

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL)
      setTodos(res.data)
    } catch (err) { console.error('로딩 실패:', err) }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return
    try {
      const res = await axios.post(API_URL, { title, deadline })
      setTodos([...todos, res.data])
      setTitle(''); setDeadline('')
    } catch (err) { alert('등록 실패') }
  }

  // 데이터 가공 로직 (2학년 script.js의 정수!)
  const processedTodos = useMemo(() => {
    return todos
      .filter(t => {
        if (filter === 'sold') return t.completed;
        if (filter === 'unsold') return !t.completed;
        return true;
      })
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [todos, filter, searchQuery, sortOrder]);

  return (
    <div className={`min-h-screen ${isMarketMode ? 'market-theme-bg' : 'bg-slate-100'} p-5`}>
      {/* 🚀 상단 제어바 */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <button 
          onClick={() => setIsMarketMode(!isMarketMode)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
        >
          {isMarketMode ? "✨ 일반 Todo로 보기" : "🏪 CWNU 마켓으로 보기"}
        </button>
        <input 
          type="text" placeholder="물건 검색..." 
          className="border p-2 rounded-lg w-1/3"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* 🏪 중고마켓 헤더 (2학년 감성) */}
        {isMarketMode && (
          <div className="header text-center mb-10">
            <h1 className="text-4xl font-extrabold text-[#002f6c] mb-2">CWNU 중고마켓 v5</h1>
            <p className="text-blue-500 font-medium">2학년의 아쉬움을 리액트로 풀다!</p>
          </div>
        )}

        {/* 📝 입력 폼 */}
        <form onSubmit={addTodo} className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-wrap gap-4 justify-center items-end">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">물품명</label>
            <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2 rounded-md w-48" placeholder="예: 맥북 Pro"/>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">마감일</label>
            <input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} className="border p-2 rounded-md"/>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:scale-105 transition">등록</button>
        </form>

        {/* 🎛️ 필터/정렬/뷰 버튼 그룹 */}
        <div className="flex justify-center gap-4 mb-6">
          <select onChange={(e)=>setFilter(e.target.value)} className="p-2 rounded border">
            <option value="all">전체 상태</option>
            <option value="unsold">거래중</option>
            <option value="sold">거래완료</option>
          </select>
          <select onChange={(e)=>setSortOrder(e.target.value)} className="p-2 rounded border">
            <option value="asc">마감 빠른순</option>
            <option value="desc">마감 늦은순</option>
          </select>
          <button onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')} className="bg-gray-200 px-4 py-2 rounded">
            뷰 방식 변경
          </button>
        </div>

        {/* 📦 리스트 출력 영역 */}
        {viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processedTodos.map(todo => (
              <div key={todo._id} className={`p-5 rounded-2xl shadow-sm border transition hover:-translate-y-2 ${todo.completed ? 'bg-gray-100' : 'bg-white border-blue-100'}`}>
                <h3 className="text-lg font-bold mb-2">{todo.title}</h3>
                <p className="text-sm text-gray-500 mb-4">📅 {todo.deadline}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${todo.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {todo.completed ? "거래완료" : "거래중"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => toggleTodo(todo._id, todo.completed)} className="text-blue-500 text-sm">전환</button>
                    <button onClick={() => deleteTodo(todo._id)} className="text-red-400 text-sm">삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full bg-white rounded-xl overflow-hidden shadow-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-3">물품명</th><th className="p-3">마감일</th><th className="p-3">상태</th><th className="p-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {processedTodos.map(todo => (
                <tr key={todo._id} className="border-t text-center">
                  <td className="p-3">{todo.title}</td>
                  <td className={`p-3 ${new Date(todo.deadline) < new Date() ? 'text-red-500 font-bold' : ''}`}>{todo.deadline}</td>
                  <td className="p-3">{todo.completed ? "✅ 완료" : "🟡 대기"}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button onClick={() => toggleTodo(todo._id, todo.completed)} className="bg-blue-100 px-2 py-1 rounded text-xs">상태변경</button>
                    <button onClick={() => deleteTodo(todo._id)} className="bg-red-100 px-2 py-1 rounded text-xs">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}