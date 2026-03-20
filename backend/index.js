if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB 연결 성공 (3단계)'));

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  deadline: { type: String, default: "" }, 
  importance: { type: String, default: "보통" },
  type: { type: String, required: true, enum: ['todo', 'market'] },
  // 📝 인적사항 필드 추가됨!
  studentId: { type: String, default: "" },
  sellerName: { type: String, default: "" },
  phone: { type: String, default: "" }
});
const Item = mongoose.model('Item', itemSchema);

app.get('/api/market', async (req, res) => { res.json(await Item.find({ type: 'market' })); });
app.get('/api/todo', async (req, res) => { res.json(await Item.find({ type: 'todo' })); });
app.post('/api/market', async (req, res) => { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); });
app.post('/api/todo', async (req, res) => { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); });
app.put('/api/items/:id', async (req, res) => { const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item); });
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제' }); });

if (process.env.NODE_ENV !== 'production') { app.listen(5000, () => console.log(`🚀 서버 실행 중`)); }
module.exports = app;