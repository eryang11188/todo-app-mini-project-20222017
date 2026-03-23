// backend/index.js 전체 복사
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // ✅ AI 라이브러리 추가

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Gemini AI 초기화 (환경변수에서 키 가져오기)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB 연결 성공'));

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  deadline: { type: String, default: "" },      
  todoDeadline: { type: String, default: "" },  
  importance: { type: String, default: "보통" },
  type: { type: String, required: true, enum: ['todo', 'market'] },
  studentId: { type: String, default: "" },
  sellerName: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now } // 정렬을 위해 생성일 추가
});
const Item = mongoose.model('Item', itemSchema);

app.get('/api/market', async (req, res) => { res.json(await Item.find({ type: 'market' })); });
app.get('/api/todo', async (req, res) => { res.json(await Item.find({ type: 'todo' })); });
app.post('/api/market', async (req, res) => { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); });
app.post('/api/todo', async (req, res) => { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); });

// 1. 찜하기 토글 API (증가/감소 모두 지원)
app.patch('/api/items/:id/like', async (req, res) => { 
  const val = req.body.value || 1;
  const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: val } }, { new: true }); 
  res.json(item); 
});

app.put('/api/items/:id', async (req, res) => { const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item); });
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제' }); });

// ✅ 2. AI 자동 생성 전용 API 라우터 추가
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "프롬프트가 없습니다." });
    }

    // 최신 경량 모델 적용 (응답 속도 최적화)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.json({ text: aiText });
  } catch (error) {
    console.error("AI 생성 중 에러 발생:", error);
    res.status(500).json({ error: "AI 응답을 가져오는 데 실패했습니다." });
  }
});

if (process.env.NODE_ENV !== 'production') { app.listen(5000, () => console.log(`🚀 서버 실행 중`)); }
module.exports = app;