// src/pages/MarketPage.jsx 전체 복사
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const MARKET_QUOTES = [
  "안 쓰는 물건, 누군가에겐 보물입니다.", "빠른 쿨거래가 창대인의 매너를 만듭니다.",
  "네고는 둥글게, 거래는 확실하게!", "오늘 비운 공간, 내일의 여유가 됩니다.",
  "신뢰는 최고의 거래 조건입니다.", "책상 속 잠든 전공책, 후배에겐 빛과 소금!",
  "비움의 미학, 마켓에서 시작하세요.", "당신의 방치된 아이템, 누군가의 필수템!",
  "환경도 살리고 지갑도 채우는 에코 거래", "창원대 학우들끼리 따뜻한 직거래 한 판!",
  "물건은 떠나도 따뜻한 마음은 남습니다.", "혹시 당근... 아니 CWNU 마켓이세요?",
  "버리기엔 아까운 물건, 여기서 새 주인을 찾아주세요!", "안전한 캠퍼스 직거래, 지금 바로 시작하세요.",
  "자취방 이사 전 필수 코스! 물건 비우기 대작전", "기분 좋은 거래의 시작은 친절한 인사부터!",
  "필요 없는 물건이 치킨으로 연성되는 마법", "가성비 넘치는 대학 생활의 비밀 무기",
  "판매자에겐 용돈을, 구매자에겐 득템을!", "서로 돕고 사는 훈훈한 창대 라이프"
];

const SUBMIT_MENTIONS = [
  "🚀 내 물건 마켓에 올리기", "✨ 신상 등록하고 용돈 벌기", "📦 박스 속 물건 새 주인 찾기", 
  "💸 치킨값 벌러 물건 올리기", "♻️ 가치 있는 나눔의 시작", "🤝 쿨거래 페이스메이커로 등록", 
  "🏫 창대인에게 득템 기회 제공", "🔥 인기 물품 대열에 합류!"
];

const TOUR_STEPS = [
  { title: "👋 환영합니다!", desc: "CWNU 마켓의 핵심 기능을 빠르게 안내해 드릴게요. (화면이 자동으로 이동합니다)", targetId: "tour-header" },
  { title: "🎁 무료 나눔 & 가격", desc: "이곳에서 가격을 정하거나 '무료 나눔' 버튼을 누르면 기분 좋은 폭죽이 터집니다!", targetId: "tour-freebie" },
  { title: "📅 캘린더 마감일", desc: "마우스로 클릭만 하면 캘린더가 팝업되어 쉽게 마감 기한을 정할 수 있어요.", targetId: "tour-deadline" },
  { title: "🔄 똑똑한 정렬", desc: "최신순, 마감임박순, 찜 많은 순으로 원하는 물품을 입맛대로 골라보세요.", targetId: "tour-sort" },
  { title: "❤️ 실시간 찜하기", desc: "마음에 드는 물건 카드의 하트를 누르면 숫자가 실시간으로 올라가고 내려갑니다!", targetId: "tour-card" }
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
  
  const [quote, setQuote] = useState(MARKET_QUOTES[0])
  const [selectedDesc, setSelectedDesc] = useState(null)
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [submitMentionIndex, setSubmitMentionIndex] = useState(0);

  const [tourIndex, setTourIndex] = useState(-1) 
  const [tourPos, setTourPos] = useState({ top: 0, left: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [showModalConfetti, setShowModalConfetti] = useState(false)

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems(); setQuote(MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)]); }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }

  useEffect(() => {
    const intervalId = setInterval(() => setSubmitMentionIndex(prev => (prev + 1) % SUBMIT_MENTIONS.length), 6000); 
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (showVersionInfo) {
      setShowModalConfetti(true);
      setTimeout(() => setShowModalConfetti(false), 2500);
    }
  }, [showVersionInfo]);

  useEffect(() => {
    if (tourIndex >= 0) {
      const step = TOUR_STEPS[tourIndex];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const highlightClasses = ['ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-2xl'];
        el.classList.add(...highlightClasses);
        
        return () => {
          el.classList.remove(...highlightClasses);
        };
      }
    }
  }, [tourIndex]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    else if (value.length > 7) formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setForm({ ...form, phone: formatted });
  }

  const handleFreebie = () => {
    setForm({...form, price: 'free'});
    setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000);
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    if (form.deadline && new Date(form.deadline) < new Date().setHours(0,0,0,0)) {
      if (!window.confirm("⚠️ 마감 기한이 오늘보다 이전입니다. 이대로 올리시겠습니까?")) return;
    }
    const submitData = { ...form, price: form.price === 'free' ? 0 : form.price };
    const res = await axios.post(API_URL, submitData)
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
    setCurrentPage(1); setQuote(MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)]);
  }

  const handleLike = async (id) => {
    const isLiked = likedItems.has(id); const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    const newLiked = new Set(likedItems);
    if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked); localStorage.setItem('likedItems', JSON.stringify([...newLiked]));
  }

  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { ...editForm, price: editForm.price === 'free' ? 0 : editForm.price })
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

  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col min-h-screen relative">
      <style>{`
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 50% { transform: translateY(-100px) scale(1.2); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .tour-popup { animation: slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .text-fade-enter { opacity: 0; transform: translateY(5px); }
        .text-fade-enter-active { opacity: 1; transform: translateY(0); transition: all 0.5s ease-out; }
        .text-fade-exit { opacity: 1; transform: translateY(0); }
        .text-fade-exit-active { opacity: 0; transform: translateY(-5px); transition: all 0.5s ease-in; }
        tr.sold-out { background-color: rgba(239, 68, 68, 0.03); }
        tr.sold-out td { opacity: 0.8; }
      `}</style>

      {tourIndex >= 0 && (
        <>
          <div className="fixed inset-0 z-[90] pointer-events-none bg-black/10 transition-opacity duration-300"></div>
          <div className="fixed z-[100] bg-white p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-[3px] border-blue-400 w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
            <h3 className="text-blue-600 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
            <h2 className="text-xl font-black text-gray-800 mb-3">{TOUR_STEPS[tourIndex].title}</h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-5">{TOUR_STEPS[tourIndex].desc}</p>
            <div className="flex justify-between gap-2">
              <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">건너뛰기</button>
              <button onClick={() => setTourIndex(prev => prev + 1 >= TOUR_STEPS.length ? -1 : prev + 1)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">
                {tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}
              </button>
            </div>
          </div>
        </>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          {showModalConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
              <span className="emoji-burst text-6xl" style={{ left: '30%', top: '50%' }}>🎉</span>
              <span className="emoji-burst text-7xl" style={{ animationDelay: '0.1s', left: '50%', top: '40%' }}>✨</span>
              <span className="emoji-burst text-6xl" style={{ animationDelay: '0.2s', left: '70%', top: '50%' }}>🎊</span>
            </div>
          )}
          <div className="bg-white p-8 rounded-[2rem] max-w-2xl w-full shadow-2xl transform transition-all border-4 border-blue-50" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">🚀 V5_super_2.0 ver 업데이트 내역</h3>
            <p className="text-center text-gray-500 font-bold mb-8 text-xs">웹프로그래밍 과제 25-2 기말대체 `todos_v4`의 최종 진화형!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                <h4 className="text-gray-500 font-black text-lg mb-4 text-center">🤔 이전 버전 (todos_v4)</h4>
                <ul className="text-sm font-medium text-gray-500 space-y-3">
                  <li>❌ 새로고침하면 등록한 데이터가 다 날아감 (로컬 스토리지 한계)</li>
                  <li>❌ 단순한 텍스트 위주의 지루하고 투박한 디자인</li>
                  <li>❌ 마감일, 찜하기 등 부가 기능 전무 (단순 CRUD)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200 shadow-inner">
                <h4 className="text-blue-600 font-black text-lg mb-4 text-center">✨ 현재 버전 (v5)</h4>
                <ul className="text-sm font-bold text-gray-700 space-y-3">
                  <li>✅ <span className="text-blue-600 font-black">MongoDB 연동</span>으로 데이터 평생 보존!</li>
                  <li>✅ 부드러운 애니메이션과 트렌디한 카드 UI</li>
                  <li>✅ 무료나눔 폭죽, 실시간 타이머, 자동 하이픈 등 <span className="text-blue-600 font-black">프리미엄 UX</span></li>
                </ul>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 text-center mb-8 shadow-inner relative overflow-hidden">
                <h4 className="text-2xl font-black text-green-800 mb-2">🎁 "근데 이거 유료라고요?"</h4>
                <p className="text-green-700 font-bold text-sm">아닙니다! 창대인을 위한 <span className="font-black text-lg">완전 무료</span> 서비스입니다!<br/> 쿨거래로 학우 간 따뜻한 정을 나눠보세요!</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition shadow-lg tracking-widest uppercase">확인 완료! 직접 써보기</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-10 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs hover:bg-yellow-200 transition shadow-sm z-10 animate-pulse">💡 도움말 투어 시작</button>
          
          <h2 className="text-5xl font-black text-[#002f6c] mb-3 tracking-tighter flex justify-center items-center">
            CWNU MARKET 
            <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-4 pr-6 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 hover:scale-110 transition-transform duration-300 cursor-pointer italic drop-shadow-lg">
              V5_super_2.0 ver
            </span>
          </h2>
          <p className="text-gray-400 font-bold text-xs mb-3 cursor-pointer hover:text-blue-400 transition" onClick={() => setShowVersionInfo(true)}>(버전 업데이트 내용이 궁금하다면 V5를 클릭해보세요! 🚀)</p>
          
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-blue-600 font-black tracking-wide text-sm bg-blue-50/80 border border-blue-100 inline-block px-6 py-3 rounded-full shadow-sm">"{quote}"</p>
            <button onClick={() => setQuote(MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)])} className="text-[10px] bg-white border border-gray-200 text-gray-400 px-4 py-1.5 rounded-full font-bold hover:text-blue-500 hover:border-blue-300 transition">🔄 다른 문구 보기</button>
          </div>
        </div>

        <form onSubmit={addItem} className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-5 border border-blue-50 relative overflow-visible">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition"/>
          
          <div id="tour-freebie" className="flex gap-2 relative transition-all duration-300">
            {form.price === 'free' ? (
              <div onClick={() => setForm({...form, price: ''})} className="border-2 border-green-400 bg-green-50 text-green-600 p-4 rounded-2xl flex-grow font-black text-center cursor-pointer hover:bg-green-100 transition shadow-inner flex items-center justify-center">
                🎉 무료 나눔 모드! (클릭하여 취소)
              </div>
            ) : (
              <input placeholder="가격(원)" type="number" min="0" value={form.price} onChange={e=>setForm({...form, price: Math.max(0, e.target.value)})} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition flex-grow"/>
            )}
            <button type="button" onClick={handleFreebie} className="bg-green-500 text-white font-black text-xs px-4 rounded-2xl hover:bg-green-600 transition shadow-lg whitespace-nowrap">무료<br/>나눔</button>
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
                <span className="emoji-burst text-5xl" style={{ left: '20%', top: '60%' }}>🎉</span>
                <span className="emoji-burst text-6xl" style={{ animationDelay: '0.1s', left: '50%', top: '50%' }}>💖</span>
                <span className="emoji-burst text-5xl" style={{ animationDelay: '0.2s', left: '80%', top: '60%' }}>🎊</span>
              </div>
            )}
          </div>

          <input id="tour-deadline" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition cursor-pointer text-gray-600 font-medium"/>
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="전화번호" value={form.phone} onChange={handlePhoneChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="거래 희망처" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition md:col-span-3"/>
          <textarea placeholder="판매에 대한 상세한 설명을 적어주세요. (클릭 시 팝업되어 넓게 볼 수 있습니다)" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} 
            className="border-2 border-gray-100 p-4 rounded-2xl md:col-span-3 outline-none focus:border-blue-400 h-16 focus:h-40 transition-all duration-300 resize-none leading-relaxed font-medium"></textarea>
          
          <button className="md:col-span-3 bg-[#002f6c] text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl mt-2 tracking-widest uppercase overflow-hidden relative h-16 flex justify-center items-center">
            <span key={SUBMIT_MENTIONS[submitMentionIndex]} className="inline-block animate-submit-text-fade absolute">
              {SUBMIT_MENTIONS[submitMentionIndex]}
            </span>
          </button>
        </form>

        <div className="flex justify-between items-center mb-6">
          <select id="tour-sort" value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white border-2 border-blue-100 px-5 py-3 rounded-2xl font-black text-gray-700 outline-none cursor-pointer shadow-sm hover:border-blue-300 transition">
            <option value="latest">🔄 최신 등록순</option>
            <option value="deadline">⏳ 마감 임박순</option>
            <option value="priceLow">📉 가격 낮은순</option>
            <option value="priceHigh">📈 가격 높은순</option>
            <option value="likes">❤️ 찜 많은순</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm ${viewType==='card'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border-2 border-gray-100 hover:text-gray-600'}`}>🎴 CARD</button>
            <button onClick={() => setViewType('table')} className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border-2 border-gray-100 hover:text-gray-600'}`}>📋 TABLE</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div id="tour-card" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 w-full transition-all">
            {currentItems.map(item => (
              <div key={item._id} className={`p-8 rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col relative overflow-hidden ${item.completed ? 'border-red-500 bg-red-50' : 'border-blue-50 bg-white'}`}>
                {item.completed && <div className="absolute -right-10 top-10 bg-red-500 text-white font-black text-xs py-1 px-12 rotate-45 shadow-lg z-10">SOLD OUT</div>}
                
                {editingId === item._id ? (
                  <div className="flex flex-col gap-3 z-10">
                    <input className="border-2 border-blue-100 p-3 rounded-xl text-sm font-bold placeholder-gray-300 focus:border-blue-400 outline-none transition" placeholder={`기존 물품명: ${item.title}`} value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border-2 border-blue-100 p-3 rounded-xl text-sm font-bold placeholder-gray-300 focus:border-blue-400 outline-none transition" placeholder={item.price === 0 ? "기존: 무료 나눔" : `기존 가격: ${item.price}원`} type="number" min="0" value={editForm.price} onChange={e=>setEditForm({...editForm, price: Math.max(0, e.target.value)})} />
                    <input className="border-2 border-blue-100 p-3 rounded-xl text-sm font-bold placeholder-gray-300 focus:border-blue-400 outline-none transition" placeholder={`기존 희망처: ${item.location}`} value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                    <textarea className="border-2 border-blue-100 p-3 rounded-xl text-sm font-medium h-24 resize-none placeholder-gray-300 focus:border-blue-400 outline-none transition" placeholder={`기존 설명:\n${item.description}`} value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-xl py-3 font-black text-xs flex-grow hover:bg-green-600 shadow-md">수정 저장</button>
                      <button onClick={()=>setEditingId(null)} className="bg-gray-400 text-white rounded-xl py-3 font-black text-xs flex-grow hover:bg-gray-500 shadow-md">수정 취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4 z-10">
                      <h3 className={`text-2xl font-black flex-grow pr-10 ${item.completed ? 'text-red-600 line-through opacity-70' : 'text-gray-800'}`}>{item.title}</h3>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                        <p className={`text-4xl font-black ${item.completed ? 'text-red-400 opacity-70' : 'text-blue-700'}`}>
                          {item.price === 0 ? "🎁 무료 나눔!" : `${Number(item.price).toLocaleString()}원`}
                        </p>
                        <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-125 transition-transform ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-200'}`}>
                            <span className="text-3xl drop-shadow-md">♥</span>
                            <span className="text-[10px] font-black mt-[-4px]">{item.likes}</span>
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 font-bold mb-6 space-y-2 flex-grow z-10">
                      <p className="flex justify-between border-b border-gray-100 pb-2"><span>👤 {item.sellerName}</span> <span className="text-gray-400">{item.studentId}</span></p>
                      <p className="border-b border-gray-100 pb-2">📞 {item.phone}</p>
                      <p className="border-b border-gray-100 pb-2">📅 마감: <span className={new Date(item.deadline) < new Date() ? 'text-red-500 font-black' : ''}>{item.deadline || '없음'}</span></p>
                      <p className="text-blue-500 pb-2">📍 희망처: {item.location}</p>
                      <p onClick={() => setSelectedDesc(item.description)} className="bg-gray-50 p-4 rounded-2xl mt-4 text-gray-600 font-medium leading-relaxed italic border border-dashed border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition truncate group relative">
                        "{item.description || '상세 설명 없음'}"
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-600/90 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-lg backdrop-blur-sm">🔍 자세히 읽기</span>
                      </p>
                    </div>
                    <div className="flex gap-2 z-10">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-sm ${item.completed?'bg-red-600 text-white':'bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white transition'}`}>
                        {item.completed ? "Cancel" : "Complete"}
                      </button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="px-5 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-200 text-[10px] font-black uppercase transition">Edit</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="px-5 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-200 text-[10px] font-black uppercase transition">Del</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-10 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#002f6c] text-white text-sm font-bold tracking-widest uppercase">
                <tr><th className="p-5">Item</th><th className="p-5">Price</th><th className="p-5">Seller</th><th className="p-5">Status</th><th className="p-5">Action</th></tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item._id} className={`border-b hover:bg-blue-50 transition-colors ${item.completed ? 'sold-out text-red-500' : ''}`}>
                    <td className={`p-5 font-black text-lg relative ${item.completed ? 'opacity-70' : 'text-gray-800'}`}>
                      {/* 🚀 1. 테이블 모드 좌측 상단 SOLD OUT 뱃지 추가 */}
                      {item.completed && <div className="absolute top-0 left-0 bg-red-500 text-white font-black text-[9px] px-2 py-1 rounded-br-xl shadow-sm tracking-widest z-10">SOLD OUT</div>}
                      <span className={item.completed ? 'line-through text-red-500' : ''}>{item.title}</span> <span className="text-red-400 text-xs ml-2">♥{item.likes}</span>
                    </td>
                    <td className="p-5 font-black text-blue-600">{item.price === 0 ? "🎁 무료 나눔!" : `${Number(item.price).toLocaleString()}원`}</td>
                    <td className="p-5 font-bold text-gray-500 text-sm leading-relaxed">{item.sellerName} <br/><span className="text-xs text-gray-400">{item.phone}</span></td>
                    <td className="p-5 status-col">
                      <div className="text-xs font-bold mb-2 text-gray-600">{item.deadline}</div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm ${item.completed ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>{item.completed ? "거래완료" : "판매중"}</span>
                    </td>
                    <td className="p-5 flex flex-col justify-center items-center gap-2">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-20 transition">{item.completed ? "undo" : "done"}</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-red-400 hover:text-white hover:bg-red-500 bg-red-50 px-3 py-1 rounded-full font-black text-[10px] uppercase w-20 transition">delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-blue-500 hover:border-blue-200 disabled:opacity-30 transition">PREV</button>
            <span className="font-black text-[#002f6c] text-xl bg-blue-50 px-6 py-2 rounded-2xl">{currentPage} <span className="text-gray-300 mx-1">/</span> {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-blue-500 hover:border-blue-200 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10 z-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>

      {selectedDesc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setSelectedDesc(null)}>
          <div className="bg-white p-10 rounded-[2.5rem] max-w-xl w-full shadow-2xl transform transition-all border-4 border-blue-50" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-black text-blue-800 mb-6 flex items-center gap-3"><span className="text-4xl">📝</span> 상세 설명</h3>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p className="text-gray-700 font-medium leading-loose whitespace-pre-wrap max-h-96 overflow-y-auto text-lg">{selectedDesc}</p>
            </div>
            <button onClick={() => setSelectedDesc(null)} className="mt-8 w-full bg-[#002f6c] text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-800 transition shadow-lg">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default MarketPage;