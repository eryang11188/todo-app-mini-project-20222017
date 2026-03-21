import { Link } from 'react-router-dom';

function MainPage() {
  const services = [
    { title: "중고 마켓", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: "ToDo List", desc: "집중 타이머와 함께 일정을 관리하세요.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: "학점 계산기", desc: "실시간 그래프로 성적을 분석하세요.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-10 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black text-[#002f6c] mb-4 tracking-tighter">
          CWNU <span className="text-blue-600">SMART</span> PORTAL
        </h2>
        <p className="text-gray-500 font-bold text-lg">창원대학교 학우들을 위한 올인원 캠퍼스 솔루션</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {services.map((s, idx) => (
          <Link key={idx} to={s.path} className="group relative overflow-hidden bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-4 border-2 border-gray-50">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${s.color}`}></div>
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
            <h3 className="text-3xl font-black text-gray-800 mb-3">{s.title}</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">{s.desc}</p>
            <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${s.color} text-white font-black text-sm shadow-md`}>
              서비스 바로가기 →
            </div>
          </Link>
        ))}
      </div>

      {/* 🚀 공지사항 링크 반영 */}
      <div className="mt-20 bg-blue-50/50 p-10 rounded-[3rem] border-2 border-blue-100/50 text-center flex flex-col items-center">
        <h4 className="text-xl font-black text-blue-800 mb-4">📢 공지사항</h4>
        <a 
          href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" 
          target="_blank" 
          rel="noreferrer" 
          className="text-blue-600 font-bold text-lg hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
        >
          "V5_super_3.5 정식 업데이트 완료! 창원대학교 공식 공지사항 확인하기" <span className="text-sm">↗</span>
        </a>
      </div>
    </div>
  );
}

export default MainPage;