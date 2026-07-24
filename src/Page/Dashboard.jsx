import { useState } from 'react'
import PatientManagement from './Patient_Management'

export default function Dashboard({ 
  displayName, 
  healthStatus, 
  patients, 
  errorMessage, 
  onLogout 
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')

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
              <label className="text-xs font-semibold text-gray-400">환자 선택</label>
              <input 
                type="text" 
                placeholder="환자명 또는 ID 검색" 
                className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <nav className="space-y-1">
              <button 
                onClick={() => setCurrentMenu('dashboard')}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                대시보드
              </button>
              <button 
                onClick={() => setCurrentMenu('patients')}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'patients' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                환자 목록 ({patients.length})
              </button>
              <button 
                onClick={() => setCurrentMenu('ai-diag')}
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

        {/* 메인 뷰어 영역 (메뉴 선택에 따라 화면 변경) */}
        {currentMenu === 'patients' ? (
          <PatientManagement patients={patients} errorMessage={errorMessage} />
        ) : (
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
        )}

      </div>
    </div>
  )
}