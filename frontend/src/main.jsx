import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. BrowserRouter 임포트
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. App 컴포넌트를 BrowserRouter로 감싸줍니다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)