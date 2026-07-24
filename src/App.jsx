import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState('백엔드 연결 확인 중...')

  useEffect(() => {
    // 로컬 Django 또는 GCP Django 서버의 Health Check API 호출
    axios.get('http://127.0.0.1:8000/api/health/')
      .then(response => {
        setHealthStatus(response.data.message)
      })
      .catch(error => {
        console.error('API 연결 실패:', error)
        setHealthStatus('백엔드 서버에 연결할 수 없습니다.')
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ANGIO CDSS - Frontend</h1>
      <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginTop: '20px' }}>
        <h3>백엔드 서버 상태:</h3>
        <p style={{ fontWeight: 'bold', color: '#2b6cb0' }}>{healthStatus}</p>
      </div>
    </div>
  )
}

export default App