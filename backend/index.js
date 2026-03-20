// backend/index.js 최종 진화형 (Dual App 지원)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공 (Dual App Mode)'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 2. 통합 데이터 모델 정의 (Todo와 Market의 필드를 모두 수용)
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  // Market 전용 필드
  deadline: { type: String, default: "" }, 
  // Todo 전용 필드 (L: Low, M: Medium, H: High)
  importance: { type: String, default: "M" },
  // ⭐ 핵심: 데이터 타입 구분 (todo 또는 market)
  type: { type: String, required: true, enum: ['todo', 'market'] }
});
const Item = mongoose.model('Item', itemSchema);

// 3. API 엔드포인트 설계 (독립적인 라우팅)

// --- [MARKET API] ---
app.get('/api/market', async (req, res) => {
  try {
    const marketItems = await Item.find({ type: 'market' }); // 마켓 데이터만 추출
    res.json(marketItems);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/market', async (req, res) => {
  const newItem = new Item({
    title: req.body.title,
    deadline: req.body.deadline,
    type: 'market' // 강제로 market 타입 지정
  });
  try {
    await newItem.save();
    res.json(newItem);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- [TODO API] ---
app.get('/api/todo', async (req, res) => {
  try {
    const todoItems = await Item.find({ type: 'todo' }); // 투두 데이터만 추출
    res.json(todoItems);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/todo', async (req, res) => {
  const newItem = new Item({
    title: req.body.title,
    importance: req.body.importance,
    type: 'todo' // 강제로 todo 타입 지정
  });
  try {
    await newItem.save();
    res.json(newItem);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- [공통 API: 수정/삭제] ---
app.put('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 서버 실행
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 서버 실행: http://localhost:${PORT}`));
}
module.exports = app;