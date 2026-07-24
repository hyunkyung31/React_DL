import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      // Django 백엔드 로그인 API 호출
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
<<<<<<< Updated upstream
        password: password 
=======
        password: password
>>>>>>> Stashed changes
      })

      if (response.data.success) {
        // 로그인 성공 시 부모 컴포넌트에 성공 알림 및 사용자 이름 전달
        onLoginSuccess(response.data.name || username)
      }
    } catch (error) {
      console.error('로그인 실패:', error)
      setErrorMessage(
        error.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.'
      )
    }
  }

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