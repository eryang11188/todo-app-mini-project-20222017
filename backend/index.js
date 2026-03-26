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

// ⭐ [1] MongoDB 연결 (Vercel Serverless 맞춤형)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  if (!process.env.MONGODB_URI) {
    console.error('🚨 에러: MONGODB_URI 환경변수가 없습니다!');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB 연결 성공 (서버리스 최적화)');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
  }
};

// 모든 API 요청이 들어오기 전에 무조건 DB 연결 상태를 확인하고 살려냅니다!
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

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

// [3] 학식 크롤링 API (🔥 알레르기 강제 분리 + 융통성 있는 요일 파싱 적용본)
app.get('/api/food', async (req, res) => {
  try {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kst = new Date(utc + (9 * 60 * 60 * 1000));
    
    const today = kst.getDay(); // 0(일) ~ 6(토)

    if (today === 0 || today === 6) {
      return res.json([{ place: "주말", menu: "오늘은 주말입니다. 편의점 털러 가시죠! 🍙" }]);
    }

    const foodData = [];

    // 💡 1. 봉림관 스크랩
    try {
      const { data } = await axios.get('https://app.changwon.ac.kr/campus/campus_001.do', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      $('br').replaceWith('\n');
      $('p, div, li').each((_, el) => $(el).append('\n'));

      const bongrimTables = [];
      $('table').each((_, table) => {
        if ($(table).text().includes('MOSS')) {
          bongrimTables.push(table);
        }
      });

      if (bongrimTables.length > 0) {
        let targetTable = bongrimTables[0];
        
        if (today >= 1 && today <= 5) {
          let targetIdx = today - 1;
          if (targetIdx >= bongrimTables.length) {
            targetIdx = bongrimTables.length - 1;
          }
          targetTable = bongrimTables[targetIdx];
        }

        const tableMap = [];
        $(targetTable).find('tr').each((rIdx, tr) => {
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

        tableMap.forEach(row => {
          if (row.length < 3) return;
          const placeTitle = row[0] || '';
          if (!placeTitle.includes('MOSS')) return;

          const floor = placeTitle.includes('MOSS1') ? '1층' : '2층';

          let timeInfo = row[1] || '';
          timeInfo = timeInfo.split('\n')[0].replace(/\([^)]*\)/g, '').trim(); 
          if (!timeInfo.includes('식')) return; 

          let menuRaw = row[2] || '';

          if (menuRaw && menuRaw.length > 2) {
            if (menuRaw.includes('운영중지')) {
              foodData.push({ place: `봉림관 ${floor} - ${timeInfo}`, menu: "운영중지" });
            } else {
              foodData.push({ place: `봉림관 ${floor} - ${timeInfo}`, menu: menuRaw });
            }
          }
        });
      }
    } catch (e) { console.error("봉림관 에러:", e.message); }

    // 💡 2. 사림관 스크랩
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
        let targetTable = sarimTables[0];
        if (sarimTables.length >= 5 && today >= 1 && today <= 5) {
          targetTable = sarimTables[today - 1]; 
        }

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

    // 💡 3. 데이터 클리닝
    const cleanedData = foodData.map(item => {
      let cleanMenu = item.menu
        .replace(/([^\n])(\([\d.,\s]+\))/g, '$1\n$2')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.includes('알레르기') && !line.includes('원산지') && !line.includes('식단이 없습니다') && !line.includes('식자재수급'))
        .join('\n');
        
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

// AI 생성 API
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

// 로컬 환경에서만 포트 오픈 (Vercel에서는 실행 안 됨)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 로컬 서버 실행 중: http://localhost:${PORT}`));
}

// ⭐ Vercel 환경을 위해 무조건 모듈로 내보내기!
module.exports = app;