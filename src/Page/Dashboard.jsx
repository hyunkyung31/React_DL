import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import PatientDetail from './Patient_Detail'
import Main_viewer from '../Components/Main_viewer'
import ConsultationView from '../Components/Consultation_View'
import BookmarkView from '../Components/BoomarkView' 
import { 
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, 
  Trash2, Plus, Volume2, Download, FileText, Image as ImageIcon, Bookmark,
  ZoomIn, ZoomOut, Maximize2, Stethoscope, LayoutDashboard, Users, Cpu, 
  Video, FileBarChart, Settings, Square 
} from 'lucide-react'
import angioImage from '../assets/angio_sample.png'

// ==========================================
// 1. PatientManagement 컴포넌트
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">담당 환자 목록 관리</h2>
            <p className="text-xs text-gray-400 mt-1">등록된 환자를 검색하고 임상 상태를 확인하세요.</p>
          </div>
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
  onLogout,
  bookmarks = [],        
  onAddBookmark,     
  onDeleteBookmark   
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // 영상 재생 및 뷰어 관련 상태
  const [currentFrame, setCurrentFrame] = useState(125)
  const [totalFrames] = useState(300)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [heatmapToggle, setHeatmapToggle] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState('1')

  // AI진단 (predict)
  const [aiFile, setAiFile] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [isAiDragOver, setIsAiDragOver] = useState(false)

  // 뷰어 인터랙션 상태 (줌인, 줌아웃, 팬, 전체화면)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 })
  const viewerContainerRef = useRef(null)

  // 자동 재생 타이머 (프레임 연동)
  useEffect(() => {
    if (!isPlaying) return
    const interval = 1000 / (10 * playbackSpeed)
    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames) {
          setIsPlaying(false)
          return totalFrames
        }
        return prev + 1
      })
    }, interval)
    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, totalFrames])

  // 뷰어 마우스 드래그 팬(Pan) 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      imageX: position.x,
      imageY: position.y
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.mouseX
    const dy = e.clientY - dragStartRef.current.mouseY
    setPosition({
      x: dragStartRef.current.imageX + dx,
      y: dragStartRef.current.imageY + dy
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 마우스 휠 줌 핸들러
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomIntensity = 0.15
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + zoomIntensity, 3))
    } else {
      setScale(prev => Math.max(prev - zoomIntensity, 0.5))
    }
  }

  // 전체화면 토글 함수
  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(err => {
        console.error("전체화면 전환 실패:", err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // 사이드바 하단 버튼을 통한 북마크 추가 핸들러 연동
  const handleTriggerAddBookmark = () => {
    if (!onAddBookmark) return
    const minutes = String(Math.floor(currentFrame / 60 / 10)).padStart(2, '0')
    const seconds = String(Math.floor((currentFrame / 10) % 60)).padStart(2, '0')
    
    onAddBookmark({
      title: `프레임 ${currentFrame} 분석 지점`,
      patientId: selectedPatient ? selectedPatient.patient_id : '공통',
      note: `타임라인 ${minutes}:${seconds} 구간 확인`
    })
  }

const handleSelectPatient = (patient) => {
  setSelectedPatient(patient)
  setCurrentMenu('patient-detail')
  setIsSearchDropdownOpen(false)
  setSidebarSearch('')
}

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
      const response = await fetch(
        `http://35.234.39.234:8000/api/patients/search/?q=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      )

      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해 주세요.')
        return
      }

      if (!response.ok) {
        throw new Error('환자 검색 실패')
      }

      const data = await response.json()
      const results = Array.isArray(data) ? data : (data.results || [])

      if (results.length > 0) {
        setSearchResults(results)
        setIsSearchDropdownOpen(true)
      } else {
        alert('일치하는 환자가 없습니다.')
        setIsSearchDropdownOpen(false)
      }
    } catch (error) {
      console.error('전체 환자 검색 오류:', error)
      alert('환자 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSearchDropdownOpen(false)
    }
  }
}

//AI predict 관련
const handleAiPredict = async () => {
  if (!aiFile) {
    alert('분석할 이미지를 선택해주세요.')
    return
  }
  const access = localStorage.getItem('access')
  if (!access) {
    alert('로그인 토큰이 없습니다. 다시 로그인해 주세요.')
    return
  }
  setAiLoading(true)
  setAiError('')
  setAiResult(null)
  try {
    const formData = new FormData()
    formData.append('file', aiFile)
    const response = await fetch('http://35.234.39.234:8000/api/ai/predict/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
      },
      body: formData,
    })
    if (response.status === 401) {
      setAiError('로그인이 만료되었습니다. 다시 로그인해 주세요.')
      return
    }
    if (!response.ok) {
      throw new Error('AI 분석 요청 실패')
    }
    const data = await response.json()
    setAiResult(data)
  } catch (error) {
    console.error(error)
    setAiError('AI 분석에 실패했습니다.')
  } finally {
    setAiLoading(false)
  }
}


  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-6 h-14 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-blue-600 text-white font-bold rounded shadow">LOGO</div>
          <h1 className="text-white font-bold text-lg tracking-wide">혈관조영술 AI 진단 시스템</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 hover:text-white cursor-pointer">알림</span>
          <span className="text-sm font-medium text-white">{displayName} (의료진)</span>
          <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-300 font-medium">로그아웃</button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0 relative overflow-y-auto">
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

              {isSearchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-400 border-b border-gray-800 flex justify-between items-center">
                    <span>전체 검색 결과 ({searchResults.length}명)</span>
                    <button onClick={() => setIsSearchDropdownOpen(false)} className="text-gray-500 hover:text-white">✕</button>
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

            {/* 네비게이션 메뉴 */}
            <nav className="space-y-1">
              <button 
                onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <LayoutDashboard size={16} /> 대시보드 홈
              </button>
              <button 
                onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Users size={16} /> 담당 환자 목록 ({patients.length})
              </button>
              <button 
                onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'consultation' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Stethoscope size={16} /> 협진요청
              </button>
              <button 
                onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'ai-diag' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Cpu size={16} /> AI 진단
              </button>
              <button 
                onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); setIsSearchDropdownOpen(false); }} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${currentMenu === 'bookmarks' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Bookmark size={16} /> 북마크 관리
              </button>
            </nav>
          </div>

          {/* 사이드바 하단 북마크 요약 리스트 */}
          <div className="mt-6 border-t border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark size={16} className="text-blue-400" />
              <span className="text-xs font-semibold text-gray-200">최근 북마크 ({bookmarks.length})</span>
            </div>
            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm, index) => (
                  <div key={bm.id || index} className="flex items-center justify-between rounded bg-gray-800/60 px-2.5 py-1.5 text-xs border border-gray-700/55">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">{bm.title || '북마크'}</span>
                      <span className="text-gray-200 truncate max-w-[90px]">{bm.note || bm.patientId}</span>
                    </div>
                    {onDeleteBookmark && (
                      <button onClick={() => onDeleteBookmark(bm.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-gray-500 text-center py-2">저장된 북마크가 없습니다.</p>
              )}
            </div>
            <button 
              onClick={handleTriggerAddBookmark} 
              className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-gray-700 py-1.5 text-xs font-medium text-gray-300 hover:border-blue-500 hover:bg-gray-800 hover:text-white transition-all"
            >
              <Plus size={14} /> 현재 화면 북마크 추가
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-800">{healthStatus}</div>
        </aside>

        {/* 본문 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentMenu === 'patient-detail' ? (
            <PatientDetail patient={selectedPatient} onBack={() => setCurrentMenu('patients')} />
          ) : currentMenu === 'patients' ? (
            <PatientManagement patients={patients} errorMessage={errorMessage} onSelectPatient={handleSelectPatient} />
          ) : currentMenu === 'consultation' ? (
            <ConsultationView />
          ) : currentMenu === 'bookmarks' ? (
            <BookmarkView 
              bookmarks={bookmarks} 
              onDeleteBookmark={onDeleteBookmark} 
              onSelectBookmark={(item) => {
                console.log('선택된 북마크 항목:', item)
              }} 
            />
          ) : (
            <main className="flex-1 p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4 bg-gray-950">
              
              {/* 좌측 메인 영역 (뷰어 + 타임라인) */}
              <div className="lg:col-span-2 flex flex-col space-y-4">
                
                {/* 줌인/줌아웃/전체화면이 포함된 Main Viewer */}
                <div ref={viewerContainerRef} className="flex-1 min-h-[380px] bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">영상 뷰어</span>
                      <select 
                        value={selectedSeries} 
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none"
                      >
                        <option value="1">시리즈 1</option>
                        <option value="2">시리즈 2</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <button 
                        onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
                      >
                        <ZoomIn size={14} /> 줌인
                      </button>
                      <button 
                        onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
                      >
                        <ZoomOut size={14} /> 축소
                      </button>
                      <span className="font-mono text-gray-400 px-1">{Math.round(scale * 100)}%</span>
                      <button 
                        onClick={() => { setScale(1); setPosition({x:0, y:0}); }} 
                        className="px-2 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
                      >
                        초기화
                      </button>
                      <button 
                        onClick={handleToggleFullscreen} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
                      >
                        <Maximize2 size={14} /> 전체화면
                      </button>
                    </div>
                  </div>

                  <div 
                    className="flex-1 relative flex items-center justify-center bg-black overflow-hidden select-none cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                  >
                    <div className="absolute left-4 top-4 z-10 space-y-0.5 text-xs text-gray-300 pointer-events-none">
                      <p>Patient ID : {selectedPatient ? selectedPatient.patient_id : '00012345'}</p>
                      <p>Study Date : 2026-07-26</p>
                      <p>Series : {selectedSeries}</p>
                    </div>
                    <div className="absolute right-4 top-4 z-10 space-y-0.5 text-right text-xs text-gray-300 pointer-events-none">
                      <p>Frame : {currentFrame} / {totalFrames}</p>
                      <p>LAO 45° / CRAN 20°</p>
                    </div>

                    <img 
                      src={angioImage} 
                      alt="혈관조영술" 
                      className="max-h-full max-w-full object-contain pointer-events-none"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                      }}
                      draggable={false}
                    />

                    <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.max(prev - 1, 1)); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 z-20">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.min(prev + 1, totalFrames)); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 z-20">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* 6번 영역: 재생 컨트롤 / 썸네일 타임라인 */}
                <div className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3.5 shrink-0">
                  {/* 상단 컨트롤 바 */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setIsPlaying(false); setCurrentFrame(1); }} className="p-1.5 text-gray-300 hover:text-white" title="처음으로"><SkipBack size={16} /></button>
                    <button onClick={() => setCurrentFrame(prev => Math.max(prev - 1, 1))} className="p-1.5 text-gray-300 hover:text-white" title="이전 프레임"><ChevronLeft size={16} /></button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-500" title={isPlaying ? "일시정지" : "재생"}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={() => setIsPlaying(false)} className="p-1.5 text-gray-300 hover:text-white" title="정지"><Square size={14} /></button>
                    <button onClick={() => setCurrentFrame(prev => Math.min(prev + 1, totalFrames))} className="p-1.5 text-gray-300 hover:text-white" title="다음 프레임"><ChevronRight size={16} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentFrame(totalFrames); }} className="p-1.5 text-gray-300 hover:text-white" title="마지막으로"><SkipForward size={16} /></button>
                    
                    <button className="p-1.5 text-gray-400 hover:text-white"><Volume2 size={16} /></button>
                    
                    <span className="text-xs text-gray-300 font-mono min-w-[70px] text-center">{currentFrame} / {totalFrames}</span>
                    
                    <input 
                      type="range" min="1" max={totalFrames} value={currentFrame} 
                      onChange={(e) => { setIsPlaying(false); setCurrentFrame(Number(e.target.value)); }}
                      className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />

                    <select 
                      value={playbackSpeed} 
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200 outline-none"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2.0x</option>
                    </select>
                  </div>

                  {/* 하단 프레임 썸네일 스트립 타임라인 */}
                  <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentFrame(prev => Math.max(prev - 5, 1))}
                      className="p-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 shrink-0"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                      {Array.from({ length: 7 }).map((_, idx) => {
                        const targetFr = Math.min(Math.max(currentFrame - 3 + idx, 1), totalFrames)
                        const isSelected = targetFr === currentFrame

                        return (
                          <div 
                            key={idx}
                            onClick={() => { setIsPlaying(false); setCurrentFrame(targetFr); }}
                            className={`relative flex-1 min-w-[55px] h-12 rounded bg-black border cursor-pointer overflow-hidden transition-all ${
                              isSelected ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600'
                            }`}
                          >
                            <img src={angioImage} alt={`프레임 ${targetFr}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono bg-black/70 px-1 rounded text-white">
                              F{targetFr}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentFrame(prev => Math.min(prev + 5, totalFrames))}
                      className="p-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 shrink-0"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* 우측 패널 영역 */}
              <div className="flex flex-col space-y-4">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col">
                  <div className="border-b border-gray-800 pb-3 mb-3">
                    <h2 className="font-semibold text-sm text-white">AI 결과 패널</h2>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div
                      className={`rounded border border-dashed p-3 space-y-2 ${
                        isAiDragOver
                          ? 'border-blue-500 bg-blue-950/30'
                          : 'border-gray-700 bg-gray-800/40'
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAiDragOver(true)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAiDragOver(true)
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAiDragOver(false)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAiDragOver(false)
                        const file = e.dataTransfer.files?.[0]
                        if (!file) return
                        if (!file.type.startsWith('image/')) {
                          alert('이미지 파일만 업로드할 수 있습니다.')
                          return
                        }
                        setAiFile(file)
                        setAiResult(null)
                        setAiError('')
                      }}
                    >
                      <label className="block text-gray-400">분석 이미지</label>
                      <p className="text-[11px] text-gray-500">
                        여기로 이미지를 드래그하거나, 아래에서 파일을 선택하세요.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setAiFile(e.target.files?.[0] || null)
                          setAiResult(null)
                          setAiError('')
                        }}
                        className="block w-full text-xs text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAiPredict}
                        disabled={aiLoading || !aiFile}
                        className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        {aiLoading ? '분석 중...' : 'AI 분석 실행'}
                      </button>
                      {aiFile && (
                        <p className="text-gray-500 truncate">선택: {aiFile.name}</p>
                      )}
                    </div>
                    {aiError && (
                      <p className="text-red-400 font-medium">{aiError}</p>
                    )}
                    {aiResult ? (
                      <>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400">진단 요약</span>
                            <span className="rounded bg-red-950/80 px-2 py-0.5 text-red-400 border border-red-800 font-medium">
                              신뢰도 {((aiResult.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white">
                            {aiResult.predicted_label === 'Stenosis' ? '협착 의심' : '정상'}
                          </p>
                        </div>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-3 space-y-1">
                          <span className="text-gray-400 block mb-1">확률</span>
                          <p className="text-gray-200">
                            Normal: {((aiResult.probabilities?.normal || 0) * 100).toFixed(1)}%
                          </p>
                          <p className="text-gray-200">
                            Stenosis: {((aiResult.probabilities?.stenosis || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </>
                    ) : (
                      !aiLoading && (
                        <p className="text-gray-500">이미지를 업로드한 뒤 분석을 실행하세요.</p>
                      )
                    )}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-sm text-white">히트맵 / 박스 오버레이</h2>
                    <input
                      type="checkbox"
                      checked={heatmapToggle}
                      onChange={() => setHeatmapToggle(!heatmapToggle)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-400">
                    <div className="h-20 rounded border border-gray-800 bg-black flex items-center justify-center overflow-hidden relative">
                      <img src={angioImage} alt="히트맵" className="h-full w-full object-cover opacity-60" />
                    </div>
                    <div className="h-20 rounded border border-gray-800 bg-black flex items-center justify-center overflow-hidden relative">
                      <img src={angioImage} alt="박스" className="h-full w-full object-cover opacity-60" />
                    </div>
                  </div>
                </div>
              </div>

            </main>
          )}
        </div>
      </div>
    </div>
  )
}