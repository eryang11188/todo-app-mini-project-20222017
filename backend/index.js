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

// 💡 Mongoose 경고 해결: returnDocument: 'after'로 수정
app.patch('/api/items/:id/like', async (req, res) => { 
  const val = req.body.value || 1;
  const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: val } }, { returnDocument: 'after' }); 
  res.json(item); 
});

app.put('/api/items/:id', async (req, res) => { const item = await Item.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); res.json(item); });
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제' }); });

// ✅ AI 라우터: 답변 끊김 방지 및 토큰 최적화
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
    const flashModels = availableModels.filter(m => m.name.includes("flash") && !m.name.includes("pro"));
    const safeModel = flashModels.find(m => m.name.includes("gemini-3")) || 
                      flashModels.find(m => m.name.includes("gemini-2.5")) || 
                      flashModels[0] || availableModels[0];
    
    if (!safeModel) throw new Error("사용 가능한 AI 모델이 없습니다.");

    const targetModelName = safeModel.name.replace('models/', '');
    console.log(`🤖 [AI 연동] ${targetModelName} 모델로 생성 시작...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: targetModelName
    });

    // 💡 수술: 토큰을 1024로 늘리고, 가격/장소 등 데이터 추출의 정확도를 위해 temperature를 살짝 낮춤(0.5)
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.5,
      }
    });
    
    res.json({ text: result.response.text() });

  } catch (error) {
    console.error("🚨 AI 생성 에러:", error.message);
    res.status(500).json({ error: "AI 서버 연동 중 문제 발생", details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') { app.listen(5000, () => console.log(`🚀 서버 실행 중`)); }
module.exports = app;