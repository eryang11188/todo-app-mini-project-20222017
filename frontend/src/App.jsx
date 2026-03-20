import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  /* [수정 전]
  const API_URL = 'http://localhost:5000/api/todos'*/
  
  // [수정 후] - 이렇게 바꿔야 배포된 서버 주소를 알아서 찾아갑니다.
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
    if (!title.trim()) return
    try {
      const res = await axios.post(API_URL, { title })
      setTodos([...todos, res.data]); setTitle('')
    } catch (err) { console.error('추가 실패:', err) }
  }

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed })
      setTodos(todos.map(todo => todo._id === id ? res.data : todo))
    } catch (err) { console.error('수정 실패:', err) }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setTodos(todos.filter(todo => todo._id !== id))
    } catch (err) { console.error('삭제 실패:', err) }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Todo List</h1>
        <form onSubmit={addTodo} className="flex mb-6">
          <input 
            type="text" className="border-2 border-gray-200 p-2 flex-grow rounded-l-md focus:border-blue-400 outline-none"
            placeholder="할 일을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">추가</button>
        </form>
        <ul className="space-y-3">
          {todos.map(todo => (
            <li key={todo._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
              <div className="flex items-center">
                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id, todo.completed)} className="mr-3 w-5 h-5 cursor-pointer" />
                <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{todo.title}</span>
              </div>
              <button onClick={() => deleteTodo(todo._id)} className="text-red-400 hover:text-red-600 font-bold">삭제</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App