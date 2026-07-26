import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://35.234.39.234:8000'

export default function Login({ onLoginSuccess, onBackToIntro }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/api/login/`, {
        username,
        password,
      })

      const { access, refresh, doctor_name } = response.data
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      
      const doctorName = doctor_name || username || '의사'
      localStorage.setItem('doctor_name', doctorName)

      onLoginSuccess(doctorName)
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#020409] text-gray-100 p-6 select-none font-sans">
      <div className="w-full max-w-md bg-[#070b16] border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.3)] p-8 lg:p-10 relative overflow-hidden">
        
        {/* 배경 광채 효과 */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/30 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <button 
            onClick={onBackToIntro}
            className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>돌아가기</span>
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full shadow">
            LOGIN
          </span>
        </div>

        <div className="space-y-2 mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">의료진 인증</h2>
          <p className="text-xs text-gray-400">계정 정보를 입력하여 시스템에 접속하세요.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-400 text-center font-medium relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
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
              className="w-full px-4 py-3 bg-[#030612] border border-blue-900/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
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
              className="w-full px-4 py-3 bg-[#030612] border border-blue-900/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer"
          >
            {loading ? '로그인 중...' : '접속하기'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-6 mt-6 border-t border-gray-800/80 relative z-10">
          Secure Medical AI Platform &copy; 2026
        </div>

      </div>
    </div>
  )
}