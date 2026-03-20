import { useState, useEffect } from 'react'
import axios from 'axios'

function MarketPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }

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
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  }

  const handleLike = async (id) => {
    const res = await axios.patch(`${COMMON_URL}/${id}/like`)
    setItems(items.map(item => item._id === id ? res.data : item))
  }

  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, editForm)
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black text-[#002f6c] mb-2 tracking-tighter italic">CWNU MARKET <span className="text-red-500">v5_super.ver</span></h2>
          <p className="text-blue-500 font-black uppercase tracking-widest text-sm">Campus Life, Better Trade!</p>
        </div>

        <form onSubmit={addItem} className="bg-white p-8 rounded-[2rem] shadow-xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-blue-50">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <input placeholder="가격" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <input placeholder="전화번호" value={form.phone} onChange={handlePhoneChange} className="border p-3 rounded-xl outline-none"/>
          <input placeholder="거래 희망처" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="border p-3 rounded-xl outline-none"/>
          <textarea placeholder="판매 설명" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="border p-3 rounded-xl md:col-span-2 outline-none h-12"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] text-white p-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all">물품 등록하기</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {items.map(item => (
            <div key={item._id} className={`p-7 rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${item.completed ? 'border-red-500 bg-red-50' : 'border-blue-50 bg-white'}`}>
              {editingId === item._id ? (
                <div className="flex flex-col gap-2">
                  <input className="border p-2 rounded-lg text-xs" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                  <input className="border p-2 rounded-lg text-xs" type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                  <input className="border p-2 rounded-lg text-xs" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                  <textarea className="border p-2 rounded-lg text-xs" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                  <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-lg py-2 font-bold text-xs">수정 완료</button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-2xl font-black ${item.completed ? 'text-red-600 line-through' : 'text-gray-800'}`}>{item.title}</h3>
                    <button onClick={() => handleLike(item._id)} className="text-red-500 flex flex-col items-center hover:scale-110 transition">
                      <span className="text-xl">♥</span>
                      <span className="text-[10px] font-black">{item.likes}</span>
                    </button>
                  </div>
                  <p className={`text-3xl font-black mb-4 ${item.completed ? 'text-red-400' : 'text-blue-700'}`}>{Number(item.price).toLocaleString()}원</p>
                  <div className="text-[11px] text-gray-400 font-bold mb-4 space-y-1 flex-grow">
                    <p>👤 {item.sellerName} ({item.studentId}) | 📞 {item.phone}</p>
                    <p className="text-blue-500">📍 희망처: {item.location}</p>
                    <p className="bg-gray-50 p-2 rounded-lg mt-2 text-gray-600">"{item.description}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-3 rounded-2xl font-black text-xs ${item.completed?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white'}`}>
                      {item.completed ? "DONE" : "COMPLETE"}
                    </button>
                    <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="p-3 bg-gray-50 rounded-2xl text-gray-300 hover:text-blue-500 text-xs font-bold">EDIT</button>
                    <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="p-3 bg-gray-50 rounded-2xl text-gray-300 hover:text-red-500 text-xs font-bold">DEL</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer className="py-12 text-center border-t border-gray-100">
        <p className="text-gray-500 font-black text-sm tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Market System</p>
        <p className="text-gray-300 text-[10px] font-medium tracking-widest">© 2026 Jung Yi Ryang | Created with Gemini AI Support</p>
      </footer>
    </div>
  )
}
export default MarketPage;