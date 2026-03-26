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

// [3] 학식 크롤링 API (🔥 생활관 요일 매칭 버그 + 주말 셧다운 버그 동시 해결본)
app.get('/api/food', async (req, res) => {
  try {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kst = new Date(utc + (9 * 60 * 60 * 1000));
    
    const today = kst.getDay(); // 0(일) ~ 6(토)
    const isWeekend = today === 0 || today === 6; // 주말 판별기

    const foodData = [];

    // 💡 1. 봉림관 (평일만 가동)
    if (!isWeekend) {
      try {
        const { data } = await axios.get('https://app.changwon.ac.kr/campus/campus_001.do', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        $('br').replaceWith('\n');
        $('p, div, li').each((_, el) => $(el).append('\n'));

        const bongrimTables = [];
        $('table').each((_, table) => {
          if ($(table).text().includes('MOSS')) bongrimTables.push(table);
        });

        if (bongrimTables.length > 0) {
          let targetIdx = today - 1;
          if (targetIdx >= bongrimTables.length) targetIdx = bongrimTables.length - 1;
          let targetTable = bongrimTables[targetIdx];

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
              foodData.push({ place: `봉림관 ${floor} - ${timeInfo}`, menu: menuRaw.includes('운영중지') ? "운영중지" : menuRaw });
            }
          });
        }
      } catch (e) { console.error("봉림관 에러:", e.message); }
    }

    // 💡 2. 사림관 (평일만 가동)
    if (!isWeekend) {
      try {
        const { data: sarimData } = await axios.get('https://app.changwon.ac.kr/campus/campus_001.do?gubun=S', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $s = cheerio.load(sarimData);
        $s('br').replaceWith('\n');
        $s('p, div, li').each((_, el) => $s(el).append('\n'));

        const sarimTables = [];
        $s('table').each((_, tbl) => {
          const headText = $s(tbl).find('th').text();
          if (headText.includes('구분') && headText.includes('메뉴')) sarimTables.push(tbl);
        });

        if (sarimTables.length > 0) {
          let targetIdx = today - 1;
          if (targetIdx >= sarimTables.length) targetIdx = sarimTables.length - 1;
          let targetTable = sarimTables[targetIdx];
          
          $s(targetTable).find('tr').each((_, tr) => {
            const cells = $s(tr).find('td, th');
            if (cells.length >= 2) {
              const typeRaw = $s(cells[0]).text().replace(/\([^)]*\)/g, '').trim();
              if (typeRaw.includes('구분') || typeRaw === '') return;
              const menuRaw = $s(cells[1]).text().replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
              if (menuRaw && menuRaw.length > 2) foodData.push({ place: `사림관 - ${typeRaw}`, menu: menuRaw });
            }
          });
        }
      } catch (e) { console.error("사림관 에러:", e.message); }
    }

    // 💡 3. 생활관 (주말 포함 365일 풀가동!)
    try {
      const { data: dormData } = await axios.get('https://app.changwon.ac.kr/campus/campus_001_dorm.do', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $d = cheerio.load(dormData);
      $d('br').replaceWith('\n');
      $d('p, div, li').each((_, el) => $d(el).append('\n'));

      const dormTables = [];
      $d('table').each((_, tbl) => {
        const text = $d(tbl).text();
        // ⭐ 핵심: 껍데기 탭(월,화,수) 테이블은 거르고, 조식/중식/석식이 적힌 진짜 메뉴판 테이블만 줍기!
        if (text.includes('조식') || text.includes('중식') || text.includes('석식')) {
          dormTables.push(tbl);
        }
      });

      if (dormTables.length > 0) {
        // 월=0, 화=1, 수=2, 목=3, 금=4, 토=5, 일=6 인덱스 매핑 완벽 적용
        let targetIdx = today === 0 ? 6 : today - 1;
        if (targetIdx >= dormTables.length) targetIdx = dormTables.length - 1;
        
        let targetTable = dormTables[targetIdx];

        const tableMap = [];
        $d(targetTable).find('tr').each((rIdx, tr) => {
          if (!tableMap[rIdx]) tableMap[rIdx] = [];
          let cIdx = 0;
          $d(tr).find('th, td').each((_, cell) => {
            while (tableMap[rIdx][cIdx]) { cIdx++; }
            const text = $d(cell).text().trim();
            tableMap[rIdx][cIdx] = text;
            cIdx++;
          });
        });

        for (let r = 0; r < tableMap.length; r++) {
          const row = tableMap[r];
          if (!row || row.length === 0) continue;
          const cellText = row[0] || '';
          if (cellText.includes('조식') || cellText.includes('중식') || cellText.includes('석식')) {
            const typeRaw = cellText.split('\n')[0].replace(/\([^)]*\)/g, '').trim();
            if (r + 1 < tableMap.length) {
              const menuRaw = tableMap[r + 1][0] || '';
              if (menuRaw.length > 2) {
                foodData.push({ place: `생활관 - ${typeRaw}`, menu: menuRaw });
              }
            }
          }
        }
      }
    } catch (e) { console.error("생활관 에러:", e.message); }

    // 데이터가 텅 비었을 경우 (예: 주말에 생활관마저 닫았을 때)
    if (foodData.length === 0) {
      if (isWeekend) {
        return res.json([{ place: "주말", menu: "오늘은 주말입니다. 편의점 털러 가시죠! 🍙" }]);
      }
      return res.json([{ place: "안내", menu: "오늘의 식단 정보가 없습니다." }]);
    }

    // 💡 4. 데이터 클리닝
    const cleanedData = foodData.map(item => {
      let cleanMenu = item.menu
        .replace(/([가-힣a-zA-Z])\s*(\([\d.,\s]+\))/g, '$1\n$2') 
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
    res.json(unique);

  } catch (error) {
    console.error("Crawling Error:", error);
    res.status(500).json({ error: "서버 에러" });
  }
});

// [3-2] 🚌 셔틀버스 크롤링 API 
app.get('/api/shuttle', async (req, res) => {
  try {
    const { data } = await axios.get('https://app.changwon.ac.kr/campus/campus_002.do', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    $('br').replaceWith('\n');
    
    const tableMap = [];
    $('table').first().find('tr').each((rIdx, tr) => {
      if (!tableMap[rIdx]) tableMap[rIdx] = [];
      let cIdx = 0;
      $(tr).find('th, td').each((_, cell) => {
        while (tableMap[rIdx][cIdx]) { cIdx++; }
        const rowSpan = parseInt($(cell).attr('rowspan')) || 1;
        const colSpan = parseInt($(cell).attr('colspan')) || 1;
        const text = $(cell).text().trim();
        for (let i = 0; i < rowSpan; i++) {
          for (let j = 0; j < colSpan; j++) {
            if (!tableMap[rIdx + i]) tableMap[rIdx + i] = [];
            tableMap[rIdx + i][cIdx + j] = text;
          }
        }
        cIdx += colSpan;
      });
    });

    const shuttleData = [];
    tableMap.forEach((row, idx) => {
      if (idx === 0) return; // 첫 번째 줄(헤더) 패스
      if (row.length >= 4) {
        shuttleData.push({
          route: row[0].replace(/\n/g, ' ').trim(),
          buses: row[1].trim(),
          fare: row[2].replace(/\n/g, ' ').trim(),
          schedule: row[3].trim()
        });
      }
    });

    const uniqueShuttles = shuttleData.filter((v, i, a) => a.findIndex(t => t.route === v.route) === i);
    res.json(uniqueShuttles);

  } catch (error) {
    console.error("Shuttle Crawling Error:", error);
    res.status(500).json({ error: "셔틀버스 서버 에러" });
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