import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // 로그인 상태 관리 (true면 대시보드, false면 로그인 화면)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // 로그인 입력 폼 및 유저 정보 상태
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('홍길동')
  const [errorMessage, setErrorMessage] = useState('')

  // 백엔드 연결 상태 체크
  const [healthStatus, setHealthStatus] = useState('백엔드 연결 확인 중...')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/health/')
      .then(response => {
        setHealthStatus(response.data.message)
      })
      .catch(error => {
        console.error('API 연결 실패:', error)
        setHealthStatus('백엔드 서버에 연결할 수 없습니다.')
      })
  }, [])

  // 로그인 요청 함수 (DB 연동)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
        password: password
      })

      if (response.data.success) {
        setDisplayName(response.data.name || username) // DB에 저장된 이름 또는 아이디 반영
        setIsLoggedIn(true) // 로그인 성공 시 대시보드로 전환
      }
    } catch (error: any) {
      console.error('로그인 실패:', error)
      setErrorMessage(
        error.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.'
      )
    }
  }

  // 1. 로그인 전: 로그인 화면
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
          <div className="text-center">
            <div className="inline-block px-3 py-1 mb-2 bg-blue-600 text-white font-bold rounded shadow text-sm">LOGO</div>
            <h2 className="text-xl font-bold text-white">혈관조영술 AI 진단 시스템</h2>
            <p className="text-xs text-gray-400 mt-1">의료진 계정으로 로그인해 주세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">아이디</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요" 
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {errorMessage && (
              <div className="text-xs text-red-400 text-center font-medium">{errorMessage}</div>
            )}

            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-sm transition-colors shadow"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 2. 로그인 후: 대시보드 화면
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* 1. 상단 헤더 영역 */}
      <header className="flex items-center justify-between px-6 h-14 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-blue-600 text-white font-bold rounded shadow">LOGO</div>
          <h1 className="text-white font-bold text-lg tracking-wide">혈관조영술 AI 진단 시스템</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 hover:text-white cursor-pointer">알림</span>
          <span className="text-sm font-medium text-white">{displayName} (의료진)</span>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 하단 전체 영역 (사이드바 + 메인 화면) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2 & 7. 사이드바 영역 */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0">
          <div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400">환자 선택</label>
              <input 
                type="text" 
                placeholder="환자명 또는 ID 검색" 
                className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <nav className="space-y-1">
              <a href="#dashboard" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">대시보드</a>
              <a href="#patients" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">환자 목록</a>
              <a href="#ai-diag" className="block px-3 py-2 rounded text-sm bg-blue-600 text-white font-medium">AI 진단</a>
              <a href="#analysis" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">재생 / 분석</a>
              <a href="#bookmark" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">북마크</a>
              <a href="#report" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">보고서</a>
              <a href="#settings" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">설정</a>
            </nav>
          </div>
          <div className="text-xs text-gray-500">
            {healthStatus}
          </div>
        </aside>

        {/* 3, 4, 5, 6, 8. 메인 뷰어 및 패널 영역 */}
        <main className="flex-1 p-4 overflow-y-auto grid grid-cols-3 gap-4 bg-gray-950">
          
          {/* 좌측 메인 뷰어 & 재생 컨트롤 (2칸 차지) */}
          <div className="col-span-2 flex flex-col space-y-4">
            <div className="flex-1 bg-black rounded-lg border border-gray-800 flex items-center justify-center text-gray-400 min-h-[400px]">
              [ 3. Main Viewer 영역 ]
            </div>
            <div className="h-20 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center text-gray-300 shrink-0">
              [ 6. 재생 컨트롤 / 타임라인 ]
            </div>
          </div>

          {/* 우측 AI 결과 및 다운로드 패널 (1칸 차지) */}
          <div className="flex flex-col space-y-4">
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="font-semibold text-sm text-white mb-2">[ 4. AI 결과 패널 ]</h2>
              <div className="text-xs text-gray-300">진단 요약 및 신뢰도 표시 영역</div>
            </div>
            <div className="h-32 bg-gray-900 rounded-lg border border-gray-800 p-4 shrink-0">
              <h2 className="font-semibold text-sm text-white mb-2">[ 5. 히트맵 / 박스 오버레이 ]</h2>
            </div>
            <div className="h-20 bg-gray-900 rounded-lg border border-gray-800 p-4 shrink-0">
              <h2 className="font-semibold text-sm text-white mb-2">[ 8. 다운로드 / 리포트 ]</h2>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}

export default App;