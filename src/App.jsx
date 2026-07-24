import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Login from './Page/Login'

function App() {
  const [user, setUser] = useState(() => {
    const access = localStorage.getItem('access')
    return access ? localStorage.getItem('doctor_name') || '의사' : null
  })
  const [patients, setPatients] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const handleLoginSuccess = (name) => {
    localStorage.setItem('doctor_name', name)
    setUser(name)
  }

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('doctor_name')
    setUser(null)
    setPatients([])
  }

  useEffect(() => {
    if (!user) return

    const access = localStorage.getItem('access')
    if (!access) return

    axios
      .get('http://127.0.0.1:8000/api/patients/', {
        headers: { Authorization: `Bearer ${access}` },
      })
      .then((res) => {
        setPatients(res.data.results || [])
        setErrorMessage('')
      })
      .catch((err) => {
        console.error(err)
        setErrorMessage('환자 목록을 불러오지 못했습니다.')
      })
  }, [user])

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>대시보드</h1>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
      <p>{user}님 환영합니다.</p>

      <h2>환자 목록 ({patients.length})</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>환자ID</th>
            <th>이름</th>
            <th>성별</th>
            <th>나이</th>
            <th>담당의</th>
            <th>주호소</th>
            <th>ECG</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.patient_id}>
              <td>{p.patient_id}</td>
              <td>{p.patient_name}</td>
              <td>{p.gender}</td>
              <td>{p.age}</td>
              <td>{p.primary_doctor_id}</td>
              <td>{p.chief_complaint}</td>
              <td>{p.ecg_result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App