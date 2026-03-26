import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

// ⭐ 1. 분실물 센터 명언 대량 추가 (총 30개)
const LOST_QUOTES = {
  ko: [
    "작은 관심이 누군가에겐 큰 기적이 됩니다.", "잃어버린 물건, 창대인이 함께 찾아줍니다.", "소중한 추억이 담긴 물건일지도 모릅니다.", 
    "습득물 신고는 가장 따뜻한 매너입니다.", "물건을 잃어버렸나요? 너무 걱정하지 마세요!",
    "지갑을 주웠다면, 내 지갑을 잃어버렸을 때를 생각해보세요.", "돌아온 물건 하나가 캠퍼스의 온도를 1도 올립니다.",
    "우연히 발견한 에어팟, 누군가의 소중한 음악창고입니다.", "선행은 부메랑이 되어 돌아옵니다.",
    "창대인의 양심을 믿습니다.", "작은 친절이 모여 위대한 학교를 만듭니다.",
    "주인을 찾아주는 당신의 손길, 아주 멋집니다.", "잃어버린 전공책, 내일 모레가 시험일지도 몰라요!",
    "당신의 신고 한 번이 누군가의 하루를 구원합니다.", "정직함은 보이지 않는 곳에서 더욱 빛납니다.",
    "돌려준 물건, 돌아오는 미소.", "학생증을 주웠나요? 그 사람의 대학 생활을 지켜주신 겁니다.",
    "분실물 센터는 우리의 양심 보관소입니다.", "오늘 베푼 선의는 내일의 행운으로 돌아올 것입니다.",
    "물건은 잃어버려도 희망은 잃지 마세요.", "기억하세요, 누군가 애타게 찾고 있습니다.",
    "당신의 작은 행동이 누군가의 밤잠을 편안하게 합니다.", "정직은 가장 확실한 수익을 가져다주는 투자다. - 벤저민 프랭클린",
    "양심은 누군가 보고 있지 않을 때 하는 행동이다. - 알도 레오폴드", "친절은 귀머거리도 들을 수 있고 시각장애인도 볼 수 있는 언어다. - 마크 트웨인",
    "선행을 베풀 기회를 놓치지 마라.", "돌려주는 기쁨은 줍는 기쁨보다 큽니다.",
    "물건을 찾아준 당신, 오늘 캠퍼스의 영웅입니다.", "우리가 남긴 착한 발자취는 결코 지워지지 않습니다.",
    "눈앞의 작은 이익보다 평생의 당당함을 선택하세요."
  ],
  en: [
    "A small attention can be a great miracle to someone.", "CWNU students will help you find your lost items.", "It might be an item full of precious memories.", 
    "Reporting a found item is the warmest manners.", "Lost something? Don't worry too much!",
    "If you found a wallet, think about when you lost yours.", "One returned item raises the campus temperature by 1 degree.",
    "That randomly found AirPods is someone's precious music vault.", "A good deed returns like a boomerang.",
    "We believe in the conscience of CWNU students.", "Small acts of kindness make a great university.",
    "Your helping hand to find the owner is awesome.", "That lost textbook? They might have an exam the day after tomorrow!",
    "Your single report saves someone's entire day.", "Honesty shines brightest where no one is looking.",
    "A returned item, a returning smile.", "Found a student ID? You just saved their college life.",
    "The Lost & Found is our conscience repository.", "The goodwill you show today will return as luck tomorrow.",
    "You may lose an item, but don't lose hope.", "Remember, someone is desperately looking for it.",
    "Your small action brings someone a peaceful night's sleep.", "Honesty is the best policy. - Benjamin Franklin",
    "Conscience is what you do when no one is looking. - Aldo Leopold", "Kindness is the language which the deaf can hear and the blind can see. - Mark Twain",
    "Never miss an opportunity to do a good deed.", "The joy of returning is greater than the joy of finding.",
    "You who returned the item, you are today's campus hero.", "The good footprints we leave are never erased.",
    "Choose lifelong pride over a small immediate gain."
  ]
};

const SUBMIT_MENTIONS = {
  ko: ["분실물 / 습득물 등록하기", "애타게 찾는 주인에게 정보 알리기", "게시글 올리고 도움 요청하기"],
  en: ["Register Lost / Found Item", "Notify the anxious owner", "Upload post to ask for help"]
};

function LostPage({ lang }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [viewType, setViewType] = useState('card')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6;
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedLostItems') || '[]')))
  
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [submitMentionIndex, setSubmitMentionIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(-1) 
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null); 

  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [showModalConfetti, setShowModalConfetti] = useState(false)

  const API_URL = '/api/lost'; const COMMON_URL = '/api/items'

  const t = {
    ko: {
      tourSteps: [
        { title: "👋 환영합니다!", desc: "분실물 센터의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, 
        { title: "🤖 AI 습득/분실글 작성", desc: "주운 물건이나 잃어버린 물건을 AI에게 말해보세요!", targetId: "tour-ai-btn" }, 
        { title: "🎁 사례금 설정", desc: "사례금을 설정하거나 '사례금 없음'을 선택할 수 있습니다.", targetId: "tour-freebie" }, 
        { title: "📅 일시 지정", desc: "클릭하여 분실/습득 날짜를 정확히 지정하세요.", targetId: "tour-deadline" }, 
        { title: "🔄 똑똑한 정렬", desc: "최신순, 일자순 등으로 원하는 물품을 골라보세요.", targetId: "tour-sort" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 보기 ▶", tourEnd: "투어 종료 🎉", help: "💡 도움말", verCheck: "(NEW 클릭 시 업데이트 내역 확인)",
      phTitle: "[분실/습득] 물품명 (예: [습득] 검은색 에어팟)", phPrice: "사례금 (선택사항, 숫자만)", phFree: "사례금 없음", phId: "학번", phSeller: "작성자명", phPhone: "연락처", phLoc: "분실/습득 장소 (예: 도서관 2층)", phDesc: "상세 설명 (색상, 특징, 보관 장소 등)",
      btnFree: "사례금 없음", btnCancel: "취소", searchP: "찾으시는 분실물을 검색해보세요! (에어팟, 지갑 등)",
      sortOpt: { latest: "최신 등록순", deadline: "분실/습득 일자순", priceHigh: "사례금 높은순", likes: "관심 많은순 👀" },
      currency: "원", freeBadge: "사례금 없음", soldOut: "주인 찾음/해결완료", sellerPrefix: "👤", locPrefix: "장소:", deadlinePrefix: "📅 일시:", deadlineNone: "미상",
      btnEdit: "수정", btnDel: "삭제", btnDone: "해결완료", btnUndo: "진행중으로 변경", btnSave: "수정 저장", btnEditCancel: "취소",
      btnDescShow: "💬 자세히 보기", btnDescHide: "자세히 보기 닫기", descEmpty: "등록된 상세 설명이 없습니다.",
      thItem: "Item", thPrice: "Reward", thSeller: "Author", thStatus: "Status", thAction: "Action", stDone: "해결됨", stSale: "찾는중",
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      
      modalTitle: "Lost & Found 신규 오픈!", modalSub: "마켓의 강력한 기능을 그대로 이식한 똑똑한 분실물 센터",
      modalPrevTitle: "🤔 이전 분실물 찾기 방식", modalPrev1: "❌ 에브리타임, 와글 등 이곳저곳 분산된 정보", modalPrev2: "❌ 직관적이지 않은 텍스트 위주 게시판", modalPrev3: "❌ AI 도움 없이 일일이 작성해야 하는 불편함",
      modalCurTitle: "✨ CWNU 전용 분실물 센터", modalCur1: "✅ 마켓과 통일된 예쁘고 직관적인 카드 UI!", modalCur2: "✅ 대충 말해도 AI가 찰떡같이 찾아주는 폼 자동완성!", modalCur3: "✅ 해결 완료 / 찾는 중 직관적인 상태 관리!", modalCur4: "✅ 실시간 미리보기로 완벽한 수정 기능 지원!", modalCur5: "🤖 캠퍼스 통합 데이터베이스 연동 완료!",
      modalHistTitle: "🛠️ LOST & FOUND 업데이트", modalHistV1: "CWNU 포털에 분실물 센터 신규 오픈 및 AI 비서 도입 완료",
      modalFreeTitle: "\"아니 이게..무료라고요!?\"", modalFreeDesc1: "당연하죠! 창대인을 위한 따뜻한 공간입니다!", modalFreeDesc2: "소중한 물건을 찾고 따뜻한 매너를 나눠보세요!", modalBtn: "확인 완료!",
      
      aiOpenBtn: " AI 비서에게 분실/습득글 작성 맡기기", aiLoading: "⏳ 상황을 분석하고 폼을 채우는 중...", aiEmpty: "채팅창에 정보를 입력해주세요!", aiFollowUpP: "무엇을 언제 어디서 잃어버렸는지/주웠는지 말해주세요!", aiClear: "대화 초기화", aiClose: "AI 닫기", aiApply: "이 글로 설명 채우기",
      aiConfirm: "✨ 이 정보를 폼에 추가하시겠습니까?", btnYes: "예, 추가하기", btnNo: "아니오"
    },
    en: {
      tourSteps: [
        { title: "👋 Welcome!", desc: "Let me guide you through the Lost & Found.", targetId: "tour-header" }, 
        { title: "🤖 AI Auto-fill", desc: "Describe the situation, and AI fills the form!", targetId: "tour-ai-btn" }, 
        { title: "🎁 Reward", desc: "Set a reward or choose 'No Reward'.", targetId: "tour-freebie" }, 
        { title: "📅 Time", desc: "Specify when you lost/found it.", targetId: "tour-deadline" }, 
        { title: "🔄 Smart Sort", desc: "Sort by latest, date, etc.", targetId: "tour-sort" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", tourEnd: "End Tour 🎉", help: "💡 Guide", verCheck: "(Click NEW to check updates)",
      phTitle: "[Lost/Found] Item Name", phPrice: "Reward (Optional, numbers)", phFree: "No Reward", phId: "Student ID", phSeller: "Author Name", phPhone: "Phone Number", phLoc: "Location (e.g., Library 2F)", phDesc: "Description (Color, Features, etc.)",
      btnFree: "No Reward", btnCancel: "Cancel", searchP: "Search for lost items! (AirPods, Wallet, etc.)",
      sortOpt: { latest: "Latest", deadline: "Date", priceHigh: "Highest Reward", likes: "Most Viewed 👀" },
      currency: " KRW", freeBadge: "No Reward", soldOut: "RESOLVED", sellerPrefix: "👤", locPrefix: "Loc:", deadlinePrefix: "📅 Date:", deadlineNone: "Unknown",
      btnEdit: "Edit", btnDel: "Del", btnDone: "Resolved", btnUndo: "Undo", btnSave: "Save", btnEditCancel: "Cancel",
      btnDescShow: "💬 View Details", btnDescHide: "Close Details", descEmpty: "No description provided.",
      thItem: "Item", thPrice: "Reward", thSeller: "Author", thStatus: "Status", thAction: "Action", stDone: "Resolved", stSale: "Looking",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      
      modalTitle: "Lost & Found Newly Opened!", modalSub: "Smart Lost & Found using Market features!",
      modalPrevTitle: "🤔 Previous Ways", modalPrev1: "❌ Information scattered everywhere", modalPrev2: "❌ Unintuitive text-based boards", modalPrev3: "❌ Inconvenient manual writing",
      modalCurTitle: "✨ CWNU Lost & Found", modalCur1: "✅ Intuitive Card UI unified with Market!", modalCur2: "✅ AI Auto-fill understands your situation!", modalCur3: "✅ Intuitive Resolved / Looking status!", modalCur4: "✅ Perfect edit function with live preview!", modalCur5: "🤖 Integrated Campus Database!",
      modalHistTitle: "🛠️ LOST & FOUND Updates", modalHistV1: "Newly opened Lost & Found with AI Assistant",
      modalFreeTitle: "\"Is this free?\"", modalFreeDesc1: "Of course! A warm space for CWNU students!", modalFreeDesc2: "Find precious items and share warm manners!", modalBtn: "Confirmed!",
      
      aiOpenBtn: " Let AI write the post", aiLoading: "⏳ Analyzing and filling form...", aiEmpty: "Please type something!", aiFollowUpP: "Tell me what, when, and where!", aiClear: "Clear", aiClose: "Close AI", aiApply: "Apply to Description",
      aiConfirm: "✨ Apply this info to the form?", btnYes: "Yes, apply", btnNo: "No"
    }
  };
  const current = t[lang];

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return lang === 'ko' ? '방금 전' : 'Just now';
    if (diff < 3600) return lang === 'ko' ? `${Math.floor(diff / 60)}분 전` : `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return lang === 'ko' ? `${Math.floor(diff / 3600)}시간 전` : `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return lang === 'ko' ? `${Math.floor(diff / 86400)}일 전` : `${Math.floor(diff / 86400)}d ago`;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => { 
    fetchItems(); 
    if (LOST_QUOTES[lang]?.length > 0) {
      setQuoteIndex(Math.floor(Math.random() * LOST_QUOTES[lang].length)); 
    }
  }, [lang])
  
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }
  useEffect(() => { const intervalId = setInterval(() => setSubmitMentionIndex(prev => (prev + 1) % SUBMIT_MENTIONS[lang].length), 6000); return () => clearInterval(intervalId); }, [lang]);
  
  useEffect(() => { 
    if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }
  }, [chatHistory, isGenerating]);

  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-orange-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-orange-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  }, [tourIndex, lang, current.tourSteps]);

  const handleQuoteRefresh = () => { 
    if (LOST_QUOTES[lang]?.length > 0) setQuoteIndex(Math.floor(Math.random() * LOST_QUOTES[lang].length)); 
  };
  
  const handlePhoneChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, '');
    let formatted = numeric;
    if (numeric.length > 3 && numeric.length <= 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3)}`;
    else if (numeric.length > 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3, 7)}-${numeric.slice(7, 11)}`;
    return formatted;
  }
  
  const handleFreebie = () => { 
    if (form.price === 'free') { setForm({...form, price: ''}); } 
    else { setForm({...form, price: 'free'}); }
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    const submitData = { ...form, price: form.price === 'free' ? 0 : form.price };
    const res = await axios.post(API_URL, submitData);
    setItems([...items, res.data]); 
    setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
    setShowAiBox(false); setChatHistory([]); setCurrentPage(1);
  }

  const handleLike = async (id) => {
    const isLiked = likedItems.has(id); const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    const newLiked = new Set(likedItems); if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked); localStorage.setItem('likedLostItems', JSON.stringify([...newLiked]));
  }
  
  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { ...editForm, price: editForm.price === 'free' ? 0 : editForm.price })
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }

  const handleApplyAiData = (data, idx) => {
    setForm(prev => {
      const updated = { ...prev };
      if (data.title) updated.title = data.title;
      if (data.price === 'free') updated.price = 'free';
      else if (data.price && !isNaN(Number(data.price))) updated.price = data.price;
      if (data.location) updated.location = data.location;
      if (data.deadline) updated.deadline = data.deadline;
      if (data.studentId) updated.studentId = data.studentId;
      if (data.sellerName) updated.sellerName = data.sellerName;
      if (data.phone) updated.phone = handlePhoneChange(data.phone); 
      if (data.description) updated.description = data.description;
      return updated;
    });
    setChatHistory(prev => prev.map((msg, i) => i === idx ? { ...msg, pendingData: null, text: msg.text + (lang === 'ko' ? "\n\n✅ 폼에 성공적으로 추가되었습니다!" : "\n\n✅ Successfully applied to the form!") } : msg));
  };

  const handleRejectAiData = (idx) => {
    setChatHistory(prev => prev.map((msg, i) => i === idx ? { ...msg, pendingData: null, text: msg.text + (lang === 'ko' ? "\n\n❌ 추가를 취소했습니다." : "\n\n❌ Canceled.") } : msg));
  };

  const askAi = async (inputText) => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    const currentMsg = { sender: 'user', text: inputText };
    let newHistory = [...chatHistory, currentMsg];
    setChatHistory(newHistory);
    setFollowUpInput(''); 
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      let promptContext = lang === 'ko' 
        ? `너는 대학 분실물 센터 게시글 폼을 자동으로 채워주는 AI 비서야.
           사용자의 대화 내용을 분석해서 [습득/분실] 여부와 물품명, 사례금(없으면 free), 장소, 일시, 학번, 작성자명, 연락처, 상세 설명을 추출해.
           [절대 규칙 1]: 답변은 반드시 아래 형태의 순수한 JSON 구조로만 반환해! 이모지 절대 금지.
           {
             "message": "요청하신 정보를 바탕으로 폼에 들어갈 내용을 준비했습니다! 아래 버튼을 눌러보세요.",
             "extracted": {
               "title": "[분실] 검은색 에어팟",
               "price": "50000",
               "location": "도서관 2층 열람실",
               "deadline": "2026-03-25",
               "studentId": "20222017",
               "sellerName": "정이량",
               "phone": "010-1234-1234",
               "description": "케이스에 스누피 스티커가 붙어있습니다."
             }
           }\n[대화 내역]\n`
        : `You are an AI assistant for a Lost & Found board. Output ONLY pure JSON.\n[Chat History]\n`;
      
      newHistory.forEach(msg => { promptContext += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n`; });
      promptContext += "AI: ";

      const res = await axios.post('/api/ai/generate', { prompt: promptContext });
      let aiText = res.data.text.trim(); 
      let jsonString = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) { jsonString = jsonString.substring(jsonStart, jsonEnd + 1); }

      try {
        const parsed = JSON.parse(jsonString);
        const ext = parsed.extracted;
        const hasActualData = ext && (ext.title || ext.price || ext.location || ext.deadline || ext.studentId || ext.sellerName || ext.phone || ext.description);
        setChatHistory(prev => [...prev, { sender: 'ai', text: parsed.message, pendingData: hasActualData ? ext : null }]);
      } catch (parseError) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.text }]);
      }
    } catch (error) {
      // ⭐ AI 토큰 에러 메시지 보완
      setChatHistory(prev => [...prev, { sender: 'ai', text: (lang === 'ko' ? "❌ 서버 통신 중 오류가 발생했습니다. (AI 한도 초과 등)" : "❌ Error connecting to server. (API Limit etc.)") }]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const filteredItems = items.filter((item) => {
    return (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())));
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
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
        .tour-popup { animation: tour-slide-up 0.4s forwards; }
        @keyframes tour-slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fdba74; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; }
      `}</style>
      
      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-orange-400 dark:border-orange-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-orange-600 dark:text-orange-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{current.tourSkip}</button>
            <button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-orange-600 dark:bg-orange-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-orange-700 transition">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button>
          </div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-orange-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 text-center">{current.modalTitle}</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">{current.modalSub}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">{current.modalPrevTitle}</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2">
                  <li>{current.modalPrev1}</li>
                  <li>{current.modalPrev2}</li>
                  <li>{current.modalPrev3}</li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/30 p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-800 shadow-inner">
                <h4 className="text-orange-600 dark:text-orange-400 font-black text-sm mb-3 text-center">{current.modalCurTitle}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2">
                  <li>{current.modalCur1}</li>
                  <li>{current.modalCur2}</li>
                  <li>{current.modalCur3}</li>
                  <li>{current.modalCur4}</li>
                  <li className="text-orange-600 dark:text-orange-400">{current.modalCur5}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">{current.modalHistTitle}</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-orange-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-800 dark:text-gray-200 italic">{current.modalHistV1}</span></p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/30 p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-orange-800 dark:text-orange-400 mb-1">{current.modalFreeTitle}</h4>
                <p className="text-orange-700 dark:text-orange-300 font-bold text-xs"><span className="font-black text-sm">{current.modalFreeDesc1}</span><br/>{current.modalFreeDesc2}</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">{current.modalBtn}</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        
        <div id="tour-header" className="text-center mb-6 md:mb-8 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-3xl md:text-5xl font-black text-orange-600 dark:text-orange-400 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              LOST & FOUND 
              <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-4 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-500 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">
                NEW
              </span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              {current.help}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-orange-400 dark:text-orange-500 font-black cursor-pointer hover:text-orange-600 transition tracking-widest">{current.verCheck}</p>
          
          {LOST_QUOTES[lang]?.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-5 md:mt-7 mb-2 px-2">
              <div className="px-5 md:px-8 py-2 md:py-3 border border-orange-300 dark:border-orange-700 rounded-full text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 font-bold text-xs md:text-sm shadow-sm transition-colors text-center break-keep">
                "{LOST_QUOTES[lang][quoteIndex]}"
              </div>
              <button onClick={handleQuoteRefresh} className="w-8 h-8 flex items-center justify-center rounded-full border bg-white dark:bg-gray-800 shadow-sm"><span className="text-orange-500 font-black">🔄</span></button>
            </div>
          )}
        </div>

        <form onSubmit={addItem} className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl mb-6 md:mb-10 flex flex-col gap-3 md:gap-5 border border-orange-100 dark:border-gray-700 relative z-10 mt-4">
          <div id="tour-ai-btn" className="w-full mb-2">
            {!showAiBox ? (
              <button type="button" onClick={() => setShowAiBox(true)} className="w-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.01] transition-all flex justify-center items-center gap-2">
                <span>✨</span> {current.aiOpenBtn}
              </button>
            ) : (
              <div className="w-full p-4 bg-orange-50 dark:bg-gray-900/50 rounded-2xl border border-orange-200 shadow-inner flex flex-col animate-[slide-up_0.3s_ease-out]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-black text-orange-600 flex items-center gap-2">✨ AI 분실물 비서</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setChatHistory([])} className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border">{current.aiClear}</button>
                    <button type="button" onClick={() => setShowAiBox(false)} className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border hover:text-red-500">{current.aiClose}</button>
                  </div>
                </div>
                <div ref={chatContainerRef} className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-3">
                  {chatHistory.length === 0 && !isGenerating && (
                    <div className="text-xs font-bold text-gray-400 p-2 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                      무엇을 잃어버리셨나요? 혹은 주우셨나요?<br/>(예: "중도 2층에서 에어팟 주웠습니다")
                    </div>
                  )}
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex w-full ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[90%] ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl text-sm font-bold whitespace-pre-wrap ${chat.sender === 'user' ? 'bg-orange-100 text-orange-900 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border'}`}>
                          {chat.text}
                        </div>
                        {chat.pendingData && (
                          <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-200 shadow-sm w-full max-w-sm">
                            <p className="text-xs font-black text-orange-800 mb-2">{current.aiConfirm}</p>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleApplyAiData(chat.pendingData, idx)} className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-lg">{current.btnYes}</button>
                              <button type="button" onClick={() => handleRejectAiData(idx)} className="flex-1 bg-gray-300 text-gray-800 text-xs font-bold py-2 rounded-lg">{current.btnNo}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGenerating && ( <div className="flex w-full justify-start"><div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm font-bold text-orange-500 animate-pulse">{current.aiLoading}</div></div> )}
                </div>
                <div className="flex items-end gap-2 bg-white p-1.5 rounded-xl border focus-within:border-orange-400">
                  <textarea ref={textareaRef} rows={1} value={followUpInput} onChange={(e) => { setFollowUpInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAi(followUpInput); } }} placeholder={current.aiFollowUpP} className="flex-grow p-2 outline-none bg-transparent text-sm font-bold text-gray-700 resize-none max-h-[100px] custom-scrollbar" />
                  <button type="button" onClick={() => askAi(followUpInput)} disabled={isGenerating || !followUpInput.trim()} className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-2 rounded-lg h-9 w-9 shadow-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 w-full">
            <input placeholder={current.phTitle} value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="md:col-span-1 border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 font-bold dark:bg-gray-700"/>
            <div id="tour-freebie" className="flex gap-2 md:col-span-1">
              <input placeholder={form.price === 'free' ? current.phFree : current.phPrice} type={form.price === 'free' ? "text" : "number"} min="0" value={form.price === 'free' ? '' : form.price} onChange={e=>setForm({...form, price: e.target.value})} className={`border-2 p-3 rounded-2xl outline-none focus:border-orange-400 flex-grow ${form.price === 'free' ? 'border-gray-300 bg-gray-100 text-gray-500 font-black' : 'border-gray-100 dark:bg-gray-700'}`} disabled={form.price === 'free'}/>
              <button type="button" onClick={handleFreebie} className={`${form.price === 'free' ? 'bg-orange-500' : 'bg-gray-400'} text-white font-black text-xs px-4 rounded-2xl shadow-lg`}>{form.price === 'free' ? current.btnCancel : current.btnFree}</button>
            </div>
            <input id="tour-deadline" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="md:col-span-1 border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 text-gray-500 dark:bg-gray-700"/>
            <input placeholder={current.phId} value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 dark:bg-gray-700"/>
            <input placeholder={current.phSeller} value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 dark:bg-gray-700"/>
            <input placeholder={current.phPhone} value={form.phone} onChange={e=>setForm({...form, phone: handlePhoneChange(e.target.value)})} className="border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 dark:bg-gray-700"/>
            <input placeholder={current.phLoc} value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="md:col-span-3 border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-orange-400 dark:bg-gray-700"/>
            <textarea placeholder={current.phDesc} value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="md:col-span-3 border-2 border-gray-100 p-3 rounded-2xl min-h-[120px] outline-none focus:border-orange-400 font-medium dark:bg-gray-700"></textarea>
          </div>
          <button className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-orange-700 shadow-xl h-16 flex justify-center items-center mt-2">
            {SUBMIT_MENTIONS[lang][submitMentionIndex]}
          </button>
        </form>

        <div className="mb-4 w-full relative z-10">
          {/* ⭐ 2. 검색 시 setCurrentPage(1) 추가하여 버그 해결 */}
          <input type="text" placeholder={current.searchP} value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full p-3 border-2 border-orange-100 rounded-xl shadow-sm focus:outline-none focus:border-orange-400 font-bold dark:bg-gray-800"/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 relative z-10">
          <select id="tour-sort" value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white border-2 border-orange-100 px-4 py-2 rounded-xl font-black text-xs outline-none shadow-sm dark:bg-gray-800">
            <option value="latest">{current.sortOpt.latest}</option><option value="deadline">{current.sortOpt.deadline}</option><option value="priceHigh">{current.sortOpt.priceHigh}</option><option value="likes">{current.sortOpt.likes}</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-5 py-2 rounded-xl font-black text-xs ${viewType==='card'?'bg-orange-600 text-white':'bg-white text-gray-400 border-2'}`}>🎴 CARD</button>
            <button onClick={() => setViewType('table')} className={`px-5 py-2 rounded-xl font-black text-xs ${viewType==='table'?'bg-orange-600 text-white':'bg-white text-gray-400 border-2'}`}>📋 TABLE</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full relative z-10">
            {currentItems.map(item => ( 
              <div key={item._id} className={`p-6 md:p-8 rounded-[3rem] border-4 hover:-translate-y-1 hover:shadow-2xl flex flex-col relative overflow-hidden ${item.completed ? 'border-gray-400 bg-gray-50' : 'border-orange-50 bg-white dark:bg-gray-800'}`}> 
                {item.completed && <div className="absolute -right-10 top-10 bg-gray-500 text-white font-black text-xs py-1 px-12 rotate-45 shadow-lg z-10">{current.soldOut}</div>}
                
                {/* ⭐ 3. 다크모드 시 애니메이션 증발 방지를 위해 단순화 */}
                {editingId === item._id ? (
                  <div className="flex flex-col gap-4 z-10 w-full transition-all duration-300">
                    <div className="border-2 border-orange-300 border-dashed p-4 rounded-2xl bg-orange-50/50 dark:bg-gray-800/50 relative pointer-events-none opacity-90 shadow-sm mt-2">
                      <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">👀 실시간 수정 미리보기</div>
                      <div className="flex justify-between items-start mb-3 mt-1"><h3 className="text-lg font-black text-gray-800 dark:text-gray-100">{editForm.title || '제목을 입력하세요'}</h3></div> 
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xl font-black text-orange-600 dark:text-orange-400">{editForm.price === 0 || editForm.price === 'free' ? current.freeBadge : `사례금 ${Number(editForm.price).toLocaleString()}${current.currency}`}</p>
                      </div> 
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold space-y-1.5">
                        <p className="border-b dark:border-gray-700 pb-1.5">{current.sellerPrefix} {editForm.sellerName || '작성자'} <span className="text-gray-400 ml-1">{editForm.studentId}</span></p>
                        <p className="border-b dark:border-gray-700 pb-1.5">📞 {editForm.phone || '연락처'}</p>
                        <p className="border-b dark:border-gray-700 pb-1.5">{current.deadlinePrefix} {editForm.deadline || current.deadlineNone}</p>
                        <p className="text-orange-500 pb-1.5">{current.locPrefix} {editForm.location || '장소'}</p>
                      </div>
                      <div className="mt-2 p-2 bg-white dark:bg-gray-700/50 rounded-lg text-[10px] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 line-clamp-2">
                        {editForm.description || '상세 설명이 여기에 표시됩니다.'}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-2xl border border-gray-200 dark:border-gray-600 flex flex-col gap-2.5 shadow-inner pointer-events-auto">
                      <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold w-full outline-none focus:border-orange-400 transition-colors" placeholder={current.phTitle} value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                      <div className="flex gap-2">
                        <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold flex-grow outline-none focus:border-orange-400 transition-colors disabled:bg-gray-100 disabled:text-gray-400" placeholder={current.phPrice} type={editForm.price === 'free' ? 'text' : 'number'} value={editForm.price === 'free' ? '' : editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} disabled={editForm.price === 'free'} />
                        <button type="button" onClick={() => setEditForm({...editForm, price: editForm.price === 'free' ? '' : 'free'})} className={`${editForm.price === 'free' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'} px-3 rounded-xl text-[10px] font-black whitespace-nowrap shadow-sm transition-colors`}>{current.btnFree}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold outline-none focus:border-orange-400 text-gray-500 transition-colors" type="date" value={editForm.deadline} onChange={e=>setEditForm({...editForm, deadline: e.target.value})} />
                        <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold outline-none focus:border-orange-400 transition-colors" placeholder={current.phId} value={editForm.studentId} onChange={e=>setEditForm({...editForm, studentId: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold outline-none focus:border-orange-400 transition-colors" placeholder={current.phSeller} value={editForm.sellerName} onChange={e=>setEditForm({...editForm, sellerName: e.target.value})} />
                        <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold outline-none focus:border-orange-400 transition-colors" placeholder={current.phPhone} value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: handlePhoneChange(e.target.value)})} />
                      </div>
                      <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold w-full outline-none focus:border-orange-400 transition-colors" placeholder={current.phLoc} value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                      <textarea className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 p-2 rounded-xl text-xs font-medium w-full outline-none focus:border-orange-400 min-h-[80px] resize-none transition-colors" placeholder={current.phDesc} value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button type="button" onClick={()=>saveEdit(item._id)} className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 flex-grow font-black text-xs shadow-md transition-transform hover:-translate-y-0.5">{current.btnSave}</button>
                      <button type="button" onClick={()=>setEditingId(null)} className="bg-gray-400 hover:bg-gray-500 text-white rounded-xl py-3 flex-grow font-black text-xs shadow-md transition-transform hover:-translate-y-0.5">{current.btnEditCancel}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4 z-10">
                      <h3 className={`text-xl font-black ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h3>
                      {item.createdAt && <span className="text-[10px] text-gray-400 font-bold ml-2 whitespace-nowrap pt-1">{formatTimeAgo(item.createdAt)}</span>}
                    </div> 
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                      <p className={`text-2xl font-black ${item.completed ? 'text-gray-400' : 'text-orange-600'}`}>{item.price === 0 ? current.freeBadge : `사례금 ${Number(item.price).toLocaleString()}${current.currency}`}</p>
                      <button type="button" onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-110 ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-200'}`}><span className="text-2xl drop-shadow-md">👀</span><span className="text-[10px] font-black">{item.likes}</span></button>
                    </div> 
                    <div className="text-xs text-gray-500 font-bold mb-4 space-y-2 flex-grow z-10">
                      <p className="border-b pb-2">{current.sellerPrefix} {item.sellerName} <span className="text-gray-400 ml-2">{item.studentId}</span></p>
                      <p className="border-b pb-2">📞 {item.phone}</p>
                      <p className="border-b pb-2">{current.deadlinePrefix} {item.deadline || current.deadlineNone}</p>
                      <p className="text-orange-500 pb-2">{current.locPrefix} {item.location}</p>
                    </div>
                    <div className="flex flex-col w-full z-10 mb-4 mt-2">
                      <button onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 py-1.5 px-3 rounded-lg text-[10px] font-black w-full flex justify-between items-center hover:bg-orange-100 dark:hover:bg-orange-800 transition shadow-sm border border-orange-100 dark:border-orange-800">
                        <span>{expandedId === item._id ? current.btnDescHide : current.btnDescShow}</span>
                        <span>{expandedId === item._id ? '▲' : '▼'}</span>
                      </button>
                      {expandedId === item._id && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap border-2 border-dashed border-gray-200 dark:border-gray-600 shadow-inner font-semibold leading-relaxed">
                          {item.description || <span className="text-gray-400 italic">{current.descEmpty}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 z-10 mt-2">
                      <button type="button" onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-2 rounded-xl font-black text-[10px] uppercase shadow-sm ${item.completed?'bg-gray-500 text-white':'bg-gray-100 text-gray-500 hover:bg-orange-500 hover:text-white'}`}>{item.completed ? current.btnUndo : current.btnDone}</button>
                      <button type="button" onClick={() => {
                        setEditingId(item._id); 
                        setEditForm({
                          ...item, 
                          studentId: item.studentId || '', 
                          sellerName: item.sellerName || '', 
                          phone: item.phone || '', 
                          description: item.description || ''
                        });
                      }} className="px-4 bg-white border-2 rounded-xl text-gray-400 hover:text-orange-500 text-[10px] font-black uppercase">{current.btnEdit}</button>
                      <button type="button" onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="px-4 bg-white border-2 rounded-xl text-gray-400 hover:text-red-500 text-[10px] font-black uppercase">{current.btnDel}</button>
                    </div> 
                  </>
                )}
              </div> 
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-x-auto border-2 border-gray-100 dark:border-gray-700 mb-8 relative z-10">
             <table className="w-full text-center min-w-[600px]">
              <thead className="bg-orange-600 text-white text-xs font-bold tracking-widest uppercase"><tr><th className="p-4">{current.thItem}</th><th className="p-4">{current.thPrice}</th><th className="p-4">{current.thSeller}</th><th className="p-4">{current.thStatus}</th><th className="p-4">{current.thAction}</th></tr></thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item._id} className="border-b dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                    <td className="p-4 text-left font-black text-sm relative">
                      <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}>{item.title}</span>
                      
                      {/* ⭐ 4. 테이블 뷰 눈알 버튼 클릭 버그 해결 */}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); handleLike(item._id); }} 
                        className={`ml-2 text-[10px] font-black relative z-20 pointer-events-auto cursor-pointer ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-300'}`}
                      >
                        👀{item.likes}
                      </button>
                      
                      <div className="mt-2 relative z-10 pointer-events-auto">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === item._id ? null : item._id); }} 
                          className="text-[10px] text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 font-bold flex items-center gap-1 relative z-20 cursor-pointer"
                        >
                          {expandedId === item._id ? current.btnDescHide : current.btnDescShow}
                        </button>
                        {expandedId === item._id && ( <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-pre-wrap shadow-inner border border-gray-100 dark:border-gray-600 leading-relaxed">{item.description || <span className="text-gray-400 italic">{current.descEmpty}</span>}</div> )}
                      </div>
                    </td>
                    <td className="p-4 font-black text-sm text-orange-600 dark:text-orange-400">{item.price === 0 ? current.freeBadge : `${Number(item.price).toLocaleString()}${current.currency}`}</td>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">
                      {item.sellerName}
                      {item.createdAt && <div className="text-[9px] text-gray-400 mt-1 font-medium">{formatTimeAgo(item.createdAt)}</div>}
                    </td>
                    <td className="p-4 relative z-10"><span className={`px-4 py-1 rounded-full text-[10px] font-black shadow-sm ${item.completed ? 'bg-gray-500 text-white' : 'bg-orange-500 text-white'}`}>{item.completed ? current.stDone : current.stSale}</span></td>
                    <td className="p-4 flex gap-1 justify-center relative z-20 pointer-events-auto">
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        setViewType('card');
                        setEditingId(item._id); 
                        setEditForm({...item});
                      }} className="text-orange-400 hover:text-orange-500 bg-orange-50 px-3 py-1 rounded-full font-black text-[9px] cursor-pointer">수정</button>
                      <button type="button" onClick={async(e) => {e.stopPropagation(); await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-[9px] font-black uppercase text-orange-500 hover:text-orange-700 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full w-20 cursor-pointer">{current.btnDone}/{current.btnUndo}</button>
                      <button type="button" onClick={async(e) => {e.stopPropagation(); await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full font-black text-[9px] uppercase w-20 cursor-pointer">{current.btnDel}</button>
                    </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10 relative z-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-orange-500 disabled:opacity-30 transition shadow-sm">PREV</button>
            <div className="flex gap-1">
              {pageNumbers.map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === num ? 'bg-orange-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300'}`}>{num}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-orange-500 disabled:opacity-30 transition shadow-sm">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
          {current.footerDept}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 md:mt-3">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold">
            {current.footerCopy}
          </p>
          <div className="relative group flex flex-col items-center">
            <a href="https://github.com/eryang11188/todo-app-mini-project-20222017.git" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:scale-110">
              <svg height="35" width="35" viewBox="0 0 16 16" fill="currentColor" className="opacity-80 hover:opacity-100">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            </a>
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center animate-bounce">
              <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 dark:bg-gray-700 shadow-lg rounded-md font-bold">Github</span>
              <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
export default LostPage;