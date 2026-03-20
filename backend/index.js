// 1. 환경 변수 설정 (Vercel 환경 고려)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 2. MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공 (Market v5)'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 3. Todo 데이터 모델(Schema) 정의 - deadline 필드 추가
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  deadline: { type: String, default: "" } // 마감일 저장용 필드
});
const Todo = mongoose.model('Todo', todoSchema);

// 4. API 엔드포인트 (CRUD)

// [GET] 목록 가져오기
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [POST] 새로운 물품 추가 - deadline 필드 반영
app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({ 
      title: req.body.title,
      deadline: req.body.deadline // 프론트엔드에서 보낸 날짜 데이터
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [PUT] 상태 수정 (완료 여부 체크)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { completed: req.body.completed }, 
      { returnDocument: 'after' } 
    );
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [DELETE] 삭제하기
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 루트 경로 테스트
app.get('/', (req, res) => {
  res.send('CWNU Market Backend is Running! 🚀');
});

// 5. 서버 실행 설정 (Vercel 서버리스 대응)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
}

// Vercel용 export
module.exports = app;