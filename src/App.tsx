import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Login from './Page/Login'
import Dashboard from './Page/Dashboard'
import BookmarkView from './Components/BoomarkView' 

const API_BASE = 'http://35.234.39.234:8000'

// 환자 데이터 타입 정의 (TypeScript 인터페이스)
interface Patient {
  patient_id: string
  patient_name: string
  gender: string
  age: number
  primary_doctor_id: string
  chief_complaint: string
  ecg_result: string
}

// 북마크 데이터 타입 정의
interface BookmarkItem {
  id: number
  title: string
  patientId?: string
  note?: string
}

function App() {
  // 📌 화면 단계를 관리하는 상태: 'splash'(초기 메인 화면) | 'login'(로그인 화면) | 'dashboard'(대시보드 화면)
  const [step, setStep] = useState<'splash' | 'login' | 'dashboard'>(() => {
    const access = localStorage.getItem('access')
    return access ? 'dashboard' : 'splash'
  })

  // 로그인 상태 및 사용자 이름 초기화 (localStorage 연동)
  const [user, setUser] = useState<string | null>(() => {
    const access = localStorage.getItem('access')
    return access ? localStorage.getItem('doctor_name') || '의사' : null
  })
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [healthStatus, setHealthStatus] = useState<string>('백엔드 연결 확인 중...')

  // 📌 북마크 상태 관리 (localStorage에서 초기값 로드)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('app_bookmarks')
    return saved ? JSON.parse(saved) : []
  })

  // 북마크 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('app_bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  // 북마크 추가 핸들러
  const handleAddBookmark = (item: Omit<BookmarkItem, 'id'>) => {
    const newItem: BookmarkItem = {
      id: Date.now(),
      ...item
    }
    setBookmarks(prev => [...prev, newItem])
  }

  // 북마크 삭제 핸들러
  const handleDeleteBookmark = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  // 백엔드 헬스 체크 API 연결
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/health/`)
      .then(response => {
        setHealthStatus(response.data.message || '정상 연결됨')
      })
      .catch(error => {
        console.error('API 연결 실패:', error)
        setHealthStatus('백엔드 서버에 연결할 수 없습니다.')
      })
  }, [])

  // 로그인 성공 시 처리
  const handleLoginSuccess = (name: string) => {
    const doctorName = name || '의사'
    localStorage.setItem('doctor_name', doctorName)
    setUser(doctorName)
    setStep('dashboard')
  }

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('doctor_name')
    setUser(null)
    setPatients([])
    setStep('login') // 로그아웃 시 로그인 화면으로 이동
  }

  // 로그인 상태일 때 환자 목록 불러오기
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

  // ==========================================
  // 화면 단계(step)별 렌더링 분기
  // ==========================================

  // 1단계: 기깔나게 꾸민 초기 인트로 메인 화면
  if (step === 'splash') {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-100 p-6 select-none overflow-hidden">
        {/* 배경에 깔리는 은은한 앰비언트 블루 글로우 효과 */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative max-w-lg w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-10 shadow-2xl text-center space-y-8 z-10">
          
          {/* 상단 로고 뱃지 */}
          <div className="flex justify-center">
            <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl text-base shadow-lg shadow-blue-500/25 tracking-wider">
              LOGO
            </div>
          </div>

          {/* 타이틀 및 서브타이틀 */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              혈관조영술 <span className="text-blue-500">AI 진단 시스템</span>
            </h1>
            <p className="text-xs font-mono text-blue-400 tracking-widest uppercase">
              ANGIO CDSS Clinical Decision Support System
            </p>
          </div>

          {/* 안내 문구 */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              의료진을 위한 실시간 혈관조영술 AI 분석 및 정밀 진단 지원 플랫폼입니다. 안전하고 신속한 협진을 시작하세요.
            </p>
          </div>

          {/* 로그인 화면 이동 버튼 */}
          <button 
            onClick={() => setStep('login')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            시스템 로그인하기
          </button>
        </div>

        {/* 하단 버전 정보 */}
        <div className="absolute bottom-6 text-xs text-gray-600 font-mono">
          ANGIO CDSS v1.0 • Secure Medical Gateway
        </div>
      </div>
    )
  }

  // 2단계: 로그인 화면
  if (step === 'login' || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // 3단계: 대시보드 화면
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
  );
}

export default App;