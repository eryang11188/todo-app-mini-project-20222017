// backend/index.js
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// [1] MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// [2] 데이터 스키마
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  type: { type: String, required: true, enum: ['todo', 'market', 'lost'] },
  studentId: String, sellerName: String, phone: String, location: String, description: String,
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

// 학식 메뉴 크롤링
// [3] 학식 크롤링 API 
app.get('/api/food', async (req, res) => {
  try {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date().getDay();
    const todayName = dayNames[today];

    if (today === 0 || today === 6) {
      return res.json([{ place: "주말", menu: "오늘은 주말입니다. 편의점 털러 가시죠! 🍙" }]);
    }

    const foodData = [];

    // 💡 1. 봉림관 스크랩 (campus_001.do)
    try {
      const { data } = await axios.get('https://app.changwon.ac.kr/campus/campus_001.do', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      $('br').replaceWith('\n');
      $('p, div, li').each((_, el) => $(el).append('\n'));

      $('table').each((_, table) => {
        const tableText = $(table).text();
        if (!tableText.includes('MOSS')) return; // 봉림관 표만 타격

        const tableMap = [];
        $(table).find('tr').each((rIdx, tr) => {
          if (!tableMap[rIdx]) tableMap[rIdx] = [];
          let cIdx = 0;
          $(tr).find('th, td').each((_, cell) => {
            while (tableMap[rIdx][cIdx]) { cIdx++; }
            const rowSpan = parseInt($(cell).attr('rowspan')) || 1;
            const colSpan = parseInt($(cell).attr('colspan')) || 1;
            const text = $(cell).text().replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            for (let i = 0; i < rowSpan; i++) {
              for (let j = 0; j < colSpan; j++) {
                if (!tableMap[rIdx + i]) tableMap[rIdx + i] = [];
                tableMap[rIdx + i][cIdx + j] = text;
              }
            }
            cIdx += colSpan;
          });
        });

        let targetCol = -1;
        for (let r = 0; r < Math.min(tableMap.length, 3); r++) {
          for (let c = 0; c < tableMap[r].length; c++) {
            if (tableMap[r][c] && tableMap[r][c].includes(todayName)) { targetCol = c; break; }
          }
          if (targetCol !== -1) break;
        }

        if (targetCol !== -1) {
          let lastFloor = '1층';
          tableMap.forEach(row => {
            const placeTitle = row[0] || '';
            if (placeTitle.includes('MOSS1')) lastFloor = '1층';
            else if (placeTitle.includes('MOSS2')) lastFloor = '2층';

            if (!placeTitle.includes('MOSS')) return;

            const timeInfo = row[1] ? row[1].replace(/\([^)]*\)/g, '').trim() : '';
            if (!timeInfo.includes('식')) return;

            let menuRaw = row[targetCol];
            if (menuRaw && menuRaw.length > 3 && !menuRaw.includes(todayName)) {
              if (menuRaw.includes('운영중지')) foodData.push({ place: `봉림관 ${lastFloor} - ${timeInfo}`, menu: "운영중지" });
              else foodData.push({ place: `봉림관 ${lastFloor} - ${timeInfo}`, menu: menuRaw });
            }
          });
        }
      });
    } catch (e) { console.error("봉림관 에러:", e.message); }

    // 💡 2. 사림관 스크랩 (마법의 열쇠: ?gubun=S) - 형님이 찾은 단서!
    try {
      const { data: sarimData } = await axios.get('https://app.changwon.ac.kr/campus/campus_001.do?gubun=S', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $s = cheerio.load(sarimData);
      $s('br').replaceWith('\n');
      $s('p, div, li').each((_, el) => $s(el).append('\n'));

      const sarimTables = [];
      $s('table').each((_, tbl) => {
        const headText = $s(tbl).find('th').text();
        if (headText.includes('구분') && headText.includes('메뉴')) {
          sarimTables.push(tbl);
        }
      });

      if (sarimTables.length > 0) {
        // 사림관은 요일별로 표가 5개 있으니, 오늘 요일(1~5)에 맞는 표를 픽업
        let targetTable = sarimTables[0];
        if (sarimTables.length >= 5 && today >= 1 && today <= 5) targetTable = sarimTables[today - 1];

        $s(targetTable).find('tr').each((_, tr) => {
          const cells = $s(tr).find('td, th');
          if (cells.length >= 2) {
            const typeRaw = $s(cells[0]).text().replace(/\([^)]*\)/g, '').trim();
            if (typeRaw.includes('구분') || typeRaw === '') return;

            const menuRaw = $s(cells[1]).text().replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            if (menuRaw && menuRaw.length > 2) {
              foodData.push({ place: `사림관 - ${typeRaw}`, menu: menuRaw });
            }
          }
        });
      }
    } catch (e) { console.error("사림관 에러:", e.message); }

    // 💡 3. 데이터 클리닝 (알레르기 제거 및 가독성 최적화)
    const cleanedData = foodData.map(item => {
      let cleanMenu = item.menu.split('\n')
        .map(line => line.replace(/\([\d.,\s]+\)/g, '').trim())
        .filter(line => line.length > 0 && !line.includes('알레르기') && !line.includes('원산지') && !line.includes('식단이 없습니다') && !line.includes('식자재수급'))
        .join('\n');
        
      // 봉림관 줄바꿈 처리 보강
      if (!cleanMenu.includes('\n') && cleanMenu !== "운영중지") {
        cleanMenu = cleanMenu.replace(/([가-힣]{2,}(국|찌개|카레|볶음|구이|김치|전|까스|스프|핫도그|소떡|면|밥|닭|육|라|김))/g, '$1\n').trim();
      }
      return { place: item.place, menu: cleanMenu };
    }).filter(item => item.menu.length > 2);

    const unique = cleanedData.filter((v, i, a) => a.findIndex(t => t.menu === v.menu && t.place === v.place) === i);
    res.json(unique.length > 0 ? unique : [{ place: "안내", menu: "오늘의 식단 정보가 없습니다." }]);

  } catch (error) {
    console.error("Crawling Error:", error);
    res.status(500).json({ error: "서버 에러" });
  }
});

// [4] 나머지 API들
app.get('/api/market', async (req, res) => res.json(await Item.find({ type: 'market' })));
app.get('/api/todo', async (req, res) => res.json(await Item.find({ type: 'todo' })));
app.get('/api/lost', async (req, res) => res.json(await Item.find({ type: 'lost' })));
app.post('/api/market', async (req, res) => { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); });
app.post('/api/todo', async (req, res) => { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); });
app.post('/api/lost', async (req, res) => { const newItem = new Item({ ...req.body, type: 'lost' }); await newItem.save(); res.json(newItem); });
app.patch('/api/items/:id/like', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: req.body.value || 1 } }, { returnDocument: 'after' })));
app.put('/api/items/:id', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })));
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제 완료' }); });
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKeys = (process.env.GEMINI_API_KEY || "").split(',').map(k => k.trim());
    const genAI = new GoogleGenerativeAI(apiKeys[0]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error) { res.status(500).json({ error: "AI 에러" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));