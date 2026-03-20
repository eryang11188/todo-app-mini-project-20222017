import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';

function App() {
  const [timerMode, setTimerMode] = useState('timer');
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime(prev => {
          if (timerMode === 'timer') {
            if (prev <= 10) { setTimerIsRunning(false); return 0; }
            return prev - 10;
          }
          return prev + 10;
        });
      }, 10);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerIsRunning, timerMode]);

  const timerProps = { timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-[#002f6c] p-4 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="font-black text-xl italic tracking-tighter">CWNU PORTAL <span className="text-red-400">v5_super</span></h1>
            <div className="flex gap-6 font-bold text-sm">
              <Link to="/market" className="hover:text-blue-300">🏪 MARKET</Link>
              <Link to="/todo" className="hover:text-blue-300">📝 TODO</Link>
            </div>
          </div>
        </nav>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/todo" element={<TodoPage {...timerProps} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;