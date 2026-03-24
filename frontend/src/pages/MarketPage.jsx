import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const MARKET_QUOTES = {
  ko: [
    "안 쓰는 물건, 누군가에겐 보물입니다.", 
    "빠른 쿨거래가 창대인의 매너를 만듭니다.", 
    "네고는 둥글게, 거래는 확실하게!", 
    "오늘 비운 공간, 내일의 여유가 됩니다.", 
    "신뢰는 최고의 거래 조건입니다.",
    "자취방 이사 전 필수 코스! 방 빼기 전 물건부터 빼세요.",
    "오늘 안 쓰는 전공책 팔아서 내일 치킨 시켜 먹자!",
    "잠수는 사절! 쿨거래는 창대인의 기본 소양입니다.",
    "선배의 손때 묻은 전공책, 후배에겐 A+의 열쇠!",
    "통장 잔고가 위험할 때, 책상 서랍을 열어보세요.",
    "충동구매의 최후... 눈물을 머금고 반값에 올립니다.",
    "버리면 쓰레기, 나누면 지구를 살리는 에코 라이프!",
    "따뜻한 인사 한마디가 기분 좋은 거래를 만듭니다.",
    "가성비 넘치는 대학 생활의 비밀 무기, 마켓 직거래.",
    "판매자에겐 쏠쏠한 용돈을, 구매자에겐 짜릿한 득템을!"
  ],
  en: [
    "An unused item is someone else's treasure.", 
    "Quick and cool deals make CWNU manners.", 
    "Negotiate smoothly, deal surely!", 
    "Space emptied today becomes tomorrow's leisure.", 
    "Trust is the best deal condition.",
    "A must before moving out! Empty your items before emptying the room.",
    "Sell unused textbooks today, order fried chicken tomorrow!",
    "No ghosting! Cool deals are the basics for CWNU students.",
    "A senior's well-used textbook is a junior's key to an A+!",
    "When your bank balance is low, open your desk drawer.",
    "The end of impulse buying... selling at half price with tears.",
    "Trash if thrown away, eco-life saving the earth if shared!",
    "A warm greeting makes a pleasant transaction.",
    "The secret weapon for cost-effective college life, direct market deals.",
    "Sweet pocket money for the seller, thrilling finds for the buyer!"
  ]
};

const SUBMIT_MENTIONS = {
  ko: ["내 물건 마켓에 올리기", "신상 등록하고 용돈 벌기", "박스 속 물건 새 주인 찾기", "치킨값 벌러 물건 올리기"],
  en: ["Upload my item to Market", "Register new item & earn money", "Find a new owner for boxed items", "Upload item to earn chicken money"]
};

function MarketPage({ lang }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [viewType, setViewType] = useState('card')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6;
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')))
  
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [submitMentionIndex, setSubmitMentionIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(-1) 
  const [showConfetti, setShowConfetti] = useState(false)
  const [showModalConfetti, setShowModalConfetti] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // ✅ AI 비서 관련 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null); // ✅ [추가됨] 채팅창 텍스트 박스 높이 조절용 Ref

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  const t = {
    ko: {
      tourSteps: [
        { title: "👋 환영합니다!", desc: "CWNU 마켓의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, 
        { title: "🤖 AI 자동 완성 비서", desc: "AI에게 팔 물건을 말하면 폼을 알아서 채워줍니다!", targetId: "tour-ai-btn" }, 
        { title: "🎁 무료 나눔 & 가격", desc: "가격을 정하거나 '무료 나눔' 버튼을 누를 수 있습니다.", targetId: "tour-freebie" }, 
        { title: "📅 캘린더 마감일", desc: "클릭하여 쉽게 마감 기한을 정할 수 있어요.", targetId: "tour-deadline" }, 
        { title: "🔄 똑똑한 정렬", desc: "최신순, 마감임박순 등으로 원하는 물품을 골라보세요.", targetId: "tour-sort" }, 
        { title: "❤️ 실시간 찜하기", desc: "마음에 드는 물건 카드의 하트를 눌러보세요!", targetId: "tour-card" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 보기 ▶", tourEnd: "투어 종료 🎉", help: "💡 도움말", verCheck: "(버전 클릭 시 업데이트 내역 확인)",
      phTitle: "물품명 (예: 전공책, 마우스)", phPrice: "가격(원)", phFree: "🎁 무료 나눔 설정됨", phId: "학번", phSeller: "판매자", phPhone: "전화번호", phLoc: "거래 희망처", phDesc: "상세 설명",
      btnFree: "무료나눔", btnCancel: "취소", searchP: "찾으시는 중고 물품을 검색해보세요! (제목 또는 내용)",
      sortOpt: { latest: "최신 등록순", deadline: "마감 임박순", priceLow: "가격 낮은순", priceHigh: "가격 높은순", likes: "찜 많은순 ❤️" },
      currency: "원", freeBadge: "🎁 무료 나눔!", soldOut: "SOLD OUT", sellerPrefix: "👤", locPrefix: "희망처:", deadlinePrefix: "📅 마감:", deadlineNone: "없음",
      btnEdit: "수정", btnDel: "삭제", btnDone: "거래완료", btnUndo: "판매중으로 변경", btnSave: "수정 저장", btnEditCancel: "취소",
      btnDescShow: "💬 상세 설명 보기", btnDescHide: "설명 닫기", descEmpty: "등록된 상세 설명이 없습니다.",
      thItem: "Item", thPrice: "Price", thSeller: "Seller", thStatus: "Status", thAction: "Action", stDone: "거래완료", stSale: "판매중",
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      
      modalTitle: "Market V6 6.0 ver 업데이트 내역", modalSub: "25년 1학기 웹프로그래밍 기말대체 과제 `todos_v4`의 최종 진화형!",
      modalPrevTitle: "🤔 이전 버전 (todos_v4)", modalPrev1: "❌ 새로고침하면 데이터 소실", modalPrev2: "❌ 단순한 텍스트 위주의 투박한 디자인", modalPrev3: "❌ 찜하기 등 거래 부가 기능 전무",
      modalCurTitle: "✨ 현재 버전 (V6 6.0)", modalCur1: "✅ MongoDB 연동으로 데이터 보존!", modalCur2: "✅ 트렌디한 카드 UI 및 정렬 기능", modalCur3: "✅ 실시간 찜하기 및 마켓 검색 기능 추가!", modalCur4: "✅ 글로벌 다국어(KOR/ENG) 완벽 지원!", modalCur5: "🤖 AI 판매글 폼 자동완성 기능 도입!",
      modalHistTitle: "🛠️ CWNU PORTAL 발전 과정",
      modalHistV1: "물품 등록 및 기본적인 목록 조회 시스템 구축", modalHistV2: "사용자 도움말 투어 및 거래 편의 기능 추가", modalHistV3: "실시간 찜하기 기능 및 카드/테이블 뷰 전환 도입", modalHistV4: "MongoDB 연동 데이터 보존 및 통합 검색 기능 강화", modalHistV5: "글로벌 다국어 완벽 지원 및 UI 고도화",
      modalHistV6: "🤖 대화형 Gemini AI 비서 및 폼 자동완성 전격 도입",
      modalFreeTitle: "\"근데 이거 유료라고요?\"", modalFreeDesc1: "아닙니다! 창대인을 위한 완전 무료 서비스입니다!", modalFreeDesc2: "쿨거래로 학우 간 따뜻한 정을 나눠보세요!", modalBtn: "확인 완료!",
      aiOpenBtn: " AI 비서에게 판매글 쓰기 맡기기", aiLoading: "⏳ 폼을 분석하고 채우는 중...", aiEmpty: "채팅창에 정보를 입력해주세요!", aiFollowUpP: "물품명, 가격, 장소 등을 말해주면 폼을 채워드려요!", aiClear: "대화 초기화", aiClose: "AI 닫기", aiApply: "이 글로 설명 채우기",
      aiConfirm: "✨ 이 정보를 폼에 추가하시겠습니까?", btnYes: "예, 추가하기", btnNo: "아니오"
    },
    en: {
      tourSteps: [
        { title: "👋 Welcome!", desc: "Let me guide you through the core features.", targetId: "tour-header" }, 
        { title: "🤖 AI Auto-fill", desc: "Tell AI what to sell, and it fills the form!", targetId: "tour-ai-btn" }, 
        { title: "🎁 Freebie & Price", desc: "Set a price or click 'Freebie'.", targetId: "tour-freebie" }, 

        { title: "📅 Deadline", desc: "Click to easily set a deadline.", targetId: "tour-deadline" }, 
        { title: "🔄 Smart Sort", desc: "Sort by latest, deadline, etc.", targetId: "tour-sort" }, 
        { title: "❤️ Real-time Like", desc: "Click the heart on items you like!", targetId: "tour-card" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", tourEnd: "End Tour 🎉", help: "💡 Guide", verCheck: "(Click version to check updates)",
      phTitle: "Item Name", phPrice: "Price (KRW)", phFree: "🎁 Freebie Set", phId: "Student ID", phSeller: "Seller", phPhone: "Phone Number", phLoc: "Trade Location", phDesc: "Description",
      btnFree: "Freebie", btnCancel: "Cancel", searchP: "Search for used items! (Title or Description)",
      sortOpt: { latest: "Latest", deadline: "Deadline", priceLow: "Price Low", priceHigh: "Price High", likes: "Most Liked❤️" },
      currency: " KRW", freeBadge: "🎁 Freebie!", soldOut: "SOLD OUT", sellerPrefix: "👤", locPrefix: "Loc:", deadlinePrefix: "📅 Due:", deadlineNone: "None",
      btnEdit: "Edit", btnDel: "Del", btnDone: "Done", btnUndo: "Undo", btnSave: "Save", btnEditCancel: "Cancel",
      btnDescShow: "💬 View Details", btnDescHide: "Close Desc", descEmpty: "No detailed description provided.",
      thItem: "Item", thPrice: "Price", thSeller: "Seller", thStatus: "Status", thAction: "Action", stDone: "Done", stSale: "On Sale",
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      
      modalTitle: "Market V6 6.0 ver Updates", modalSub: "The ultimate evolution of the Spring '25 Web Programming final project `todos_v4`!",
      modalPrevTitle: "🤔 Previous Version (todos_v4)", modalPrev1: "❌ Data lost on refresh", modalPrev2: "❌ Clunky text-based design", modalPrev3: "❌ No extra features like 'Like'",
      modalCurTitle: "✨ Current Version (V6 6.0)", modalCur1: "✅ Data preserved with MongoDB!", modalCur2: "✅ Trendy card UI & sorting", modalCur3: "✅ Real-time 'Like' & Market search!", modalCur4: "✅ Global bilingual (KOR/ENG) support!", modalCur5: "🤖 AI Form Auto-fill Feature added!",
      modalHistTitle: "🛠️ CWNU PORTAL Evolution",
      modalHistV1: "Basic item registration & list view system", modalHistV2: "User guide tour & trade convenience features", modalHistV3: "Real-time Like & Card/Table view toggle", modalHistV4: "MongoDB integration & advanced search", modalHistV5: "Full bilingual support & UI enhancement",
      modalHistV6: "🤖 Interactive Gemini AI & Auto-fill Form integrated",
      modalFreeTitle: "\"Wait, is this paid?\"", modalFreeDesc1: "No! It's a completely free service for CWNU students!", modalFreeDesc2: "Share warmth through cool deals!", modalBtn: "Confirmed!",
      aiOpenBtn: " Let AI write the sales post", aiLoading: "⏳ Analyzing and filling form...", aiEmpty: "Please type something in the chat!", aiFollowUpP: "Tell me item, price, location, etc.", aiClear: "Clear", aiClose: "Close AI", aiApply: "Apply to Description",
      aiConfirm: "✨ Do you want to apply this info to the form?", btnYes: "Yes, apply", btnNo: "No"
    }
  };
  const current = t[lang];

  useEffect(() => { 
    fetchItems(); 
    if (MARKET_QUOTES[lang]?.length > 0) {
      setQuoteIndex(Math.floor(Math.random() * MARKET_QUOTES[lang].length)); 
    }
  }, [lang])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }
  useEffect(() => { const intervalId = setInterval(() => setSubmitMentionIndex(prev => (prev + 1) % SUBMIT_MENTIONS[lang].length), 6000); return () => clearInterval(intervalId); }, [lang]);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);
  
  useEffect(() => { 
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourIndex, lang]);

  const handleQuoteRefresh = () => { 
    if (MARKET_QUOTES[lang]?.length > 0) {
      setQuoteIndex(Math.floor(Math.random() * MARKET_QUOTES[lang].length)); 
    }
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
    else { setForm({...form, price: 'free'}); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000); }
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    const submitData = { ...form, price: form.price === 'free' ? 0 : form.price };
    const res = await axios.post(API_URL, submitData);
    setItems([...items, res.data]); 
    setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
    setShowAiBox(false); setChatHistory([]);
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; // 전송 후 높이 초기화

    try {
      let promptContext = lang === 'ko' 
        ? `너는 중고마켓 판매글 폼을 자동으로 채워주는 AI 비서야.
           사용자의 대화 내용을 분석해서 판매 물품, 가격, 장소, 마감일, 학번, 판매자명, 연락처, 상세 설명을 추출해내야 해.
           [절대 규칙 1]: 답변은 반드시 아래 형태의 순수한 JSON 구조로만 반환하고, 중간에 끊기지 않게 닫는 괄호(})까지 완벽하게 작성해!
           [절대 규칙 2]: 텍스트에 이모지(😎, ✨ 등)는 절대 사용하지 마. 단, JSON 문법에 필요한 따옴표나 기호는 정상적으로 작성해. 매우 건조하고 진중한 텍스트로만 작성할 것.
           마크다운(\`\`\`) 기호, 서론, 결론 등 다른 텍스트는 1글자도 포함하면 안 돼.
           {
             "message": "사용자에게 할 대답 (물품 등록이나 폼 입력과 관련된 내용이면 '요청하신 정보를 바탕으로 폼에 들어갈 내용을 준비했습니다! 아래 버튼을 눌러 자동 입력을 완료해 보세요.'라고 안내하고, 단순한 인사나 일상 대화라면 상황에 맞게 자연스럽고 친절하게 대답할 것. 단, 이모지는 쓰지 마.)",
             "extracted": {
               "title": "추출된 물품명 (없으면 빈 문자열)",
               "price": "추출된 가격 (숫자만 작성. '무료/나눔'이면 'free', 없으면 빈 문자열)",
               "location": "추출된 거래 희망 장소 (없으면 빈 문자열)",
               "deadline": "추출된 마감일 (YYYY-MM-DD 형식, 없으면 빈 문자열)",
               "studentId": "추출된 학번 (없으면 빈 문자열)",
               "sellerName": "추출된 판매자 이름 (없으면 빈 문자열)",
               "phone": "추출된 전화번호 (숫자만, 없으면 빈 문자열)",
               "description": "물품에 대한 설명 본문. 단, 학번, 전화번호, 마감일 등 이미 전용 칸이 있는 정보는 본문에 중복으로 적지 말 것. (이모지 절대 금지)"
             }
           }
           \n[대화 내역]\n`
        : `You are an AI assistant that auto-fills used item marketplace forms.
           Extract info from the chat and return it ONLY in this exact JSON format. 
           [RULE 1]: NO markdown (\`\`\`), NO extra text. MUST output complete JSON until the closing bracket (}).
           [RULE 2]: ABSOLUTELY NO emojis. Use a dry, clean, and formal tone.
           {
             "message": "Friendly response to user. (If the user provides item details, use EXACTLY: 'I have prepared the form details based on your input! Click the button below to apply them.' If it is just a casual chat or greeting, respond naturally and kindly without emojis.)",
             "extracted": {
               "title": "Item name or empty string",
               "price": "Numbers only, 'free' if freebie, or empty string",
               "location": "Trade location or empty string",
               "deadline": "Deadline in YYYY-MM-DD format or empty string",
               "studentId": "Student ID or empty string",
               "sellerName": "Seller name or empty string",
               "phone": "Phone number digits only or empty string",
               "description": "A clean, formal sales description. DO NOT repeat the student ID, phone number, or deadline here as they have their own dedicated fields. (NO EMOJIS)"
             }
           }
           \n[Chat History]\n`;
      
      newHistory.forEach(msg => { promptContext += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n`; });
      promptContext += "AI: ";

      const res = await axios.post('/api/ai/generate', { prompt: promptContext });
      let aiText = res.data.text.trim(); 
      
      let jsonString = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsed = JSON.parse(jsonString);
        
        const ext = parsed.extracted;
        const hasActualData = ext && (ext.title || ext.price || ext.location || ext.deadline || ext.studentId || ext.sellerName || ext.phone || ext.description);

        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: parsed.message, 
          pendingData: hasActualData ? ext : null 
        }]);
      } catch (parseError) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.text }]);
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: (lang === 'ko' ? "❌ 서버 통신 중 오류가 발생했습니다. (AI 한도 초과 등)" : "❌ Error connecting to server.") }]);
    } finally {
      setIsGenerating(false);
    }
  };
  
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; }
      `}</style>
      
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{current.tourSkip}</button><button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button></div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center">{current.modalTitle}</h3>
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
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                <h4 className="text-blue-600 dark:text-blue-400 font-black text-sm mb-3 text-center">{current.modalCurTitle}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2">
                  <li>{current.modalCur1}</li>
                  <li>{current.modalCur2}</li>
                  <li>{current.modalCur3}</li>
                  <li>{current.modalCur4}</li>
                  <li className="text-blue-600 dark:text-blue-400">{current.modalCur5}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">{current.modalHistTitle}</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V2.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V4.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV4}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V5.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV5}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[45px]">V6.0:</span><span className="text-slate-800 dark:text-gray-200 italic">{current.modalHistV6}</span></p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-blue-800 dark:text-blue-400 mb-1">{current.modalFreeTitle}</h4>
                <p className="text-blue-700 dark:text-blue-300 font-bold text-xs"><span className="font-black text-sm">{current.modalFreeDesc1}</span><br/>{current.modalFreeDesc2}</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">{current.modalBtn}</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-6 md:mb-8 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              MARKET <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-4 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-500 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">6.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              {current.help}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-blue-400 dark:text-blue-500 font-black cursor-pointer hover:text-blue-600 transition tracking-widest">{current.verCheck}</p>
          
          {MARKET_QUOTES[lang]?.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-5 md:mt-7 mb-2 px-2">
              <div className="px-5 md:px-8 py-2 md:py-3 border border-blue-400 dark:border-blue-700 rounded-full text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 font-bold text-xs md:text-sm shadow-sm transition-colors text-center break-keep">
                "{MARKET_QUOTES[lang][quoteIndex]}"
              </div>
              <button 
                onClick={handleQuoteRefresh}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all flex-shrink-0"
              >
                <span className="text-blue-500 dark:text-blue-400 font-black text-sm md:text-base">🔄</span>
              </button>
            </div>
          )}
        </div>

        <form onSubmit={addItem} className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl mb-6 md:mb-10 flex flex-col gap-3 md:gap-5 border border-blue-50 dark:border-gray-700 relative z-10 mt-4">
          
          <div id="tour-ai-btn" className="w-full mb-2">
            {!showAiBox ? (
              <button 
                type="button" 
                onClick={() => setShowAiBox(true)}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex justify-center items-center gap-2 text-sm md:text-base"
              >
                <span>✨</span> {current.aiOpenBtn}
              </button>
            ) : (
              <div className="w-full p-4 md:p-5 bg-blue-50/50 dark:bg-gray-900/50 rounded-2xl border border-blue-200 dark:border-gray-700 shadow-inner flex flex-col animate-[slide-up_0.3s_ease-out]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    ✨ AI 판매글 비서
                  </h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setChatHistory([]); }} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition bg-white dark:bg-gray-800 px-2 py-1 rounded-md border">{current.aiClear}</button>
                    <button type="button" onClick={() => setShowAiBox(false)} className="text-xs font-bold text-gray-500 hover:text-red-500 transition bg-white dark:bg-gray-800 px-2 py-1 rounded-md border">{current.aiClose}</button>
                  </div>
                </div>
                
                <div ref={chatContainerRef} className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-3">
                  {chatHistory.length === 0 && !isGenerating && (
                    <div className="text-xs font-bold text-gray-400 p-2 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                      어떤 물건을 얼마에 팔고 싶으신가요? 편하게 말씀해주세요!<br/>(예: "12월 31일까지, 학번 20222017, 정이량, 01012341234 아이패드 50만원에 정문직거래")
                    </div>
                  )}
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex w-full ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[90%] ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl text-sm font-bold whitespace-pre-wrap leading-relaxed shadow-sm
                          ${chat.sender === 'user' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 rounded-tr-none' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-600'}
                        `}>
                          {chat.text}
                        </div>
                        {chat.pendingData && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm w-full max-w-sm animate-[slide-up_0.3s_ease-out]">
                            <p className="text-xs font-black text-blue-800 dark:text-blue-300 mb-2">{current.aiConfirm}</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleApplyAiData(chat.pendingData, idx)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">{current.btnYes}</button>
                              <button onClick={() => handleRejectAiData(idx)} className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 text-xs font-bold py-2 rounded-lg transition-colors">{current.btnNo}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGenerating && ( <div className="flex w-full justify-start"><div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none text-sm font-bold text-blue-500 animate-pulse">{current.aiLoading}</div></div> )}
                </div>

                {/* ✅ [수정됨] 카카오톡 스타일: 글자 길어지면 자동 줄바꿈 & 높이 늘어나는 텍스트 에어리어 */}
                <div className="flex items-end gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:border-blue-400 transition-colors">
                  <textarea 
                    ref={textareaRef}
                    rows={1}
                    value={followUpInput} 
                    onChange={(e) => {
                      setFollowUpInput(e.target.value);
                      e.target.style.height = 'auto'; // 높이 초기화 후 재계산
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => { 
                      if (e.nativeEvent.isComposing) return; 
                      // 💡 Shift + Enter면 줄바꿈, 그냥 Enter면 전송
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        askAi(followUpInput); 
                      } 
                    }}
                    placeholder={current.aiFollowUpP}
                    className="flex-grow p-2 outline-none bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 resize-none max-h-[100px] overflow-y-auto custom-scrollbar leading-relaxed"
                    style={{ minHeight: '36px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => askAi(followUpInput)} 
                    disabled={isGenerating || !followUpInput.trim()} 
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 mb-0.5 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 h-9 w-9 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>

              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 w-full">
            <input 
              placeholder={current.phTitle} 
              value={form.title} 
              onChange={e=>setForm({...form, title: e.target.value})} 
              className="md:col-span-1 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition font-bold"
            />
            
            <div id="tour-freebie" className="flex gap-2 md:col-span-1">
              <input 
                placeholder={form.price === 'free' ? current.phFree : current.phPrice} 
                type={form.price === 'free' ? "text" : "number"} 
                min="0" 
                value={form.price === 'free' ? '' : form.price} 
                onChange={e=>setForm({...form, price: e.target.value})} 
                className={`border-2 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition flex-grow ${form.price === 'free' ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-600 font-black placeholder-green-600 shadow-inner' : 'border-gray-100 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white'}`} 
                disabled={form.price === 'free'}
              />
              <button type="button" onClick={handleFreebie} className={`${form.price === 'free' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-black text-xs px-4 rounded-2xl transition shadow-lg`}>{form.price === 'free' ? current.btnCancel : current.btnFree}</button>
            </div>
            
            <input id="tour-deadline" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="md:col-span-1 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 cursor-pointer text-gray-500"/>
            
            <input placeholder={current.phId} value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
            <input placeholder={current.phSeller} value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
            <input placeholder={current.phPhone} value={form.phone} onChange={e=>setForm({...form, phone: handlePhoneChange(e.target.value)})} className="border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
            
            <input placeholder={current.phLoc} value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="md:col-span-3 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-400 transition"/>
            
            <textarea 
              placeholder={current.phDesc} 
              value={form.description} 
              onChange={e=>setForm({...form, description: e.target.value})} 
              className="md:col-span-3 border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl min-h-[120px] focus:h-48 transition-all outline-none whitespace-pre-wrap font-medium"
            ></textarea>
          </div>

          <button className="w-full bg-[#002f6c] dark:bg-blue-800 text-white p-4 md:p-5 rounded-2xl font-black text-base md:text-lg hover:bg-blue-800 transition shadow-xl h-16 flex justify-center items-center mt-2">
            {SUBMIT_MENTIONS[lang][submitMentionIndex]}
          </button>
        </form>

        <div className="mb-4 md:mb-6 w-full relative z-10">
          <input type="text" placeholder={current.searchP} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 md:p-4 border-2 text-sm md:text-base border-blue-100 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white transition-all font-bold text-gray-700"/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 relative z-10">
          <select id="tour-sort" value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white dark:bg-gray-800 border-2 border-blue-100 px-4 py-2 w-full sm:w-auto rounded-xl font-black text-xs text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm">
            <option value="latest">{current.sortOpt.latest}</option><option value="deadline">{current.sortOpt.deadline}</option><option value="priceLow">{current.sortOpt.priceLow}</option><option value="priceHigh">{current.sortOpt.priceHigh}</option><option value="likes">{current.sortOpt.likes}</option>
          </select>
          <div className="flex gap-2 w-full sm:w-auto" id="tour-list-buttons">
            <button onClick={() => setViewType('card')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all ${viewType==='card'?'bg-[#002f6c] text-white':'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100'}`}>🎴 CARD</button>
            <button onClick={() => setViewType('table')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-100'}`}>📋 TABLE</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div id="tour-card" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 w-full relative z-10">
            {currentItems.map(item => ( 
              <div key={item._id} className={`p-6 md:p-8 rounded-3xl md:rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col relative overflow-hidden ${item.completed ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-blue-50 bg-white dark:bg-gray-800'}`}> 
                {item.completed && <div className="absolute -right-10 top-10 bg-red-500 text-white font-black text-xs py-1 px-12 rotate-45 shadow-lg z-10">{current.soldOut}</div>}
                
                {editingId === item._id ? (
                  <div className="flex flex-col gap-2 z-10">
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder={current.phTitle} value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder={current.phPrice} type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold text-gray-500" type="date" value={editForm.deadline} onChange={e=>setEditForm({...editForm, deadline: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder={current.phId} value={editForm.studentId} onChange={e=>setEditForm({...editForm, studentId: e.target.value})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder={current.phPhone} value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: handlePhoneChange(e.target.value)})} />
                    <input className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" placeholder={current.phLoc} value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                    <textarea className="border-2 border-blue-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-medium h-24 whitespace-pre-wrap" placeholder={current.phDesc} value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-xl py-2 flex-grow font-black text-xs">{current.btnSave}</button>
                      <button onClick={()=>setEditingId(null)} className="bg-gray-400 text-white rounded-xl py-2 flex-grow font-black text-xs">{current.btnEditCancel}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4 z-10"><h3 className={`text-xl font-black flex-grow pr-10 ${item.completed ? 'text-red-600 line-through opacity-70' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h3></div> 
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                      <p className={`text-2xl md:text-3xl font-black ${item.completed ? 'text-red-400 opacity-70' : 'text-blue-700 dark:text-blue-400'}`}>{item.price === 0 ? current.freeBadge : `${Number(item.price).toLocaleString()}${current.currency}`}</p>
                      <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-110 transition-transform ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-200'}`}><span className="text-2xl drop-shadow-md">♥</span><span className="text-[10px] font-black mt-[-4px]">{item.likes}</span></button>
                    </div> 
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4 space-y-2 flex-grow z-10">
                      <p className="border-b dark:border-gray-700 pb-2">{current.sellerPrefix} {item.sellerName} <span className="text-gray-400 ml-2">{item.studentId}</span></p>
                      <p className="border-b dark:border-gray-700 pb-2">📞 {item.phone}</p>
                      <p className="border-b dark:border-gray-700 pb-2">{current.deadlinePrefix} <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>{item.deadline || current.deadlineNone}</span></p>
                      <p className="text-blue-500 pb-2">{current.locPrefix} {item.location}</p>
                    </div>
                    
                    <div className="flex flex-col w-full z-10 mb-4">
                      <button 
                        onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} 
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-1.5 px-3 rounded-lg text-[10px] font-black w-full flex justify-between items-center hover:bg-blue-100 dark:hover:bg-blue-800 transition shadow-sm border border-blue-100 dark:border-blue-800"
                      >
                        <span>{expandedId === item._id ? current.btnDescHide : current.btnDescShow}</span>
                        <span>{expandedId === item._id ? '▲' : '▼'}</span>
                      </button>
                      
                      {expandedId === item._id && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-200 dark:border-gray-600 shadow-inner font-medium leading-relaxed">
                          {item.description || <span className="text-gray-400 italic">{current.descEmpty}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 z-10">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-2 rounded-xl font-black text-[10px] uppercase shadow-sm ${item.completed?'bg-red-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-blue-600 hover:text-white transition'}`}>{item.completed ? current.btnUndo : current.btnDone}</button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="px-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 text-[10px] font-black uppercase transition">{current.btnEdit}</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="px-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-red-500 text-[10px] font-black uppercase transition">{current.btnDel}</button>
                    </div> 
                  </>
                )}
              </div> 
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-x-auto border-2 border-gray-100 dark:border-gray-700 mb-8 relative z-10">
            <table className="w-full text-center min-w-[600px]">
              <thead className="bg-[#002f6c] text-white text-xs font-bold tracking-widest uppercase"><tr><th className="p-4">{current.thItem}</th><th className="p-4">{current.thPrice}</th><th className="p-4">{current.thSeller}</th><th className="p-4">{current.thStatus}</th><th className="p-4">{current.thAction}</th></tr></thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item._id} className={`border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${item.completed ? 'sold-out text-red-500' : ''}`}>
                    <td className="p-4 text-left font-black text-sm relative">
                      {item.completed && <div className="absolute top-0 left-0 bg-red-500 text-white font-black text-[8px] px-2 py-0.5 rounded-br-lg shadow-sm">{current.soldOut}</div>}
                      <span className={item.completed ? 'line-through' : 'text-gray-800 dark:text-gray-200'}>{item.title}</span> 
                      <button onClick={() => handleLike(item._id)} className={`ml-2 text-[10px] font-black ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-300'}`}>♥{item.likes}</button>
                      
                      <div className="mt-2">
                        <button 
                          onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} 
                          className="text-[10px] text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1"
                        >
                          {expandedId === item._id ? current.btnDescHide : current.btnDescShow}
                        </button>
                        {expandedId === item._id && (
                          <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-pre-wrap shadow-inner border border-gray-100 dark:border-gray-600 leading-relaxed">
                            {item.description || <span className="text-gray-400 italic">{current.descEmpty}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-black text-sm text-blue-600 dark:text-blue-400">{item.price === 0 ? current.freeBadge : `${Number(item.price).toLocaleString()}${current.currency}`}</td>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">{item.sellerName} <br/><span className="text-[10px] text-gray-400">{item.phone}</span></td>
                    <td className="p-4"><span className={`px-4 py-1 rounded-full text-[10px] font-black shadow-sm ${item.completed ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>{item.completed ? current.stDone : current.stSale}</span></td>
                    <td className="p-4 flex flex-col items-center gap-1">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-20">{current.btnDone}/{current.btnUndo}</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full font-black text-[9px] uppercase w-20">{current.btnDel}</button>
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
  {/* 1. 학과 정보 */}
  <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">
    {current.footerDept}
  </p>

  {/* 2. 저작권 문구 + 툴팁 기능이 있는 깃허브 아이콘 */}
  <div className="flex items-center justify-center gap-4 mt-2 md:mt-3">
    <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold">
      {current.footerCopy}
    </p>
    
    {/* 💡 툴팁 구현을 위한 group 클래스 추가 */}
    <div className="relative group flex flex-col items-center">
      <a 
        href="https://github.com/eryang11188/todo-app-mini-project-20222017.git" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:scale-110"
      >
        {/* 요청하신 사이즈 35px 적용 */}
        <svg 
          height="35" 
          width="35" 
          viewBox="0 0 16 16" 
          fill="currentColor" 
          className="opacity-80 hover:opacity-100"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>
      </a>

      {/* ✨ 마우스를 올리면(hover) 나타나는 툴팁 박스 */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center animate-bounce">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 dark:bg-gray-700 shadow-lg rounded-md font-bold">
          Github Profile
        </span>
        {/* 삼각형 꼬리 */}
        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}
export default MarketPage;