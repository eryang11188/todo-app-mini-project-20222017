import { useState, useEffect } from 'react'
import axios from 'axios'

const MARKET_QUOTES = ["안 쓰는 물건, 누군가에겐 보물입니다.", "빠른 쿨거래가 창대인의 매너를 만듭니다.", "네고는 둥글게, 거래는 확실하게!", "오늘 비운 공간, 내일의 여유가 됩니다.", "신뢰는 최고의 거래 조건입니다.", "책상 속 잠든 전공책, 후배에겐 빛과 소금!", "비움의 미학, 마켓에서 시작하세요.", "당신의 방치된 아이템, 누군가의 필수템!", "환경도 살리고 지갑도 채우는 에코 거래", "창원대 학우들끼리 따뜻한 직거래 한 판!", "물건은 떠나도 따뜻한 마음은 남습니다.", "혹시 당근... 아니 CWNU 마켓이세요?", "버리기엔 아까운 물건, 여기서 새 주인을 찾아주세요!", "안전한 캠퍼스 직거래, 지금 바로 시작하세요.", "자취방 이사 전 필수 코스! 물건 비우기 대작전", "기분 좋은 거래의 시작은 친절한 인사부터!", "필요 없는 물건이 치킨으로 연성되는 마법", "가성비 넘치는 대학 생활의 비밀 무기", "판매자에겐 용돈을, 구매자에겐 득템을!", "서로 돕고 사는 훈훈한 창대 라이프"];
const SUBMIT_MENTIONS = ["내 물건 마켓에 올리기", "신상 등록하고 용돈 벌기", "박스 속 물건 새 주인 찾기", "치킨값 벌러 물건 올리기", "가치 있는 나눔의 시작", "쿨거래 페이스메이커로 등록", "창대인에게 득템 기회 제공", "인기 물품 대열에 합류!"];
const TOUR_STEPS = [{ title: "👋 환영합니다!", desc: "CWNU 마켓의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, { title: "🎁 무료 나눔 & 가격", desc: "가격을 정하거나 '무료 나눔' 버튼을 누를 수 있습니다.", targetId: "tour-freebie" }, { title: "📅 캘린더 마감일", desc: "클릭하여 쉽게 마감 기한을 정할 수 있어요.", targetId: "tour-deadline" }, { title: "🔄 똑똑한 정렬", desc: "최신순, 마감임박순 등으로 원하는 물품을 골라보세요.", targetId: "tour-sort" }, { title: "❤️ 실시간 찜하기", desc: "마음에 드는 물건 카드의 하트를 눌러보세요!", targetId: "tour-card" }];

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
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [submitMentionIndex, setSubmitMentionIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(-1) 
  const [showConfetti, setShowConfetti] = useState(false)
  const [showModalConfetti, setShowModalConfetti] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems(); setQuote(MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)]); }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }
  useEffect(() => { const intervalId = setInterval(() => setSubmitMentionIndex(prev => (prev + 1) % SUBMIT_MENTIONS.length), 6000); return () => clearInterval(intervalId); }, []);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  // 글로벌 이벤트 리스너 제거 (각 페이지 타이틀 옆 버튼으로 직접 제어)

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < TOUR_STEPS.length) {
      const el = document.getElementById(TOUR_STEPS[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  }, [tourIndex]);

  const handlePhoneChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, '');
    let formatted = numeric;
    if (numeric.length > 3 && numeric.length <= 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3)}`;
    else if (numeric.length > 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3, 7)}-${numeric.slice(7, 11)}`;
    return formatted;
  }

  const handleFreebie = () => { 
    if (form.price === 'free') {
      setForm({...form, price: ''}); 
    } else {
      setForm({...form, price: 'free'}); 
      setShowConfetti(true); 
      setTimeout(() => setShowConfetti(false), 2000); 
    }
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    const submitData = { ...form, price: form.price === 'free' ? 0 : form.price };
    const res = await axios.post(API_URL, submitData);
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
    setCurrentPage(1);
  }

  const handleLike = async (id) => {
    const isLiked = likedItems.has(id); const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    const newLiked = new Set(likedItems); if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked); localStorage.setItem('likedItems', JSON.stringify([...newLiked]));
  }
  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { ...editForm, price: editForm.price === 'free' ? 0 : editForm.price })
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }
  
  const filteredItems = items.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
    if (sortType === 'priceLow') return a.price - b.price;
    if (sortType === 'priceHigh') return b.price - a.price;
    if (sortType === 'likes') return b.likes - a.likes;
    return 0;
  });
  
  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
      `}</style>
      
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{TOUR_STEPS[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{TOUR_STEPS[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">건너뛰기</button><button onClick={() => setTourIndex(p => p+1 >= TOUR_STEPS.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">{tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}</button></div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center">Market V5_super_4.0 ver 업데이트 내역</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">25년 2학기 웹프로그래밍 기말대체 과제 `todos_v4`의 최종 진화형!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">🤔 이전 버전 (todos_v4)</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2">
                  <li>❌ 새로고침하면 데이터 소실</li>
                  <li>❌ 단순한 텍스트 위주의 투박한 디자인</li>
                  <li>❌ 찜하기 등 거래 부가 기능 전무</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                <h4 className="text-blue-600 dark:text-blue-400 font-black text-sm mb-3 text-center">✨ 현재 버전 (v5)</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2">
                  <li>✅ <span className="text-blue-600 dark:text-blue-400 font-black">MongoDB 연동</span>으로 데이터 보존!</li>
                  <li>✅ 트렌디한 카드 UI 및 정렬 기능</li>
                  <li>✅ 실시간 찜하기 및 <span className="text-blue-600 dark:text-blue-400 font-black">마켓 검색 기능</span> 추가!</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">🛠️ CWNU PORTAL V5 발전 과정</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">물품 등록 및 기본적인 목록 조회 시스템 구축</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V2.0:</span><span className="text-slate-600 dark:text-gray-400">사용자 도움말 투어 및 거래 편의 기능 추가</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">실시간 찜하기 기능 및 카드/테이블 뷰 전환 도입</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V4.0:</span><span className="text-slate-800 dark:text-gray-200 italic">MongoDB 연동 데이터 보존 및 통합 검색 기능 강화</span></p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-blue-800 dark:text-blue-400 mb-1">"근데 이거 유료라고요?"</h4>
                <p className="text-blue-700 dark:text-blue-300 font-bold text-xs">아닙니다! 창대인을 위한 <span className="font-black text-sm">완전 무료</span> 서비스입니다!<br/>쿨거래로 학우 간 따뜻한 정을 나눠보세요!</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition">확인 완료!</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        {/* 타이틀과 도움말 버튼 나란히 배치 */}
        <div id="tour-header" className="text-center mb-8 md:mb-10 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              MARKET <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-4 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-500 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">V5_super_4.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              💡 도움말
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-blue-400 dark:text-blue-500 font-black cursor-pointer hover:text-blue-600 transition tracking-widest">(버전 클릭 시 업데이트 내역 확인)</p>
        </div>

        <form onSubmit={addItem} className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl mb-6 md:mb-10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 border border-blue-50 dark:border-gray-700 relative z-10">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
          <div id="tour-freebie" className="flex gap-2">
            <input 
              placeholder={form.price === 'free' ? "🎁 무료 나눔 설정됨" : "가격(원)"} 
              type={form.price === 'free' ? "text" : "number"} 
              min="0" 
              value={form.price === 'free' ? '' : form.price} 
              onChange={e=>setForm({...form, price: e.target.value})} 
              className={`border-2 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition flex-grow ${form.price === 'free' ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-600 font-black placeholder-green-600 shadow-inner' : 'border-gray-100 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white'}`} 
              disabled={form.price === 'free'}
            />
            <button type="button" onClick={handleFreebie} className={`${form.price === 'free' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-black text-xs px-4 rounded-2xl transition shadow-lg`}>{form.price === 'free' ? '취소' : '무료나눔'}</button>
          </div>
          <input id="tour-deadline" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 cursor-pointer text-gray-500"/>
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="전화번호" value={form.phone} onChange={e=>setForm({...form, phone: handlePhoneChange(e.target.value)})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
          <input placeholder="거래 희망처" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="md:col-span-3 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
          <textarea placeholder="상세 설명" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="md:col-span-3 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl h-14 focus:h-32 transition-all outline-none"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] dark:bg-blue-800 text-white p-4 md:p-5 rounded-2xl font-black text-base md:text-lg hover:bg-blue-800 transition shadow-xl h-16 flex justify-center items-center">
            {SUBMIT_MENTIONS[submitMentionIndex]}
          </button>
        </form>

        <div className="mb-4 md:mb-6 w-full relative z-10">
          <input type="text" placeholder="찾으시는 중고 물품을 검색해보세요! (제목 또는 내용)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 md:p-4 border-2 text-sm md:text-base border-blue-100 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white transition-all font-bold text-gray-700"/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 relative z-10">
          <select value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white dark:bg-gray-800 border-2 border-blue-100 px-4 py-2 w-full sm:w-auto rounded-xl font-black text-xs text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm">
            <option value="latest">🔄 최신 등록순</option><option value="deadline">⏳ 마감 임박순</option><option value="priceLow">📉 가격 낮은순</option><option value="priceHigh">📈 가격 높은순</option><option value="likes">❤️ 찜 많은순</option>
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setViewType('card')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all ${viewType==='card'?'bg-[#002f6c] text-white':'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100'}`}>🎴 CARD</button>
            <button onClick={() => setViewType('table')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100'}`}>📋 TABLE</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div id="tour-card" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 w-full relative z-10">
            {currentItems.map(item => ( 
              <div key={item._id} className={`p-6 md:p-8 rounded-3xl md:rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col relative overflow-hidden ${item.completed ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-blue-50 bg-white dark:bg-gray-800'}`}> 
                {item.completed && <div className="absolute -right-10 top-10 bg-red-500 text-white font-black text-xs py-1 px-12 rotate-45 shadow-lg z-10">SOLD OUT</div>}
                
                {editingId === item._id ? (
                  <div className="flex flex-col gap-2 z-10">
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder="물품명" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder="가격" type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder="전화번호" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: handlePhoneChange(e.target.value)})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder="희망처" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                    <textarea className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-medium h-20" placeholder="설명" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-xl py-2 flex-grow font-black text-xs">수정 저장</button>
                      <button onClick={()=>setEditingId(null)} className="bg-gray-400 text-white rounded-xl py-2 flex-grow font-black text-xs">취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4 z-10"><h3 className={`text-xl font-black flex-grow pr-10 ${item.completed ? 'text-red-600 line-through opacity-70' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h3></div> 
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                      <p className={`text-2xl md:text-3xl font-black ${item.completed ? 'text-red-400 opacity-70' : 'text-blue-700 dark:text-blue-400'}`}>{item.price === 0 ? "🎁 무료 나눔!" : `${Number(item.price).toLocaleString()}원`}</p>
                      <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-110 transition-transform ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-200'}`}><span className="text-2xl drop-shadow-md">♥</span><span className="text-[10px] font-black mt-[-4px]">{item.likes}</span></button>
                    </div> 
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-6 space-y-2 flex-grow z-10">
                      <p className="border-b dark:border-gray-700 pb-2">👤 {item.sellerName} <span className="text-gray-400 ml-2">{item.studentId}</span></p>
                      <p className="border-b dark:border-gray-700 pb-2">📞 {item.phone}</p>
                      <p className="border-b dark:border-gray-700 pb-2">📅 마감: <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>{item.deadline || '없음'}</span></p>
                      <p className="text-blue-500 pb-2">📍 희망처: {item.location}</p>
                    </div>
                    <div className="flex gap-2 z-10">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-2 rounded-xl font-black text-[10px] uppercase shadow-sm ${item.completed?'bg-red-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-blue-600 hover:text-white transition'}`}>{item.completed ? "Cancel" : "Complete"}</button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="px-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 text-[10px] font-black uppercase transition">Edit</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="px-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-red-500 text-[10px] font-black uppercase transition">Del</button>
                    </div> 
                  </>
                )}
              </div> 
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-x-auto border-2 border-gray-100 dark:border-gray-700 mb-8 relative z-10">
            <table className="w-full text-center min-w-[600px]">
              <thead className="bg-[#002f6c] text-white text-xs font-bold tracking-widest uppercase"><tr><th className="p-4">Item</th><th className="p-4">Price</th><th className="p-4">Seller</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
              <tbody>
                {currentItems.map(item => ( 
                  <tr key={item._id} className={`border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${item.completed ? 'sold-out text-red-500' : ''}`}>
                    <td className="p-4 font-black text-sm relative">
                      {item.completed && <div className="absolute top-0 left-0 bg-red-500 text-white font-black text-[8px] px-2 py-0.5 rounded-br-lg shadow-sm">SOLD OUT</div>}
                      <span className={item.completed ? 'line-through' : 'text-gray-800 dark:text-gray-200'}>{item.title}</span> 
                      <button onClick={() => handleLike(item._id)} className={`ml-2 text-[10px] font-black ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-300'}`}>♥{item.likes}</button>
                    </td>
                    <td className="p-4 font-black text-sm text-blue-600 dark:text-blue-400">{item.price === 0 ? "🎁 무료 나눔!" : `${Number(item.price).toLocaleString()}원`}</td>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">{item.sellerName} <br/><span className="text-[10px] text-gray-400">{item.phone}</span></td>
                    <td className="p-4"><span className={`px-4 py-1 rounded-full text-[10px] font-black shadow-sm ${item.completed ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>{item.completed ? "거래완료" : "판매중"}</span></td>
                    <td className="p-4 flex flex-col items-center gap-1">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-20">undo/done</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full font-black text-[9px] uppercase w-20">delete</button>
                    </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-blue-500 disabled:opacity-30 transition">PREV</button>
            <div className="flex gap-1">
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  onClick={() => setCurrentPage(num)} 
                  className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === num ? 'bg-[#002f6c] text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-blue-500 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

<footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
    Department of Computer Science
    <span className="text-gray-400 dark:text-gray-500 font-bold mx-1 md:mx-2 hidden md:inline">|</span> 
    <br className="md:hidden"/>
    Software Engineering Project: CWNU Portal System
  </p>
  <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold mt-1 md:mt-2">
    @ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works
  </p>
</footer>
    </div>
  )
}
export default MarketPage;