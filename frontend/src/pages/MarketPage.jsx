import { useState, useEffect } from 'react'
import axios from 'axios'

function MarketPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '' })
  
  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => { const res = await axios.get(API_URL); setItems(res.data) }

  // 📞 전화번호 하이픈 로직 추가!
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    else if (value.length > 7) formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setForm({ ...form, phone: formatted });
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return
    const res = await axios.post(API_URL, form)
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '' })
  }
  const toggleStatus = async (id, completed) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { completed: !completed })
    setItems(items.map(item => item._id === id ? res.data : item))
  }
  const deleteItem = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setItems(items.filter(item => item._id !== id)) }

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black text-[#002f6c] mb-2">CWNU MARKET <span className="text-red-500">v5_super.ver</span></h2>
          <p className="text-blue-500 font-bold">Campus Life, Better Trade!</p>
        </div>
        <form onSubmit={addItem} className="bg-white p-8 rounded-3xl shadow-xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-3 rounded-xl"/>
          <input placeholder="가격(원)" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-3 rounded-xl"/>
          <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border p-3 rounded-xl"/>
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border p-3 rounded-xl"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border p-3 rounded-xl"/>
          <input placeholder="전화번호" value={form.phone} onChange={handlePhoneChange} className="border p-3 rounded-xl"/>
          <button className="md:col-span-3 bg-[#002f6c] text-white p-4 rounded-xl font-black">등록하기</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(item => (
            <div key={item._id} className="p-6 rounded-[2.5rem] border-4 bg-white shadow-sm">
              <h3 className={`text-2xl font-black ${item.completed ? 'text-red-600 line-through' : ''}`}>{item.title}</h3>
              <p className="text-3xl font-black text-blue-700 my-2">{Number(item.price).toLocaleString()}원</p>
              <div className="text-sm text-gray-500 mb-4"><p>👤 {item.sellerName}</p><p>📞 {item.phone}</p></div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(item._id, item.completed)} className="bg-gray-200 p-2 rounded flex-grow font-bold">{item.completed ? "취소" : "거래완료"}</button>
                <button onClick={() => deleteItem(item._id)} className="bg-red-100 text-red-500 p-2 rounded">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 🏁 푸터 추가됨! */}
      <footer className="py-8 text-center border-t border-gray-100 mt-10">
        <p className="text-gray-500 font-bold text-sm">Software Engineering Project: CWNU Market System</p>
        <p className="text-gray-300 text-xs mt-1">© 2026 Jung Yi Ryang</p>
      </footer>
    </div>
  )
}
export default MarketPage;