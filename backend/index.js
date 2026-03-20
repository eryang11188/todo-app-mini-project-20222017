require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 2. MongoDB 연결
// .env에 있는 MONGODB_URI를 사용하여 클라우드 DB에 접속합니다.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 3. Todo 데이터 모델(Schema) 정의
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', todoSchema);

// 4. API 엔드포인트 (CRUD)

// [GET] 모든 할 일 목록 가져오기
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [POST] 새로운 할 일 추가하기
app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({ title: req.body.title });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [PUT] 할 일 상태 수정하기 (완료 여부 체크)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { completed: req.body.completed }, 
      { returnDocument: 'after' } // <-- 경고에서 시킨 대로 수정!
    );
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [DELETE] 할 일 삭제하기
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 루트 경로 테스트용
app.get('/', (req, res) => {
  res.send('Todo App Backend Server is Running! 🚀');
});

// 5. 서버 실행 설정 (Vercel 서버리스 대응)
// 로컬 환경(development)에서만 app.listen이 실행되도록 합니다.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
}

// Vercel이 이 app 객체를 컨트롤할 수 있도록 내보냅니다.
module.exports = app;