import { useState } from 'react'
import PatientManagement from './Patient_Management'
import PatientDetail from './Patient_Detail'

export default function Dashboard({ 
  displayName, 
  healthStatus, 
  patients, 
  errorMessage, 
  onLogout 
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // 사이드바 빠른 검색어 상태
  const [sidebarSearch, setSidebarSearch] = useState('')

  // 상세보기 또는 검색 결과 선택 시 처리 함수
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setCurrentMenu('patient-detail')
  }

  // 사이드바에서 검색 후 엔터 쳤을 때 동작
  const handleSidebarSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const keyword = sidebarSearch.trim().toLowerCase()
      if (!keyword) return

      // 환자명이나 ID가 일치하는 첫 번째 환자 찾기
      const found = patients.find(p => 
        p.patient_name.toLowerCase().includes(keyword) || 
        String(p.patient_id).toLowerCase().includes(keyword)
      )

      if (found) {
        handleSelectPatient(found)
        setSidebarSearch('') // 검색창 초기화
      } else {
        alert('일치하는 환자가 없습니다.')
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
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0">
          <div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400">환자 빠른 검색</label>
              <input 
                type="text" 
                placeholder="환자명 또는 ID 입력 후 Enter" 
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                onKeyDown={handleSidebarSearchKeyDown}
                className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <nav className="space-y-1">
              <button 
                onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                대시보드
              </button>
              <button 
                onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                환자 목록 ({patients.length})
              </button>
              <button 
                onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); }}
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
                <div className="flex-1 bg-black rounded-lg border border-gray-800 flex items-center justify-center text-gray-400 min-h-[400px]">
                  [ 3. Main Viewer 영역 ]
                </div>
                <div className="h-20 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center text-gray-300 shrink-0">
                  [ 6. 재생 컨트롤 / 타임라인 ]
                </div>
              </div>

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
          )}
        </div>

      </div>
    </div>
  )
}
