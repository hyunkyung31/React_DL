import { useState } from 'react'
import './App.css'
import Login from './Page/Login'

function App() {
  const [user, setUser] = useState(null)

  const handleLoginSuccess = (username) => {
    setUser(username)
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div>
      <h1>대시보드</h1>
      <p>{user}님 환영합니다.</p>
    </div>
  )
}

export default App