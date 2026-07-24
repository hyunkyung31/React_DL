import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. 백엔드 JWT 토큰 발급 엔드포인트 호출
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password,
      })

      // 2. 토큰 및 사용자 정보 로컬 스토리지 저장
      const { access, refresh, name } = response.data
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      
      const doctorName = name || username || '의사'
      localStorage.setItem('doctor_name', doctorName)

      // 3. App 컴포넌트로 로그인 성공 전달
      onLoginSuccess(doctorName)
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
        
        {/* 타이틀 영역 */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 bg-blue-600 text-white font-bold rounded shadow mb-2">
            LOGO
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            혈관조영술 AI 진단 시스템
          </h1>
          <p className="text-xs text-gray-400">
            의료진 계정으로 로그인하여 주십시오.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              아이디 (Username)
            </label>
            <input 
              type="text" 
              required
              placeholder="아이디를 입력하세요" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              비밀번호 (Password)
            </label>
            <input 
              type="password" 
              required
              placeholder="비밀번호를 입력하세요" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-800">
          Secure Medical AI Platform &copy; 2026
        </div>
      </div>
    </div>
  )
}