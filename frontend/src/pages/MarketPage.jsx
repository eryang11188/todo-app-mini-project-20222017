// src/pages/MarketPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

const MARKET_QUOTES = [
  "안 쓰는 물건, 누군가에겐 보물입니다. 💎", "빠른 쿨거래가 창대인의 매너를 만듭니다. 🤝",
  "네고는 둥글게, 거래는 확실하게! ✨", "오늘 비운 공간, 내일의 여유가 됩니다. 📦",
  "신뢰는 최고의 거래 조건입니다. 🕊️", "책상 속 잠든 전공책, 후배에겐 빛과 소금! 📚"
];

function MarketPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [viewType, setViewType] = useState('card')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6;
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')))
  
  // 🚀 9. 마켓 랜덤 명언
  const [quote, setQuote] = useState(MARKET_QUOTES[0])
  
  // 🚀 5. 설명 자세히 보기 모달 상태
  const [selectedDesc, setSelectedDesc] = useState(null)

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems(); setQuote(MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)]); }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    else if (value.length > 7) formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setForm({ ...form, phone: formatted });
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    if (form.deadline) {
      const today = new Date(); today.setHours(0,0,0,0);
      if (new Date(form.deadline) < today) {
        if (!window.confirm("⚠️ 마감 기한이 오늘보다 이전입니다. 이대로 물품을 등록하시겠습니까?")) return;
      }
    }
    const res = await axios.post(API_URL, form)
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
    setCurrentPage(1);
  }

  const handleLike = async (id) => {
    const isLiked = likedItems.has(id);
    const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    const newLiked = new Set(likedItems);
    if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked); localStorage.setItem('likedItems', JSON.stringify([...newLiked]));
  }

  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, editForm)
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }

  const sortedItems = [...items].sort((a, b) => {
    if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
    if (sortType === 'priceLow') return a.price - b.price;
    if (sortType === 'priceHigh') return b.price - a.price;
    if (sortType === 'likes') return b.likes - a.likes;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col min-h-screen relative">
      <div className="flex-grow">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black text-[#002f6c] mb-3 tracking-tighter">
            CWNU MARKET 
            {/* 🚀 7. 레이싱카 애니메이션 & 6. 서브텍스트 */}
            <span className="inline-block ml-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 hover:scale-110 transition-transform duration-300 cursor-pointer italic drop-shadow-lg">
              v5_super.ver
            </span>
            <span className="block text-xs text-gray-400 font-medium tracking-normal mt-2">
              (2025 웹프 과제 todo_v4.js에서 프리미엄 진화 🚀)
            </span>
          </h2>
          <p className="text-blue-500 font-black uppercase tracking-widest text-sm bg-blue-50 inline-block px-4 py-1 rounded-full">"{quote}"</p>
        </div>

        <form onSubmit={addItem} className="bg-white p-8 rounded-[2rem] shadow-xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-blue-50 relative overflow-hidden">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          
          {/* 🚀 12. 음수 방지 및 무료나눔 버튼 */}
          <div className="flex gap-2">
            <input placeholder="가격(원)" type="number" min="0" value={form.price} onChange={e=>setForm({...form, price: Math.max(0, e.target.value)})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 flex-grow"/>
            <button type="button" onClick={()=>setForm({...form, price: 0})} className="bg-green-500 text-white font-black text-xs px-3 rounded-xl hover:bg-green-600 transition">무료<br/>나눔</button>
          </div>

          {/* 🚀 8. 클릭 시 달력 팝업 (showPicker) */}
          <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 cursor-pointer"/>
          
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="전화번호" value={form.phone} onChange={handlePhoneChange} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="거래 희망처" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 md:col-span-3"/>
          <textarea placeholder="판매에 대한 상세한 설명을 적어주세요. (클릭 시 입력창이 확장됩니다)" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} 
            className="border p-3 rounded-xl md:col-span-3 outline-none focus:ring-2 ring-blue-500 h-14 focus:h-40 transition-all duration-300 resize-none leading-relaxed"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] text-white p-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all shadow-lg mt-2">✨ 프리미엄 물품 등록하기</button>
        </form>

        <div className="flex justify-between items-center mb-6">
          <select value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-xl font-bold text-gray-700 outline-none cursor-pointer">
            <option value="latest">🔄 최신 등록순</option>
            <option value="deadline">⏳ 마감 임박순</option>
            <option value="priceLow">📉 가격 낮은순</option>
            <option value="priceHigh">📈 가격 높은순</option>
            <option value="likes">❤️ 찜 많은순</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${viewType==='card'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>🎴 CARD VIEW</button>
            <button onClick={() => setViewType('table')} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>📋 TABLE VIEW</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 w-full">
            {currentItems.map(item => (
              <div key={item._id} className={`p-7 rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${item.completed ? 'border-red-500 bg-red-50' : 'border-blue-50 bg-white'}`}>
                {editingId === item._id ? (
                  // 🚀 1. 수정 시 연한 미리보기 글자(placeholder) 추가
                  <div className="flex flex-col gap-2">
                    <input className="border p-2 rounded-lg text-xs" placeholder="물품명" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border p-2 rounded-lg text-xs" placeholder="가격" type="number" min="0" value={editForm.price} onChange={e=>setEditForm({...editForm, price: Math.max(0, e.target.value)})} />
                    <input className="border p-2 rounded-lg text-xs" placeholder="거래 희망처" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                    <textarea className="border p-2 rounded-lg text-xs h-20 resize-none" placeholder="판매 설명" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-lg py-2 font-bold text-xs">수정 완료</button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-2xl font-black ${item.completed ? 'text-red-600 line-through' : 'text-gray-800'}`}>{item.title}</h3>
                      <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-125 transition-transform ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-300'}`}>
                        <span className="text-2xl drop-shadow-md">♥</span>
                        <span className="text-[10px] font-black">{item.likes}</span>
                      </button>
                    </div>
                    <p className={`text-3xl font-black mb-4 ${item.completed ? 'text-red-400' : 'text-blue-700'}`}>
                      {item.price === 0 ? "🎁 무료나눔" : `${Number(item.price).toLocaleString()}원`}
                    </p>
                    <div className="text-xs text-gray-500 font-bold mb-4 space-y-1.5 flex-grow">
                      <p>👤 {item.sellerName} <span className="text-gray-400">({item.studentId})</span></p>
                      <p>📞 {item.phone}</p>
                      <p>📅 마감: <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>{item.deadline || '없음'}</span></p>
                      <p className="text-blue-500">📍 희망처: {item.location}</p>
                      {/* 🚀 5. 설명 클릭 시 모달 열기 */}
                      <p onClick={() => setSelectedDesc(item.description)} className="bg-gray-50 p-3 rounded-xl mt-3 text-gray-600 font-medium leading-relaxed italic border cursor-pointer hover:bg-gray-100 transition truncate">
                        "{item.description || '설명 없음'}"
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-3 rounded-2xl font-black text-xs ${item.completed?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition'}`}>
                        {item.completed ? "DONE" : "COMPLETE"}
                      </button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="p-3 bg-gray-50 border rounded-2xl text-gray-400 hover:text-blue-500 text-xs font-bold">EDIT</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="p-3 bg-gray-50 border rounded-2xl text-gray-400 hover:text-red-500 text-xs font-bold">DEL</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-10 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#002f6c] text-white text-sm font-bold">
                <tr><th className="p-4">물품명</th><th className="p-4">가격</th><th className="p-4">판매자</th><th className="p-4">마감/상태</th><th className="p-4">관리</th></tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item._id} className={`border-b hover:bg-blue-50 transition-colors ${item.completed ? 'text-red-500 bg-red-50' : ''}`}>
                    <td className={`p-4 font-black text-lg ${item.completed ? 'line-through' : 'text-gray-800'}`}>{item.title} <span className="text-red-400 text-xs">♥{item.likes}</span></td>
                    <td className="p-4 font-black text-blue-600">{item.price === 0 ? "무료" : `${Number(item.price).toLocaleString()}원`}</td>
                    <td className="p-4 font-bold text-gray-500 text-sm">{item.sellerName} <br/><span className="text-[10px] text-gray-400">{item.phone}</span></td>
                    <td className="p-4">
                      <div className="text-xs font-bold mb-1">{item.deadline}</div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${item.completed ? 'bg-red-500' : 'bg-blue-600'}`}>{item.completed ? "거래완료" : "판매중"}</span>
                    </td>
                    <td className="p-4 flex flex-col justify-center items-center gap-2">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-xs font-black uppercase text-blue-500 underline">{item.completed ? "undo" : "done"}</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-gray-400 hover:text-red-500 font-black text-xs uppercase">delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="font-black text-blue-600 text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Market System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>

      {/* 🚀 5. 설명 자세히 보기 모달 */}
      {selectedDesc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDesc(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-blue-800 mb-4 border-b pb-2">📝 상세 설명</h3>
            <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">{selectedDesc}</p>
            <button onClick={() => setSelectedDesc(null)} className="mt-8 w-full bg-[#002f6c] text-white py-3 rounded-xl font-black hover:bg-blue-800 transition">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default MarketPage;