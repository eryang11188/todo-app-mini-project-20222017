import { useState, useEffect } from 'react'
import axios from 'axios'

// ✅ 다국어 분리 (데이터 무결성 유지)
const TITLE_MENTIONS = {
  ko: ["오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", "지루함을 깨뜨릴 오늘의 스케줄을 적어주세요.", "미래의 나에게 부끄럽지 않을 계획을 세웁시다.", "작은 목표가 모여 전설을 만듭니다.", "오늘 하루, 어떤 멋진 일들을 계획하고 있나요?", "기록하는 순간, 목표는 이미 현실에 한 걸음 다가섭니다.", "어제보다 더 나은 오늘을 위한 당신만의 계획!", "성공적인 하루의 시작, 명확한 목표 설정부터!", "작은 성취들이 모여 눈부신 미래를 완성합니다."],
  en: ["What is your mission today?", "One step for growth, what to do?", "Write down today's schedule to break the boredom.", "Plan something you won't regret to your future self.", "Small goals make legends.", "What wonderful things are you planning today?", "The moment you record, the goal is one step closer.", "Your own plan for a better today than yesterday!", "A successful day starts with clear goals!", "Small achievements gather to complete a dazzling future."]
};

const PLACEHOLDERS = {
  ko: ["어떤 위대한 미션을 수행할까요?", "성장을 위한 작은 습관 추가", "목표를 적는 순간 이미 반은 성공입니다.", "여기에 오늘의 핵심 목표를 입력하세요.", "가장 먼저 끝내고 싶은 일은 무엇인가요?", "오늘 하루를 알차게 만들 작은 미션 하나!", "세상을 바꿀 당신의 오늘 첫 번째 할 일은?", "미루고 미뤘던 그 과제, 오늘 한 번 끝내봅시다!", "작은 것부터 하나씩, 천천히 적어보세요.", "목표를 구체적으로 적을수록 실행력은 배가 됩니다."],
  en: ["What great mission will you undertake?", "Add a small habit for growth", "The moment you write down a goal, it's half success.", "Enter your core goal for today here.", "What do you want to finish first?", "One small mission to make today fruitful!", "What is your first task today to change the world?", "That assignment you've been putting off, let's finish it today!", "Write them down slowly, starting with small things.", "The more specific the goal, the doubled the execution."]
};

// ✅ 대중적인 명언/명대사 80종 (에러 수정 완료)
const QUOTES = [
  // 🎬 대중문화 (영화 & 애니메이션)
  { ko: "어제는 역사, 내일은 미스터리, 오늘은 선물. 그래서 우리는 현재(Present)라고 부른다. - 우그웨이 (쿵푸팬더)", en: "Yesterday is history, tomorrow is a mystery, today is a gift. That's why we call it the present. - Oogway (Kung Fu Panda)" },
  { ko: "하거나, 하지 않거나 둘 중 하나다. '해본다'는 건 없다. - 요다 (스타워즈)", en: "Do or do not. There is no try. - Yoda (Star Wars)" },
  { ko: "인생은 초콜릿 상자와 같다. 네가 무엇을 고를지 아무도 모르니까. - 포레스트 검프 (포레스트 검프)", en: "Life was like a box of chocolates. You never know what you're gonna get. - Forrest Gump (Forrest Gump)" },
  { ko: "우리가 왜 떨어지는 줄 아십니까? 다시 일어서는 법을 배우기 위해서죠. - 알프레드 (배트맨 비긴즈)", en: "Why do we fall? So we can learn to pick ourselves up. - Alfred (Batman Begins)" },
  { ko: "우리의 진정한 모습은 능력이 아니라 선택을 통해 나타난다. - 덤블도어 (해리포터)", en: "It is our choices that show what we truly are, far more than our abilities. - Dumbledore (Harry Potter)" },
  { ko: "카르페 디엠. 현재를 즐겨라, 소년들이여. - 존 키팅 (죽은 시인의 사회)", en: "Carpe diem. Seize the day, boys. - John Keating (Dead Poets Society)" },
  { ko: "큰 힘에는 큰 책임이 따른다. - 벤 삼촌 (스파이더맨)", en: "With great power comes great responsibility. - Uncle Ben (Spider-Man)" },
  { ko: "가장 어두운 시간에도 행복은 존재한다. 불을 켜는 것을 잊지 않는다면. - 덤블도어 (해리포터)", en: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light. - Dumbledore (Harry Potter)" },
  { ko: "꿈을 꾸지 않으면 아무것도 일어나지 않는다. - 칼 프레드릭슨 (업)", en: "If you don't dream, nothing happens. - Carl Fredricksen (Up)" },
  { ko: "누구든 요리할 수 있다. - 오귀스트 구스토 (라따뚜이)", en: "Anyone can cook. - Auguste Gusteau (Ratatouille)" },
  { ko: "과거는 아플 수 있어. 하지만 넌 과거로부터 도망칠 수도, 배울 수도 있지. - 라피키 (라이온 킹)", en: "Oh yes, the past can hurt. But the way I see it, you can either run from it or learn from it. - Rafiki (The Lion King)" },
  { ko: "역경 속에서 피어난 꽃이 가장 희귀하고 아름다운 꽃이다. - 황제 (뮬란)", en: "The flower that blooms in adversity is the most rare and beautiful of all. - The Emperor (Mulan)" },
  { ko: "우리가 할 수 있는 유일한 결정은 우리에게 주어진 시간을 어떻게 쓸 것인가이다. - 간달프 (반지의 제왕)", en: "All we have to decide is what to do with the time that is given us. - Gandalf (The Lord of the Rings)" },
  { ko: "무한한 공간 저 너머로! - 버즈 라이트이어 (토이 스토리)", en: "To infinity and beyond! - Buzz Lightyear (Toy Story)" },
  { ko: "바쁘게 살거나, 바쁘게 죽거나. - 앤디 듀프레인 (쇼생크 탈출)", en: "Get busy living or get busy dying. - Andy Dufresne (The Shawshank Redemption)" },
  { ko: "얼마나 세게 치느냐가 아니라, 얼마나 세게 맞고도 계속 앞으로 나아갈 수 있느냐가 중요하다. - 록키 발보아 (록키 발보아)", en: "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward. - Rocky Balboa (Rocky Balboa)" },
  { ko: "당신에게 꿈이 있다면, 그것을 지켜야 한다. - 크리스 가드너 (행복을 찾아서)", en: "You got a dream, you gotta protect it. - Chris Gardner (The Pursuit of Happyness)" },
  { ko: "계속 헤엄쳐, 그냥 계속 헤엄쳐. - 도리 (니모를 찾아서)", en: "Just keep swimming. - Dory (Finding Nemo)" },
  { ko: "지금 이 순간 당신이 무엇을 하느냐가 차이를 만든다. - 사라 코너 (터미네이터)", en: "It's what you do right now that makes a difference. - Sarah Connor (Terminator)" },
  { ko: "내가 누구인지는 내가 하는 행동이 말해준다. - 브루스 웨인 (다크 나이트)", en: "It is not who I am underneath, but what I do that defines me. - Bruce Wayne (The Dark Knight)" },

  // 📖 속담 및 격언
  { ko: "천 리 길도 한 걸음부터. - 한국 속담", en: "A journey of a thousand miles begins with a single step. - Proverb" },
  { ko: "고생 끝에 낙이 온다. - 한국 속담", en: "No pain, no gain. - Proverb" },
  { ko: "시작이 반이다. - 한국 속담", en: "Well begun is half done. - Proverb" },
  { ko: "빨리 가려면 혼자 가고, 멀리 가려면 함께 가라. - 아프리카 속담", en: "If you want to go fast, go alone. If you want to go far, go together. - African Proverb" },
  { ko: "일찍 일어나는 새가 벌레를 잡는다. - 서양 속담", en: "The early bird catches the worm. - English Proverb" },
  { ko: "로마는 하루아침에 이루어지지 않았다. - 서양 속담", en: "Rome wasn't built in a day. - English Proverb" },
  { ko: "뜻이 있는 곳에 길이 있다. - 서양 속담", en: "Where there is a will, there is a way. - English Proverb" },
  { ko: "행동은 말보다 더 큰 소리를 낸다. - 서양 속담", en: "Actions speak louder than words. - English Proverb" },
  { ko: "연습이 완벽을 만든다. - 서양 속담", en: "Practice makes perfect. - English Proverb" },
  { ko: "모든 구름에는 은빛 테두리가 있다. - 서양 속담", en: "Every cloud has a silver lining. - English Proverb" },
  { ko: "책의 표지만 보고 내용을 판단하지 마라. - 서양 속담", en: "Don't judge a book by its cover. - English Proverb" },
  { ko: "뿌린 대로 거둔다. - 서양 속담", en: "As you sow, so shall you reap. - English Proverb" },
  { ko: "자신의 운명을 사랑하라. (Amor fati) - 라틴어 격언", en: "Love your fate. (Amor fati) - Latin Proverb" },
  { ko: "죽음을 기억하라. (Memento mori) - 라틴어 격언", en: "Remember that you must die. (Memento mori) - Latin Proverb" },
  { ko: "이 또한 지나가리라. - 페르시아 격언", en: "This too shall pass. - Persian Proverb" },

  // 🔥 동기부여 및 철학 (위인, 리더, 작가 등)
  { ko: "천재는 1%의 영감과 99%의 노력으로 이루어진다. - 토머스 에디슨", en: "Genius is one percent inspiration and ninety-nine percent perspiration. - Thomas Edison" },
  { ko: "내일의 할 일을 오늘 하라. - 벤저민 프랭클린", en: "Do not put off until tomorrow what you can do today. - Benjamin Franklin" },
  { ko: "끝날 때까지는 끝난 게 아니다. - 요기 베라", en: "It ain't over till it's over. - Yogi Berra" },
  { ko: "아무것도 하지 않으면 아무 일도 일어나지 않는다. - 기시미 이치로", en: "Nothing happens if you do nothing. - Ichiro Kishimi" },
  { ko: "포기하지 않는 한 실패한 것이 아니다. - 알베르트 아인슈타인", en: "You never fail until you stop trying. - Albert Einstein" },
  { ko: "늘 갈망하고 우직하게 나아가라. - 스티브 잡스", en: "Stay hungry, stay foolish. - Steve Jobs" },
  { ko: "당신의 시간은 한정되어 있다. 남의 삶을 사느라 시간을 낭비하지 마라. - 스티브 잡스", en: "Your time is limited, so don't waste it living someone else's life. - Steve Jobs" },
  { ko: "무언가가 충분히 중요하다면, 확률이 당신 편이 아니더라도 그 일을 해야 한다. - 일론 머스크", en: "When something is important enough, you do it even if the odds are not in your favor. - Elon Musk" },
  { ko: "성공을 축하하는 것도 좋지만, 실패의 교훈에 주의를 기울이는 것이 더 중요하다. - 제프 베이조스", en: "It's fine to celebrate success but it is more important to heed the lessons of failure. - Jeff Bezos" },
  { ko: "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다. - 마크 저커버그", en: "The biggest risk is not taking any risk. - Mark Zuckerberg" },
  { ko: "시작하는 방법은 말하는 것을 그만두고 행동하는 것이다. - 월트 디즈니", en: "The way to get started is to quit talking and begin doing. - Walt Disney" },
  { ko: "항상 완성되기 전까지는 불가능해 보인다. - 넬슨 만델라", en: "It always seems impossible until it's done. - Nelson Mandela" },
  { ko: "나는 천천히 걷지만, 결코 뒷걸음질 치지 않는다. - 에이브러햄 링컨", en: "I am a slow walker, but I never walk back. - Abraham Lincoln" },
  { ko: "살아가는 데 있어 가장 큰 영광은 한 번도 넘어지지 않는 것이 아니라, 넘어질 때마다 일어서는 데 있다. - 넬슨 만델라", en: "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela" },
  { ko: "당신이 세상에서 보고 싶은 변화가 되어라. - 마하트마 간디", en: "Be the change that you wish to see in the world. - Mahatma Gandhi" },
  { ko: "날 수 없다면 뛰어라. 뛸 수 없다면 걸어라. 걸을 수 없다면 기어라. 무엇을 하든 계속 앞으로 나아가라. - 마틴 루터 킹 주니어", en: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward. - Martin Luther King Jr." },
  { ko: "반성하지 않는 삶은 살 가치가 없다. - 소크라테스", en: "The unexamined life is not worth living. - Socrates" },
  { ko: "훌륭함은 행동이 아니라 습관이다. - 아리스토텔레스", en: "Quality is not an act, it is a habit. - Aristotle" },
  { ko: "살아야 할 이유를 아는 사람은 어떠한 어려움도 견뎌낼 수 있다. - 프리드리히 니체", en: "He who has a why to live can bear almost any how. - Friedrich Nietzsche" },
  { ko: "나는 생각한다, 고로 나는 존재한다. - 르네 데카르트", en: "I think, therefore I am. - Rene Descartes" },
  { ko: "가장 어두운 밤도 언젠가 끝나고 태양은 떠오를 것이다. - 빅토르 위고", en: "Even the darkest night will end and the sun will rise. - Victor Hugo" },
  { ko: "앞서가는 비밀은 시작하는 것이다. - 마크 트웨인", en: "The secret of getting ahead is getting started. - Mark Twain" },
  { ko: "인생에서 가장 중요한 두 날은 당신이 태어난 날과 그 이유를 알아낸 날이다. - 마크 트웨인", en: "The two most important days in your life are the day you are born and the day you find out why. - Mark Twain" },
  { ko: "목표를 달성해서 얻는 것보다 목표를 달성하는 과정에서 어떤 사람이 되느냐가 훨씬 더 중요하다. - 헨리 데이비드 소로", en: "What you get by achieving your goals is not as important as what you become by achieving your goals. - Henry David Thoreau" },
  { ko: "스스로 자신이 되어라. 다른 사람의 자리는 이미 다 찼다. - 오스카 와일드", en: "Be yourself; everyone else is already taken. - Oscar Wilde" },
  { ko: "살아남는 종은 가장 강한 종도, 가장 똑똑한 종도 아니다. 변화에 가장 잘 적응하는 종이다. - 찰스 다윈", en: "It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change. - Charles Darwin" },
  { ko: "지능은 변화에 적응하는 능력이다. - 스티븐 호킹", en: "Intelligence is the ability to adapt to change. - Stephen Hawking" },
  { ko: "상상력은 지식보다 중요하다. - 알베르트 아인슈타인", en: "Imagination is more important than knowledge. - Albert Einstein" },
  { ko: "우리 모두에게 삶은 쉽지 않다. 그러나 그게 대수인가? 우리는 끈기를 가져야 하고, 무엇보다도 자신을 믿어야 한다. - 마리 퀴리", en: "Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves. - Marie Curie" },
  { ko: "스스로를 아는 것이 모든 지혜의 시작이다. - 아리스토텔레스", en: "Knowing yourself is the beginning of all wisdom. - Aristotle" },
  { ko: "천천히 가는 것을 두려워하지 말고, 멈추는 것을 두려워하라. - 중국 속담", en: "Be not afraid of growing slowly, be afraid only of standing still. - Chinese Proverb" },
  { ko: "승리하는 군대는 먼저 이겨놓고 싸움을 하며, 패배하는 군대는 먼저 싸움을 걸고 이길 방법을 찾는다. - 손자", en: "Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win. - Sun Tzu" },
  { ko: "부유함이란 많은 것을 소유하는 것이 아니라 적게 원하는 것에 있다. - 에픽테토스", en: "Wealth consists not in having great possessions, but in having few wants. - Epictetus" },
  { ko: "당신은 외부 사건이 아니라 당신의 마음에 대한 지배력을 가지고 있다. 이를 깨달으면 힘을 얻게 될 것이다. - 마르쿠스 아우렐리우스", en: "You have power over your mind - not outside events. Realize this, and you will find strength. - Marcus Aurelius" },
  { ko: "좋은 사람이란 어떤 사람인가 논쟁하느라 시간을 낭비하지 마라. 그냥 좋은 사람이 되어라. - 세네카", en: "Waste no more time arguing what a good man should be. Be one. - Seneca" },
  { ko: "멈추지 않는 한 얼마나 천천히 가는지는 중요하지 않다. - 공자", en: "It does not matter how slowly you go as long as you do not stop. - Confucius" },
  { ko: "아는 것만으로는 충분하지 않다. 적용해야 한다. 의지만으로는 충분하지 않다. 행동해야 한다. - 이소룡", en: "Knowing is not enough, we must apply. Willing is not enough, we must do. - Bruce Lee" },
  { ko: "오늘 당신이 하는 일이 당신의 모든 내일을 향상시킬 수 있다. - 랄프 마스턴", en: "What you do today can improve all your tomorrows. - Ralph Marston" },
  { ko: "변화의 비밀은 오래된 것과 싸우는 데 에너지를 집중하는 것이 아니라 새로운 것을 만드는 데 집중하는 것이다. - 소크라테스", en: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new. - Socrates" },
  { ko: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신의 믿음은 항상 옳다. - 헨리 포드", en: "Whether you think you can or you think you can't, you're right. - Henry Ford" },
  { ko: "기회는 일어나는 것이 아니라 당신이 만들어내는 것이다. - 크리스 그로서", en: "Opportunities don't happen. You create them. - Chris Grosser" },
  { ko: "성공으로 가는 길과 실패로 가는 길은 거의 똑같다. - 콜린 R. 데이비스", en: "The road to success and the road to failure are almost exactly the same. - Colin R. Davis" },
  { ko: "나는 실패한 적이 없다. 단지 작동하지 않는 10,000가지 방법을 발견했을 뿐이다. - 토머스 에디슨", en: "I have not failed. I've just found 10,000 ways that won't work. - Thomas Edison" },
  { ko: "성공은 최종적인 것이 아니며, 실패는 치명적인 것이 아니다. 중요한 것은 계속하려는 용기이다. - 윈스턴 처칠", en: "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill" },
  { ko: "위대한 일을 할 수 없다면 작은 일을 위대하게 하라. - 나폴레옹 힐", en: "If you cannot do great things, do small things in a great way. - Napoleon Hill" }
];

function TodoPage({ lang, timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0); const [titleMentionIndex, setTitleMentionIndex] = useState(0); const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' }); const [editingId, setEditingId] = useState(null); const [editForm, setEditForm] = useState({});
  const [viewType, setViewType] = useState('list'); const [currentPage, setCurrentPage] = useState(1); const itemsPerPage = 8;
  const [now, setNow] = useState(new Date()); const [isAlertEnabled, setIsAlertEnabled] = useState(true); const [tourIndex, setTourIndex] = useState(-1);
  const [showVersionInfo, setShowVersionInfo] = useState(false); const [showModalConfetti, setShowModalConfetti] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items';

  // ✅ 다국어 텍스트 사전 (워터마크 번역 포함)
  const t = {
    ko: {
      tourSteps: [
        { title: "👋 환영합니다!", desc: "CWNU 포털의 핵심 기능을 안내해 드릴게요.", targetId: "tour-header" }, 
        { title: "⏱️ 타이머 & 스톱워치", desc: "집중할 시간을 설정하거나 측정이 가능합니다.", targetId: "tour-timer" }, 
        { title: "🚨 30분 전 알림", desc: "타이머가 30분 이하일 때 적색으로 경고해줍니다.", targetId: "tour-timer-alert" }, 
        { title: "⏰ 초정밀 카운트다운", desc: "할 일마다 실시간 남은 시간을 확인할 수 있습니다.", targetId: "tour-add" }, 
        { title: "📝 자유로운 뷰", desc: "목록, 그리드, 테이블 형태로 관리가 가능합니다.", targetId: "tour-list-buttons" }
      ],
      tourSkip: "건너뛰기", tourNext: "다음 보기 ▶", tourEnd: "투어 종료 🎉", help: "💡 도움말", verCheck: "(버전 클릭 시 업데이트 내역 확인)",
      alarm: "30분 전 알람", focus: "집중 타이머", stop: "스톱워치", reset: "RESET", searchP: "🔍 찾으시는 할 일을 검색해보세요!",
      addBtn: "추가하기", newQuote: "🔄 New Quote", remainDay: "일", remainLeft: "남음", expired: "만료됨", expiredIcon: "💀 만료",
      thImp: "우선순위", thTitle: "미션명", thRemain: "남은 시간", thAct: "관리", btnSave: "저장", btnCancel: "취소", btnEdit: "수정", btnDel: "삭제",
      impObj: { '긴급': '긴급', '보통': '보통', '낮음': '낮음' },
      footerDept: "컴퓨터공학과 | 소프트웨어공학 프로젝트: CWNU 포털 시스템", 
      footerCopy: "@ 2026 정이량 | Gemini AI 협업 제작",
      modalTitle: "Todo V5 5.0 ver 업데이트 내역", modalSub: "25년 2학기 웹프로그래밍 기말대체 과제 `todos_v4`의 최종 진화형!",
      modalPrevTitle: "🤔 이전 버전", modalPrev1: "❌ 타이머 및 스톱워치 부재", modalPrev2: "❌ 마감 기한 시각화 기능 부재",
      modalCurTitle: "✨ 현재 버전 (V5 5.0)", modalCur1: "✅ 집중 타이머 & 스톱워치 탑재", modalCur2: "✅ 30분 전 알람 및 실시간 카운트다운", modalCur3: "✅ 할 일 통합 검색 기능 추가", modalCur4: "✅ 글로벌 다국어(KOR/ENG) 완벽 지원!",
      modalHistTitle: "🛠️ CWNU PORTAL 발전 과정",
      modalHistV1: "할 일 등록 및 기본적인 체크리스트 기능 구현", modalHistV2: "중요도 분류 시스템 및 마감 기한 설정 도입", modalHistV3: "리스트/그리드/테이블 다중 뷰 모드 지원", modalHistV4: "정밀 집중 타이머 및 30분 전 스마트 알림 통합", modalHistV5: "글로벌 다국어(KOR/ENG) 완벽 지원 및 UI 고도화",
      modalFreeTitle: "\"아... 유료인가요?\"", modalFreeDesc1: "아닙니다! 창대인을 위한 완전 무료 서비스입니다!", modalFreeDesc2: "철저한 시간 관리로 당신의 꿈을 앞당기세요!", modalBtn: "확인 완료!"
    },
    en: {
      tourSteps: [
        { title: "👋 Welcome!", desc: "Let me guide you through the core features.", targetId: "tour-header" }, 
        { title: "⏱️ Timer & Stopwatch", desc: "Set or measure time to focus.", targetId: "tour-timer" }, 
        { title: "🚨 30-Min Alert", desc: "Alerts in red when under 30 mins.", targetId: "tour-timer-alert" }, 
        { title: "⏰ Countdown", desc: "Check real-time remaining time.", targetId: "tour-add" }, 
        { title: "📝 Free View", desc: "Manage in list, grid, or table formats.", targetId: "tour-list-buttons" }
      ],
      tourSkip: "Skip", tourNext: "Next ▶", tourEnd: "End Tour 🎉", help: "💡 Guide", verCheck: "(Click version to check updates)",
      alarm: "30m Alert", focus: "Focus Timer", stop: "Stopwatch", reset: "RESET", searchP: "🔍 Search for tasks you are looking for!",
      addBtn: "Add Task", newQuote: "🔄 New Quote", remainDay: "d", remainLeft: "left", expired: "Expired", expiredIcon: "💀 Expired",
      thImp: "Priority", thTitle: "Mission", thRemain: "Remaining Time", thAct: "Action", btnSave: "Save", btnCancel: "Cancel", btnEdit: "Edit", btnDel: "Del",
      impObj: { '긴급': 'Urgent', '보통': 'Normal', '낮음': 'Low' },
      footerDept: "Department of Computer Science | Software Engineering Project: CWNU Portal System", 
      footerCopy: "@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works",
      modalTitle: "Todo V5 5.0 ver Updates", modalSub: "The ultimate evolution of the Fall '25 Web Programming final project `todos_v4`!",
      modalPrevTitle: "🤔 Previous Version", modalPrev1: "❌ No timer and stopwatch", modalPrev2: "❌ No visual deadline tracking",
      modalCurTitle: "✨ Current Version (V5 5.0)", modalCur1: "✅ Focus Timer & Stopwatch included", modalCur2: "✅ 30-min alert & real-time countdown", modalCur3: "✅ Integrated task search added", modalCur4: "✅ Global bilingual (KOR/ENG) support!",
      modalHistTitle: "🛠️ CWNU PORTAL Evolution",
      modalHistV1: "Task registration & basic checklist", modalHistV2: "Priority system & deadline settings", modalHistV3: "List/Grid/Table multi-view support", modalHistV4: "Precision focus timer & smart alerts", modalHistV5: "Full bilingual support (KOR/ENG) & UI enhancement",
      modalFreeTitle: "\"Wait, is this paid?\"", modalFreeDesc1: "No! It's a completely free service for CWNU students!", modalFreeDesc2: "Advance your dreams with thorough time management!", modalBtn: "Confirmed!"
    }
  };
  const current = t[lang];

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 50); return () => clearInterval(intervalId); }, []);
  useEffect(() => { const intervalId = setInterval(() => { setTitleMentionIndex(p => (p + 1) % TITLE_MENTIONS[lang].length); setPlaceholderIndex(p => (p + 1) % PLACEHOLDERS[lang].length); }, 6000); return () => clearInterval(intervalId); }, [lang]);
  useEffect(() => { if (showVersionInfo) { setShowModalConfetti(true); setTimeout(() => setShowModalConfetti(false), 2500); } }, [showVersionInfo]);

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < current.tourSteps.length) {
      if (tourIndex === 2 && timerMode !== 'timer') setTimerMode('timer'); 
      const el = document.getElementById(current.tourSteps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, timerMode, current.tourSteps]);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const handleRandomize = () => { setQuoteIndex(Math.floor(Math.random() * QUOTES.length)); setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS[lang].length)); }
  const formatTime = (ms) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); const mi = Math.floor((ms % 1000) / 10); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mi).padStart(2,'0')}`; }
  
  const getRemainingTime = (deadline) => { if (!deadline) return null; const diff = new Date(deadline) - now; if (diff <= 0) return "EXPIRED"; return { days: Math.floor(diff/86400000), hours: Math.floor((diff/3600000)%24), mins: Math.floor((diff/60000)%60), secs: Math.floor((diff/1000)%60), ms: Math.floor((diff%1000)/10) }; }
  
  const addTodo = async (e) => { e.preventDefault(); if(!title) return; await axios.post(API_URL, { title, importance, todoDeadline }); fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1); handleRandomize(); }
  const saveEditTodo = async (id) => { await axios.put(`${COMMON_URL}/${id}`, editForm); fetchTodos(); setEditingId(null); }

  const handleTimeInput = (field, value) => {
    const rawValue = value.replace(/[^0-9]/g, ''); 
    if (rawValue.length > 2) return; 
    let num = parseInt(rawValue, 10);
    if (!isNaN(num)) {
      if (field === 'h' && num > 23) num = 23;
      if ((field === 'm' || field === 's') && num > 59) num = 59;
      setInputs(prev => ({ ...prev, [field]: num.toString() })); 
    } else { setInputs(prev => ({ ...prev, [field]: '' })); }
  };
  const handleTimeBlur = (field) => { setInputs(prev => { if (prev[field] === '') return { ...prev, [field]: '00' }; return { ...prev, [field]: String(prev[field]).padStart(2, '0') }; }); };
  const handleStartPause = () => {
    if (!timerIsRunning) {
      if (timerMode === 'timer') {
        if (timerTime === 0) {
          const ms = ((parseInt(inputs.h || 0) * 3600) + (parseInt(inputs.m || 0) * 60) + parseInt(inputs.s || 0)) * 1000;
          if (ms === 0) return; 
          setTimerTime(ms);
        }
      }
      setTimerIsRunning(true);
    } else { setTimerIsRunning(false); }
  };

  const filteredTodos = todos.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage) || 1;
  const currentTodos = filteredTodos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nanum+Pen+Script&display=swap');
        .font-cursive-custom { font-family: 'Caveat', 'Nanum Pen Script', cursive; letter-spacing: 0.05em; }
        .font-korean-cursive { font-family: 'Nanum Pen Script', cursive; letter-spacing: 0.1em; }
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-indigo-400 dark:border-indigo-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-indigo-600 dark:text-indigo-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{current.tourSteps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{current.tourSteps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{current.tourSteps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2"><button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{current.tourSkip}</button><button onClick={() => setTourIndex(p => p+1 >= current.tourSteps.length ? -1 : p+1)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">{tourIndex === current.tourSteps.length - 1 ? current.tourEnd : current.tourNext}</button></div>
        </div>
      )}

      {/* ✅ 꽉 찬 디테일 모달창 원상복구 및 다국어 패치 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-indigo-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {showModalConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}
            
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center">{current.modalTitle}</h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">{current.modalSub}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">{current.modalPrevTitle}</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 text-center">
                  <li>{current.modalPrev1}</li>
                  <li>{current.modalPrev2}</li>
                </ul>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-inner">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-black text-sm mb-3 text-center">{current.modalCurTitle}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 text-center">
                  <li>{current.modalCur1}</li>
                  <li>{current.modalCur2}</li>
                  <li>{current.modalCur3}</li>
                  <li>{current.modalCur4}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm flex justify-center items-center gap-2">{current.modalHistTitle}</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V1.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V2.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V3.5:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V4.0:</span><span className="text-slate-600 dark:text-gray-400">{current.modalHistV4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-indigo-600 font-black min-w-[45px]">V5.0:</span><span className="text-slate-800 dark:text-gray-200 italic">{current.modalHistV5}</span></p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 text-center mb-6 shadow-inner relative overflow-hidden">
                <h4 className="text-xl font-black text-indigo-800 dark:text-indigo-400 mb-1">{current.modalFreeTitle}</h4>
                <p className="text-indigo-700 dark:text-indigo-300 font-bold text-xs"><span className="font-black text-sm">{current.modalFreeDesc1}</span><br/>{current.modalFreeDesc2}</p>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition shadow-lg">{current.modalBtn}</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-6 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              TODO <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 italic drop-shadow-lg text-2xl md:text-4xl animate-[pulse_2s_ease-in-out_infinite] opacity-90">V5 5.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md items-center gap-1 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all mt-4 md:mt-0">
              {current.help}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-indigo-400 dark:text-indigo-500 font-black cursor-pointer hover:text-indigo-600 transition tracking-widest">{current.verCheck}</p>
        </div>

        <div id="tour-timer" className="bg-[#111] dark:bg-gray-950 text-white p-6 md:p-10 rounded-3xl md:rounded-[4rem] mb-8 md:mb-12 shadow-2xl border-b-[8px] md:border-b-[12px] border-indigo-900 dark:border-indigo-800 text-center relative mt-6 md:mt-8">
          {timerMode === 'timer' && (
            <div id="tour-timer-alert" className="absolute top-4 right-4 md:top-8 md:right-10 flex items-center gap-1 md:gap-2 bg-gray-900 p-1.5 md:p-2 rounded-lg md:rounded-xl border border-gray-700 z-10">
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider hidden sm:inline ${isAlertEnabled ? 'text-red-400' : 'text-gray-500'}`}>{current.alarm}</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} /><div className="w-7 md:w-9 h-4 md:h-5 bg-gray-700 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 md:after:h-4 after:w-3 md:after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label>
            </div>
          )}
          <div className="flex justify-center gap-3 md:gap-4 mb-4 md:mb-6 mt-4 sm:mt-0">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>{current.focus}</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>{current.stop}</button>
          </div>
          
          {!timerIsRunning && timerMode === 'timer' && timerTime === 0 ? (
            <div className="flex justify-center items-center gap-2 text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter">
              <input value={inputs.h} onBlur={()=>handleTimeBlur('h')} onChange={e=>handleTimeInput('h', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.m} onBlur={()=>handleTimeBlur('m')} onChange={e=>handleTimeInput('m', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>:
              <input value={inputs.s} onBlur={()=>handleTimeBlur('s')} onChange={e=>handleTimeInput('s', e.target.value)} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 focus:border-indigo-400 outline-none placeholder-gray-700" placeholder="00" maxLength="2"/>
            </div>
          ) : (
            <div className={`text-5xl md:text-7xl font-black mb-6 md:mb-10 font-mono tracking-tighter ${isTimerUrgent ? 'animate-[pulse_1s_ease-in-out_infinite] text-red-500' : (!timerIsRunning && timerTime > 0 ? 'opacity-50' : '')}`}>
              {formatTime(timerTime)}
            </div>
          )}
          
          <div className="flex justify-center gap-3 md:gap-4">
            <button onClick={handleStartPause} className={`px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg transition-all ${timerIsRunning?'bg-red-600 text-white shadow-lg':'bg-white text-black hover:scale-105'}`}>
              {timerIsRunning ? 'PAUSE' : (timerTime > 0 ? 'RESUME' : 'START')}
            </button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-lg text-gray-600 hover:border-gray-600">{current.reset}</button>
          </div>
        </div>

        {/* ✅ 명언 렌더링 구역 시작 */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-[2.5rem] py-2 font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-800 to-black dark:from-white dark:via-indigo-300 dark:to-gray-300 mb-6 md:mb-8 tracking-tighter flex justify-center items-center">
             <span key={TITLE_MENTIONS[lang][titleMentionIndex]} className="inline-block animate-submit-text-fade">{TITLE_MENTIONS[lang][titleMentionIndex]}</span>
          </h2>
          
          <div className="flex flex-col items-center p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-2 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-b from-white to-indigo-50/50 dark:from-gray-800 dark:to-gray-900 shadow-sm relative overflow-hidden">
            {/* 💡 JS 전처리 로직 (데이터 스플릿) */}
            {(() => {
                const rawQuoteEn = QUOTES[quoteIndex].en;
                const enParts = rawQuoteEn.split(' - ');
                const enBody = enParts[0];
                const enSource = enParts.length > 1 ? enParts.slice(1).join(' - ') : '';

                const rawQuoteKo = QUOTES[quoteIndex].ko;
                const koParts = rawQuoteKo.split(' - ');
                const koBody = koParts[0];
                const koSource = koParts.length > 1 ? koParts.slice(1).join(' - ') : '';

                return (
                    <>
                        {/* 1️⃣ [영문 명언 구역] */}
                        <div className="flex flex-col items-center mb-6 md:mb-8 px-2 md:px-4 w-full relative group">
                            {/* 영문 본문: 기존의 크고 화려한 그라데이션 필기체 스타일 */}
                            <p className="text-2xl md:text-[2.5rem] py-2 font-cursive-custom font-black drop-shadow-md text-center leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 transition-all duration-300">
                                "{enBody}"
                            </p>
                            
                            {/* 영문 출처: 그라데이션 제거, 아주 작게 우측 하단 배치, 얇고 정갈한 폰트 */}
                            {enSource && (
                                <p className="self-end text-[11px] md:text-sm font-bold text-gray-500 dark:text-gray-400 font-mono tracking-tighter mt-[-6px] md:mt-[-10px] opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    - {enSource}
                                </p>
                            )}
                        </div>

                        {/* 2️⃣ [한글 명언 구역] */}
                        <div className="bg-white/80 dark:bg-gray-800/80 px-6 py-3 md:px-8 md:py-4 rounded-3xl md:rounded-full shadow-sm border border-gray-100 flex flex-col items-center mb-2 w-[95%] md:w-auto md:max-w-[95%]">
                            {/* 한글 본문: 기존 스타일 유지 */}
                            <p className="text-xl md:text-3xl font-korean-cursive text-gray-700 dark:text-gray-200 font-bold leading-tight text-center break-keep w-full">
                                {koBody}
                            </p>
                            
                            {/* 한글 출처: 줄바꿈 후 작고 회색으로 세련되게 */}
                            {koSource && (
                                <p className="self-end text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight mt-1 whitespace-nowrap">
                                    - {koSource}
                                </p>
                            )}
                        </div>
                    </>
                );
            })()}
            
            <button onClick={handleRandomize} className="mt-6 md:mt-8 text-[10px] md:text-[11px] bg-white dark:bg-gray-700 border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-full font-black hover:text-indigo-600 transition-all hover:scale-105 z-10 uppercase tracking-widest">{current.newQuote}</button>
          </div>
        </div>
        {/* ✅ 명언 렌더링 구역 끝 */}

        <div className="mb-6 w-full relative z-10">
          <input 
            type="text" 
            placeholder={current.searchP} 
            value={searchTerm} 
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            className="w-full p-3 md:p-4 border-2 text-sm md:text-base border-indigo-100 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-indigo-400 dark:bg-gray-800 dark:text-white transition-all font-bold"
          />
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row flex-wrap gap-3 mb-6 relative overflow-hidden">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 dark:text-white p-3 md:px-5 rounded-2xl font-black text-sm outline-none border border-gray-100 z-10"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
          <input placeholder={PLACEHOLDERS[lang][placeholderIndex]} value={title} onChange={e=>setTitle(e.target.value)} className="w-full md:w-auto flex-grow p-3 outline-none bg-transparent font-bold text-gray-800 dark:text-white text-base md:text-lg z-10 border-gray-100 md:border-none rounded-2xl md:rounded-none"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-full md:w-56 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-xs font-black cursor-pointer text-gray-600 dark:text-gray-300 z-10 border-gray-100 md:border-none"/>
          <button className="w-full md:w-auto bg-indigo-900 dark:bg-indigo-700 text-white px-6 py-3 md:px-10 md:py-4 rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 transition shadow-lg z-10">{current.addBtn}</button>
        </form>

        <div className="flex justify-end mb-6">
          <div id="tour-list-buttons" className="flex gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-200 shadow-sm">
            <button onClick={() => setViewType('list')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='list'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>LIST</button>
            <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='grid'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>GRID</button>
            <button onClick={() => setViewType('table')} className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shadow-sm ${viewType==='table'?'bg-indigo-900 text-white':'bg-white dark:bg-gray-800 text-gray-400'}`}>TABLE</button>
          </div>
        </div>

        <div className="transition-all">
          {viewType === 'table' ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-xl overflow-x-auto border-2 border-gray-100 dark:border-gray-700 mb-8 w-full">
              <table className="w-full text-center min-w-[500px] md:min-w-full">
                <thead className="bg-[#111] text-white text-xs md:text-sm font-bold uppercase tracking-widest"><tr><th className="p-3 md:p-5">{current.thImp}</th><th className="p-3 md:p-5 text-left">{current.thTitle}</th><th className="p-3 md:p-5">{current.thRemain}</th><th className="p-3 md:p-5">{current.thAct}</th></tr></thead>
                <tbody>
                {currentTodos.map(todo => { 
                  const remain = getRemainingTime(todo.todoDeadline); 
                  return ( 
                  <tr key={todo._id} className="border-b dark:border-gray-700 hover:bg-indigo-50/30 transition-colors"> 
                    {editingId === todo._id ? (
                      <td colSpan="4" className="p-3 md:p-4 bg-indigo-50/50 dark:bg-indigo-900/20">
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="w-full sm:w-auto p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-xs"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
                          <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="w-full sm:flex-grow p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-sm outline-none"/>
                          <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="w-full sm:w-auto p-2 border dark:border-gray-600 dark:bg-gray-700 rounded-xl text-xs font-bold outline-none"/>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => saveEditTodo(todo._id)} className="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs">{current.btnSave}</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 sm:flex-none bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs">{current.btnCancel}</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-3 md:p-5"><span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400 text-gray-900':'bg-green-500'}`}>{current.impObj[todo.importance] || todo.importance}</span></td> 
                        <td className="p-3 md:p-5 text-left font-black text-gray-800 dark:text-gray-100 text-sm md:text-lg">{todo.title}</td> 
                        <td className="p-3 md:p-5 text-sm md:text-base font-black text-indigo-600 dark:text-indigo-300 whitespace-nowrap">{remain === "EXPIRED" ? current.expiredIcon : remain ? `${remain.days}${current.remainDay} ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}` : "-"}</td> 
                        <td className="p-3 md:p-5 flex justify-center gap-1.5">
                          <button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full transition">{current.btnEdit}</button>
                          <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[10px] font-black uppercase text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full transition">{current.btnDel}</button>
                        </td> 
                      </>
                    )}
                  </tr> 
                )})}
                </tbody></table></div>
          ) : (
            <div className={viewType === 'list' ? "space-y-3 md:space-y-4 mb-8" : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8"}>
              {currentTodos.map(todo => { 
                const remain = getRemainingTime(todo.todoDeadline); 
                return ( 
                <div key={todo._id} className="bg-white dark:bg-gray-800 p-5 md:p-7 rounded-3xl md:rounded-[2.5rem] shadow-md border border-gray-100 dark:border-gray-700 flex flex-col group transition-all hover:-translate-y-1"> 
                  {editingId === todo._id ? (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl font-bold text-xs"><option value="긴급">{current.impObj['긴급']}</option><option value="보통">{current.impObj['보통']}</option><option value="낮음">{current.impObj['낮음']}</option></select>
                      <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl font-black outline-none text-sm"/>
                      <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-2 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl text-xs font-bold"/>
                      <div className="flex gap-2"><button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white flex-grow py-2 rounded-xl font-black text-xs">{current.btnSave}</button><button onClick={() => setEditingId(null)} className="bg-gray-400 text-white flex-grow py-2 rounded-xl font-black text-xs">{current.btnCancel}</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 w-full"><span className={`min-w-[12px] h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}></span><span className="font-black text-gray-800 dark:text-gray-100 text-lg md:text-xl truncate">{todo.title}</span></div> 
                      {remain && <div className={`text-sm md:text-base font-black ml-6 mt-2 inline-block px-3 py-1.5 rounded-lg border ${remain === "EXPIRED" ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/30"}`}>⏱️ {remain === "EXPIRED" ? current.expired : `${remain.days}${current.remainDay} ${String(remain.hours).padStart(2,'0')}:${String(remain.mins).padStart(2,'0')}:${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')} ${current.remainLeft}`}</div>} 
                      <div className="flex gap-2 mt-4 ml-6"><button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition">{current.btnEdit}</button><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition">{current.btnDel}</button></div> 
                    </>
                  )}
                </div> 
              ); })}
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">PREV</button>
            <div className="flex gap-1">
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  onClick={() => setCurrentPage(num)} 
                  className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === num ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-indigo-100 dark:border-gray-700 hover:border-indigo-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-lg font-black text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-2 break-keep leading-relaxed">{current.footerDept}</p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold mt-1 md:mt-2">{current.footerCopy}</p>
      </footer>
    </div>
  )
}
export default TodoPage;