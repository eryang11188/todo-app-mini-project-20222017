// backend/index.js 최종본 전체 복사
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

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
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

app.get('/api/market', async (req, res) => { res.json(await Item.find({ type: 'market' })); });
app.get('/api/todo', async (req, res) => { res.json(await Item.find({ type: 'todo' })); });
app.post('/api/market', async (req, res) => { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); });
app.post('/api/todo', async (req, res) => { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); });

app.patch('/api/items/:id/like', async (req, res) => { 
  const val = req.body.value || 1;
  const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: val } }, { new: true }); 
  res.json(item); 
});

app.put('/api/items/:id', async (req, res) => { const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item); });
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제' }); });

// ✅ AI 라우터: 무료 티어 에러 방지 및 답변 길이 확장
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "프롬프트가 없습니다." });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

    const modelRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelData = await modelRes.json();

    if (!modelRes.ok) throw new Error(`API 인증 실패: ${modelData.error?.message}`);

    const availableModels = modelData.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    // 💡 에러 주범인 'Pro' 모델을 제외하고, 가장 최신 'Flash' 모델만 찾습니다.
    const flashModels = availableModels.filter(m => m.name.includes("flash") && !m.name.includes("pro"));
    const safeModel = flashModels.find(m => m.name.includes("gemini-3")) || 
                      flashModels.find(m => m.name.includes("gemini-2.5")) || 
                      flashModels[0] || availableModels[0];
    
    if (!safeModel) throw new Error("사용 가능한 AI 모델이 없습니다.");

    const targetModelName = safeModel.name.replace('models/', '');
    console.log(`🤖 [AI 연동] 안정성 100% 모델 선택: ${targetModelName}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: targetModelName,
      // 💡 토큰 한도를 800으로 늘려서 AI가 마음껏 길게 설명할 수 있게 풀어줍니다.
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 } 
    });
    
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });

  } catch (error) {
    console.error("🚨 AI 생성 에러:", error.message);
    res.status(500).json({ error: "AI 서버 연동 중 문제 발생", details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') { app.listen(5000, () => console.log(`🚀 서버 실행 중`)); }
module.exports = app;