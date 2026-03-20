// backend/index.js 내의 스키마 부분 수정
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  deadline: { type: String, default: "" } // 마감일 필드 추가!
});

// ... POST 부분 수정
app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({ 
      title: req.body.title,
      deadline: req.body.deadline // 프론트에서 보낸 날짜 저장
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ... PUT 부분은 그대로 두거나 필요한 필드를 추가하면 됩니다.