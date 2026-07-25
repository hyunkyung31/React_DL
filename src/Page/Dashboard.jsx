import { useState } from 'react'
import axios from 'axios'
import PatientDetail from './Patient_Detail'
import Main_viewer from '../Components/Main_viewer'

// ==========================================
// 1. PatientManagement 컴포넌트 (유지)
// ==========================================
export function PatientManagement({ patients, errorMessage, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')

  const filteredPatients = patients.filter((patient) => {
    if (!patient) return false
    const name = patient.patient_name || ''
    const id = patient.patient_id || ''

    if (searchCategory === 'name') {
      return name.includes(searchTerm)
    } else if (searchCategory === 'id') {
      return String(id).includes(searchTerm)
    }
    return name.includes(searchTerm) || String(id).includes(searchTerm)
  })

  return (
    <div className="flex-1 p-6 bg-gray-950 text-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 페이지 타이틀 및 검색 바 영역 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">담당 환자 목록 관리</h2>
            <p className="text-xs text-gray-400 mt-1">등록된 환자를 검색하고 임상 상태를 확인하세요.</p>
          </div>
          
          {/* 검색 컨트롤 */}
          <div className="flex items-center space-x-2">
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="name">환자명</option>
              <option value="id">환자 ID</option>
            </select>

            <input 
              type="text" 
              placeholder="검색어를 입력하세요" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {errorMessage && <p className="text-red-400 font-semibold">{errorMessage}</p>}

        {/* 환자 목록 테이블 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-3 font-semibold">환자 ID</th>
                <th className="px-6 py-3 font-semibold">환자명</th>
                <th className="px-6 py-3 font-semibold">나이/성별</th>
                <th className="px-6 py-3 font-semibold">주호소</th>
                <th className="px-6 py-3 font-semibold">ECG 결과</th>
                <th className="px-6 py-3 font-semibold text-center">관리 메뉴</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-300">{patient.patient_id}</td>
                    <td className="px-6 py-4 font-medium text-white">{patient.patient_name}</td>
                    <td className="px-6 py-4 text-gray-300">{patient.age}세 / {patient.gender}</td>
                    <td className="px-6 py-4 text-gray-300">{patient.chief_complaint || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                        {patient.ecg_result || '정상'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onSelectPatient && onSelectPatient(patient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors shadow"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

// ==========================================
// 2. Dashboard 메인 컴포넌트
// ==========================================
export default function Dashboard({ 
  displayName, 
  healthStatus, 
  patients, 
  errorMessage, 
  onLogout 
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // 사이드바 빠른 검색어 상태 및 검색 결과 목록 상태
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // 상세보기 또는 검색 결과 선택 시 처리 함수
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setCurrentMenu('patient-detail')
    setIsSearchDropdownOpen(false) // 검색 결과 창 닫기
    setSidebarSearch('')
  }

  // 사이드바에서 검색 후 엔터 쳤을 때 동작 (전체 환자 부분 검색 API 연동)
  const handleSidebarSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const keyword = sidebarSearch.trim()
      if (!keyword) return

      const access = localStorage.getItem('access')
      if (!access) {
        alert('로그인 토큰이 없습니다. 다시 로그인해 주세요.')
        return
      }

      try {
        // 전체 검색 API 호출 (백엔드 풀 주소 및 Authorization 헤더 추가)
        const response = await fetch(`http://127.0.0.1:8000/api/patients/search/?q=${encodeURIComponent(keyword)}`, {
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('환자 검색에 실패했습니다.')
        }

        const results = await response.json()

        if (results && results.length > 0) {
          if (results.length === 1) {
            handleSelectPatient(results[0])
          } else {
            setSearchResults(results)
            setIsSearchDropdownOpen(true)
          }
        } else {
          alert('전체 환자 중 일치하는 정보가 없습니다.')
          setIsSearchDropdownOpen(false)
        }
      } catch (error) {
        console.error('검색 중 오류 발생:', error)
        
        // API 연동 실패 시 현재 담당 환자 목록 기준 폴백 검색
        const matchedLocal = patients.filter(p => 
          p.patient_name.toLowerCase().includes(keyword.toLowerCase()) || 
          String(p.patient_id).toLowerCase().includes(keyword.toLowerCase())
        )

        if (matchedLocal.length === 1) {
          handleSelectPatient(matchedLocal[0])
        } else if (matchedLocal.length > 1) {
          setSearchResults(matchedLocal)
          setIsSearchDropdownOpen(true)
        } else {
          alert('일치하는 환자가 없습니다.')
          setIsSearchDropdownOpen(false)
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* 상단 헤더 영역 */}
      <header className="flex items-center justify-between px-6 h-14 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-blue-600 text-white font-bold rounded shadow">LOGO</div>
          <h1 className="text-white font-bold text-lg tracking-wide">혈관조영술 AI 진단 시스템</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 hover:text-white cursor-pointer">알림</span>
          <span className="text-sm font-medium text-white">{displayName} (의료진)</span>
          <button 
            onClick={onLogout}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 하단 전체 영역 (사이드바 + 메인 화면) */}
      <div className="flex flex-1 overflow-hidden">

        {/* 사이드바 영역 */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0 relative">
          <div>
            <div className="mb-4 relative">
              <label className="text-xs font-semibold text-gray-400">전체 환자 빠른 검색</label>
              <input 
                type="text" 
                placeholder="이름/ID 일부 입력 후 Enter" 
                value={sidebarSearch}
                onChange={(e) => {
                  setSidebarSearch(e.target.value)
                  if (isSearchDropdownOpen) setIsSearchDropdownOpen(false)
                }}
                onKeyDown={handleSidebarSearchKeyDown}
                className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              {/* 검색 결과가 여러 개일 때 뜨는 드롭다운 리스트 */}
              {isSearchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-400 border-b border-gray-800 flex justify-between items-center">
                    <span>전체 검색 결과 ({searchResults.length}명)</span>
                    <button 
                      onClick={() => setIsSearchDropdownOpen(false)}
                      className="text-gray-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {searchResults.map((patient) => (
                    <div 
                      key={patient.patient_id}
                      onClick={() => handleSelectPatient(patient)}
                      className="p-2.5 hover:bg-gray-800 cursor-pointer border-b border-gray-800/50 last:border-none transition-colors"
                    >
                      <p className="text-sm font-medium text-white">{patient.patient_name}</p>
                      <p className="text-xs text-gray-400">ID: {patient.patient_id} ({patient.age}세/{patient.gender})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <nav className="space-y-1">
              <button 
                onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                대시보드
              </button>
              <button 
                onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                담당 환자 목록 ({patients.length})
              </button>
              <button 
                onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'ai-diag' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                AI 진단
              </button>
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

        {/* 메인 뷰어 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentMenu === 'patient-detail' ? (
            <PatientDetail 
              patient={selectedPatient} 
              onBack={() => setCurrentMenu('patients')} 
            />
          ) : currentMenu === 'patients' ? (
            <PatientManagement 
              patients={patients} 
              errorMessage={errorMessage} 
              onSelectPatient={handleSelectPatient} 
            />
          ) : (
            <main className="flex-1 p-4 overflow-y-auto grid grid-cols-3 gap-4 bg-gray-950">
              <div className="col-span-2 flex flex-col space-y-4">
                <div className="flex-1 min-h-[500px]">
                  <Main_viewer />
                </div>
              </div>

              <div className="flex flex-1 flex-col space-y-4">
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
          )}
        </div>

      </div>
    </div>
  )
}