import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Login from './Page/Login'
import Dashboard from './Page/Dashboard'

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

function App() {
  // 로그인 상태 및 사용자 이름 초기화 (localStorage 연동)
  const [user, setUser] = useState<string | null>(() => {
    const access = localStorage.getItem('access')
    return access ? localStorage.getItem('doctor_name') || '의사' : null
  })
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [healthStatus, setHealthStatus] = useState<string>('백엔드 연결 확인 중...')

  // 백엔드 헬스 체크 API 연결
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/health/`)
      .then(response => {
        setHealthStatus(response.data.message)
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
  }

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('doctor_name')
    setUser(null)
    setPatients([])
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
        // Django DRF 페이징 처리에 따라 res.data.results 또는 res.data 대응
        const patientData = Array.isArray(res.data) ? res.data : (res.data.results || [])
        setPatients(patientData)
        setErrorMessage('')
      })
      .catch((err) => {
        console.error(err)
        setErrorMessage('환자 목록을 불러오지 못했습니다.')
      })
  }, [user])

  // 로그인하지 않은 경우 로그인 화면 출력
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // 로그인된 경우 Dashboard 컴포넌트에 필요한 데이터 전달
  return (
    <Dashboard 
      displayName={user} 
      healthStatus={healthStatus} 
      patients={patients}
      errorMessage={errorMessage}
      onLogout={handleLogout} 
    />
  )
}

export default App