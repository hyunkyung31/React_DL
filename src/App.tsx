import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Intro from './Page/Intro'
import Login from './Page/Login'
import Dashboard from './Page/Dashboard'

const API_BASE = 'http://34.80.83.7:8000'

interface Patient {
  patient_id: string
  patient_name: string
  gender: string
  age: number
  primary_doctor_id: string
  chief_complaint: string
  ecg_result: string
}

interface BookmarkItem {
  id: number
  title: string
  patientId?: string
  note?: string
}

function App() {
  // 로그인된 사용자 상태
  const [user, setUser] = useState<string | null>(() => {
    const access = localStorage.getItem('access')
    return access ? localStorage.getItem('doctor_name') || '의사' : null
  })

  // 화면 단계 관리: 'intro' | 'login'
  const [step, setStep] = useState<'intro' | 'login'>('intro')
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [healthStatus, setHealthStatus] = useState<string>('백엔드 연결 확인 중...')

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('app_bookmarks')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('app_bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const handleAddBookmark = (item: Omit<BookmarkItem, 'id'>) => {
    const newItem: BookmarkItem = { id: Date.now(), ...item }
    setBookmarks(prev => [...prev, newItem])
  }

  const handleDeleteBookmark = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/health/`)
      .then(response => {
        setHealthStatus(response.data.message || 'ANGIO CDSS 백엔드 서버가 정상 작동 중입니다.')
      })
      .catch(error => {
        console.error('API 연결 실패:', error)
        setHealthStatus('백엔드 서버에 연결할 수 없습니다.')
      })
  }, [])

  useEffect(() => {
    if (!user) return

    const access = localStorage.getItem('access')
    if (!access) return

    axios
      .get(`${API_BASE}/api/patients/`, {
        headers: { Authorization: `Bearer ${access}` },
      })
      .then((res) => {
        const patientData = Array.isArray(res.data) ? res.data : (res.data.results || [])
        setPatients(patientData)
        setErrorMessage('')
      })
      .catch((err) => {
        console.error(err)
        setErrorMessage('환자 목록을 불러오지 못했습니다.')
      })
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('doctor_name')
    setUser(null)
    setPatients([])
    setStep('intro')
  }

  // 3단계 흐름 렌더링 분기
  if (!user) {
    if (step === 'intro') {
      return (
        <Intro 
          healthStatus={healthStatus} 
          onStartLogin={() => setStep('login')} 
        />
      )
    }
    return (
      <Login 
        onLoginSuccess={(doctorName) => setUser(doctorName)} 
        onBackToIntro={() => setStep('intro')} 
      />
    )
  }

  return (
    <Dashboard 
      displayName={user} 
      healthStatus={healthStatus} 
      patients={patients}
      errorMessage={errorMessage}
      onLogout={handleLogout} 
      bookmarks={bookmarks}
      onAddBookmark={handleAddBookmark}
      onDeleteBookmark={handleDeleteBookmark}
    />
  )
}

export default App