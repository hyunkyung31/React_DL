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
  Video, FileBarChart, Settings, Square, Menu, X 
} from 'lucide-react'
import angioImage from '../assets/angio_sample.png'
import Xai_visualization from '../Components/Xai_visualization'

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
    <div className="flex-1 p-6 text-gray-100 overflow-y-auto" style={{ backgroundColor: '#060B18' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">담당 환자 목록 관리</h2>
            <p className="text-xs text-gray-300 mt-1">등록된 환자를 검색하고 임상 상태를 확인하세요.</p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-blue-800/50 rounded text-sm text-white focus:outline-none focus:border-blue-400"
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
              className="px-3 py-2 bg-gray-900 border border-blue-800/50 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {errorMessage && <p className="text-red-400 font-semibold">{errorMessage}</p>}

        <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-950/50 text-gray-300 text-xs uppercase tracking-wider border-b border-blue-800/40">
                <th className="px-6 py-3 font-semibold">환자 ID</th>
                <th className="px-6 py-3 font-semibold">환자명</th>
                <th className="px-6 py-3 font-semibold">나이/성별</th>
                <th className="px-6 py-3 font-semibold">주호소</th>
                <th className="px-6 py-3 font-semibold">ECG 결과</th>
                <th className="px-6 py-3 font-semibold text-center">관리 메뉴</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-blue-900/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-200">{patient.patient_id}</td>
                    <td className="px-6 py-4 font-medium text-white">{patient.patient_name}</td>
                    <td className="px-6 py-4 text-gray-200">{patient.age}세 / {patient.gender}</td>
                    <td className="px-6 py-4 text-gray-200">{patient.chief_complaint || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-inner">
                        {patient.ecg_result || '정상'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onSelectPatient && onSelectPatient(patient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors shadow-lg shadow-blue-600/30"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
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

  // XAI 표시 모드: Bounding Box 또는 Heatmap
  const [overlayMode, setOverlayMode] = useState('boundingBox')
  const [heatmapOpacity, setHeatmapOpacity] = useState(50)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false)

  const viewerImageRef = useRef(null)
  const heatmapCanvasRef = useRef(null)
  const boundingBoxCanvasRef = useRef(null)
  
  // 모바일 반응형 사이드바 토글 상태
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // 영상 재생 및 뷰어 관련 상태
  const [currentFrame, setCurrentFrame] = useState(125)
  const [totalFrames] = useState(300)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
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

  // 임시 XAI Heatmap 렌더링
useEffect(() => {
  const image = viewerImageRef.current
  const canvas = heatmapCanvasRef.current

  if (!image || !canvas || !isViewerImageLoaded) return

  const drawHeatmap = () => {
    const imageWidth = image.clientWidth
    const imageHeight = image.clientHeight

    if (imageWidth === 0 || imageHeight === 0) return

    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = imageWidth * pixelRatio
    canvas.height = imageHeight * pixelRatio
    canvas.style.width = `${imageWidth}px`
    canvas.style.height = `${imageHeight}px`

    const context = canvas.getContext('2d')

    if (!context) return

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    )

    context.clearRect(
      0,
      0,
      imageWidth,
      imageHeight
    )

    // Heatmap 모드에서만 표시
    if (overlayMode !== 'heatmap') return

    const opacity = heatmapOpacity / 100

    const drawHeatPoint = (
      centerX,
      centerY,
      radius,
      intensity = 1
    ) => {
      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      )

      gradient.addColorStop(0,  `rgba(255, 0, 0, ${opacity * intensity})`)
      gradient.addColorStop(0.3, `rgba(255, 90, 0, ${opacity * intensity * 0.9})`)
      gradient.addColorStop(0.55, `rgba(255, 200, 0, ${opacity * intensity * 0.65})`)
      gradient.addColorStop(0.78, `rgba(170, 255, 0, ${opacity * intensity * 0.3})`)
      gradient.addColorStop(1, 'rgba(170, 255, 0, 0)')

      context.fillStyle = gradient

      context.fillRect(
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      )
    }

    // 중심 병변 영역
    drawHeatPoint(
      imageWidth * 0.53,
      imageHeight * 0.45,
      Math.min(imageWidth, imageHeight) * 0.24, 1
    )

    // 주변에 퍼지는 보조 영역
    drawHeatPoint(
      imageWidth * 0.47,
      imageHeight * 0.40,
      Math.min(imageWidth, imageHeight) * 0.16, 0.65
    )

    drawHeatPoint(
      imageWidth * 0.59,
      imageHeight * 0.50,
      Math.min(imageWidth, imageHeight) * 0.14, 0.55
    )
  }

  drawHeatmap()

  window.addEventListener('resize', drawHeatmap)

  return () => {
    window.removeEventListener('resize', drawHeatmap)
  }
}, [
  overlayMode,
  heatmapOpacity,
  isViewerImageLoaded,
])

  // Bounding Box 렌더링
  useEffect(() => {
    const image = viewerImageRef.current
    const canvas = boundingBoxCanvasRef.current

    if (!image || !canvas || !isViewerImageLoaded) return

    const drawBoundingBoxes = () => {
      const imageWidth = image.clientWidth
      const imageHeight = image.clientHeight

      if (imageWidth === 0 || imageHeight === 0) return

      const pixelRatio = window.devicePixelRatio || 1

      canvas.width = imageWidth * pixelRatio
      canvas.height = imageHeight * pixelRatio
      canvas.style.width = `${imageWidth}px`
      canvas.style.height = `${imageHeight}px`

      const context = canvas.getContext('2d')

      if (!context) return

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      )

      context.clearRect(
        0,
        0,
        imageWidth,
        imageHeight
      )

    // Bounding Box 모드에서만 표시
    if (overlayMode !== 'boundingBox') return

    const mockBoundingBoxes = [
      {
        id: 1,
        x: 120,
        y: 90,
        width: 150,
        height: 120,
        label: 'Stenosis',
        confidence: 0.94,
      },
    ]

    const scaleX = imageWidth / image.naturalWidth
    const scaleY = imageHeight / image.naturalHeight

    mockBoundingBoxes
      .filter(
        (box) =>
          box.confidence * 100 >= confidenceThreshold
      )
      .forEach((box) => {
        const boxX = box.x * scaleX
        const boxY = box.y * scaleY
        const boxWidth = box.width * scaleX
        const boxHeight = box.height * scaleY

        const labelText = `${box.label} ${Math.round(box.confidence * 100)}%`

        context.strokeStyle = '#ef4444'
        context.lineWidth = 4

        context.strokeRect(
          boxX,
          boxY,
          boxWidth,
          boxHeight
        )

        context.font = 'bold 15px sans-serif'

        const labelPadding = 6
        const labelHeight = 24
        const labelWidth = context.measureText(labelText).width + labelPadding * 2
        const labelY = Math.max(boxY - labelHeight, 0)

        context.fillStyle = '#ef4444'
        context.fillRect(boxX, labelY, labelWidth, labelHeight)

        context.fillStyle = '#ffffff'
        context.fillText(labelText, boxX + labelPadding, labelY + 17)
      })
    }

    drawBoundingBoxes()

    window.addEventListener('resize', drawBoundingBoxes)

    return () => {
      window.removeEventListener('resize', drawBoundingBoxes)
    }
}, [
  overlayMode,
  confidenceThreshold,
  isViewerImageLoaded,
])

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
    setIsMobileSidebarOpen(false) // 모바일에서 선택 시 사이드바 닫기
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
    <div className="flex flex-col h-screen text-gray-100 overflow-hidden" style={{ backgroundColor: '#060B18' }}>
      {/* 상단 헤더 */}
        <header className="flex items-center justify-between px-6 h-14 border-b border-blue-800/40 bg-gray-900/70 backdrop-blur-md shrink-0 shadow-lg z-20">
          <div className="flex items-center space-x-4">
            {/* 모바일용 사이드바 토글 버튼 */}
            <button 
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white rounded bg-gray-800 border border-blue-800/50"
            >
              {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded shadow-lg shadow-blue-600/30">LOGO</div>
            <h1 className="text-white font-bold text-sm md:text-lg tracking-wide truncate">혈관조영술 AI 진단 시스템</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-200 hover:text-white cursor-pointer">알림</span>
            <span className="text-xs md:text-sm font-medium text-blue-200">{displayName} (의료진)</span>
            <button onClick={onLogout} className="text-xs md:text-sm text-red-400 hover:text-red-300 font-medium">로그아웃</button>
          </div>
        </header>

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 모바일 백드롭 오버레이 (사이드바 열렸을 때 배경 어둡게 처리) */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          />
        )}

        {/* 사이드바 (반응형: 모바일선 absolute 슬라이드, md 이상선 flex 고정 w-60) */}
        <aside className={`
          absolute md:relative inset-y-0 left-0 z-40 
          w-60 border-r border-blue-800/40 bg-gray-900/95 md:bg-gray-900/60 backdrop-blur-md 
          flex flex-col justify-between p-3 shrink-0 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div>
            <div className="mb-4 relative">
              <label className="text-xs font-semibold text-gray-300">전체 환자 빠른 검색</label>
              <input 
                type="text" 
                placeholder="이름/ID 입력 후 Enter" 
                value={sidebarSearch}
                onChange={(e) => {
                  setSidebarSearch(e.target.value)
                  if (isSearchDropdownOpen) setIsSearchDropdownOpen(false)
                }}
                onKeyDown={handleSidebarSearchKeyDown}
                className="w-full mt-1 px-2.5 py-1.5 bg-gray-900 border border-blue-800/50 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-inner"
              />

              {isSearchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-blue-800/60 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto backdrop-blur-xl">
                  <div className="p-2 text-xs text-gray-300 border-b border-blue-800/40 flex justify-between items-center">
                    <span>검색 결과 ({searchResults.length})</span>
                    <button onClick={() => setIsSearchDropdownOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  {searchResults.map((patient) => (
                    <div 
                      key={patient.patient_id}
                      onClick={() => handleSelectPatient(patient)}
                      className="p-2.5 hover:bg-blue-900/40 cursor-pointer border-b border-blue-900/30 last:border-none transition-colors"
                    >
                      <p className="text-sm font-medium text-white">{patient.patient_name}</p>
                      <p className="text-xs text-gray-300">ID: {patient.patient_id} ({patient.age}세/{patient.gender})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="space-y-1">
              <button 
                onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
              >
                <LayoutDashboard size={15} /> 대시보드 홈
              </button>
              <button 
                onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
              >
                <Users size={15} /> 환자 목록 ({patients.length})
              </button>
              <button 
                onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'consultation' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
              >
                <Stethoscope size={15} /> 협진요청
              </button>
              <button 
                onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'ai-diag' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
              >
                <Cpu size={15} /> AI 진단
              </button>
              <button 
                onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'bookmarks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
              >
                <Bookmark size={15} /> 북마크 관리
              </button>
            </nav>
          </div>

          {/* 사이드바 하단 북마크 요약 리스트 */}
          <div className="mt-6 border-t border-blue-800/40 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Bookmark size={14} className="text-blue-400" />
              <span className="text-[11px] font-semibold text-gray-200">최근 북마크 ({bookmarks.length})</span>
            </div>
            <div className="space-y-1.5 mb-2.5 max-h-32 overflow-y-auto pr-1">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm, index) => (
                  <div key={bm.id || index} className="flex items-center justify-between rounded bg-blue-950/40 px-2 py-1 text-[11px] border border-blue-800/40 shadow-inner">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-blue-300 bg-blue-900/60 px-1 py-0.2 rounded border border-blue-700/50">{bm.title || '북마크'}</span>
                      <span className="text-gray-200 truncate max-w-[70px]">{bm.note || bm.patientId}</span>
                    </div>
                    {onDeleteBookmark && (
                      <button onClick={() => onDeleteBookmark(bm.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 text-center py-1">북마크 없음</p>
              )}
            </div>
            <button 
              onClick={handleTriggerAddBookmark} 
              className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-blue-700/60 py-1.5 text-[11px] font-medium text-blue-300 hover:border-blue-400 hover:bg-blue-900/40 hover:text-white transition-all shadow-inner"
            >
              <Plus size={12} /> 현재 화면 북마크 추가
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-blue-800/40 truncate">{healthStatus}</div>
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
            <main className="flex-1 p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ backgroundColor: '#060B18' }}>
              
              {/* 좌측 메인 영역 (뷰어 + 타임라인) */}
              <div className="lg:col-span-2 flex flex-col space-y-4">
                
                {/* 뷰어 */}
                <div ref={viewerContainerRef} className="flex-1 min-h-[380px] rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-blue-800/40 px-4 py-2.5 bg-blue-950/40">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">영상 뷰어</span>
                      <select 
                        value={selectedSeries} 
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="rounded border border-blue-800/50 bg-gray-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-400"
                      >
                        <option value="1">시리즈 1</option>
                        <option value="2">시리즈 2</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <button 
                        onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
                      >
                        <ZoomIn size={14} /> 줌인
                      </button>
                      <button 
                        onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
                      >
                        <ZoomOut size={14} /> 축소
                      </button>
                      <span className="font-mono text-blue-300 px-1">{Math.round(scale * 100)}%</span>
                      <button 
                        onClick={() => { setScale(1); setPosition({x:0, y:0}); }} 
                        className="px-2 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
                      >
                        초기화
                      </button>
                      <button 
                        onClick={handleToggleFullscreen} 
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
                      >
                        <Maximize2 size={14} /> 전체화면
                      </button>
                    </div>
                  </div>

                  <div 
                    className="flex-1 relative flex items-center justify-center bg-gray-950/90 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                  >
                    <div className="absolute left-4 top-4 z-10 space-y-0.5 text-xs text-blue-200 font-mono pointer-events-none drop-shadow">
                      <p>Patient ID : {selectedPatient ? selectedPatient.patient_id : '00012345'}</p>
                      <p>Study Date : 2026-07-26</p>
                      <p>Series : {selectedSeries}</p>
                    </div>
                    <div className="absolute right-4 top-4 z-10 space-y-0.5 text-right text-xs text-blue-200 font-mono pointer-events-none drop-shadow">
                      <p>Frame : {currentFrame} / {totalFrames}</p>
                      <p>LAO 45° / CRAN 20°</p>
                    </div>

                    <div
                      className="relative inline-block max-h-full max-w-full"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging
                          ? 'none'
                          : 'transform 0.1s ease-out',
                      }}
                    >
                      <img
                        ref={viewerImageRef}
                        src={angioImage}
                        alt="혈관조영술"
                        onLoad={() => setIsViewerImageLoaded(true)}
                        className="block max-h-full max-w-full object-contain pointer-events-none"
                        draggable={false}
                      />
                      <canvas
                        ref={heatmapCanvasRef}
                        className="pointer-events-none absolute left-0 top-0 h-full w-full"
                        aria-label="임시 AI Heatmap"
                      />
                      <canvas
                        ref={boundingBoxCanvasRef}
                        className="pointer-events-none absolute left-0 top-0 h-full w-full"
                        aria-label="AI Bounding Box"
                      />
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.max(prev - 1, 1)); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 border border-blue-800/50 p-2 text-white hover:bg-gray-900 z-20 shadow-lg">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.min(prev + 1, totalFrames)); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 border border-blue-800/50 p-2 text-white hover:bg-gray-900 z-20 shadow-lg">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* 재생 컨트롤 / 썸네일 타임라인 */}
                <div className="flex flex-col gap-3 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3.5 shrink-0 shadow-xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setIsPlaying(false); setCurrentFrame(1); }} className="p-1.5 text-gray-200 hover:text-white" title="처음으로"><SkipBack size={16} /></button>
                    <button onClick={() => setCurrentFrame(prev => Math.max(prev - 1, 1))} className="p-1.5 text-gray-200 hover:text-white" title="이전 프레임"><ChevronLeft size={16} /></button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="rounded bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 text-white hover:opacity-90 shadow-md shadow-blue-600/30" title={isPlaying ? "일시정지" : "재생"}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={() => setIsPlaying(false)} className="p-1.5 text-gray-200 hover:text-white" title="정지"><Square size={14} /></button>
                    <button onClick={() => setCurrentFrame(prev => Math.min(prev + 1, totalFrames))} className="p-1.5 text-gray-200 hover:text-white" title="다음 프레임"><ChevronRight size={16} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentFrame(totalFrames); }} className="p-1.5 text-gray-200 hover:text-white" title="마지막으로"><SkipForward size={16} /></button>
                    
                    <button className="p-1.5 text-gray-300 hover:text-white"><Volume2 size={16} /></button>
                    
                    <span className="text-xs text-blue-300 font-mono min-w-[70px] text-center">{currentFrame} / {totalFrames}</span>
                    
                    <input 
                      type="range" min="1" max={totalFrames} value={currentFrame} 
                      onChange={(e) => { setIsPlaying(false); setCurrentFrame(Number(e.target.value)); }}
                      className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 shadow-inner" 
                    />

                    <select 
                      value={playbackSpeed} 
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="rounded border border-blue-800/50 bg-gray-900 px-2 py-1 text-xs text-gray-200 outline-none focus:border-blue-400"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2.0x</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-blue-900/30 flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentFrame(prev => Math.max(prev - 5, 1))}
                      className="p-1 rounded bg-gray-900 border border-blue-800/40 text-gray-200 hover:bg-blue-900/50 shrink-0"
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
                            className={`relative flex-1 min-w-[55px] h-12 rounded bg-gray-900 border cursor-pointer overflow-hidden transition-all shadow-md ${
                              isSelected ? 'border-blue-400 ring-2 ring-blue-500/40 scale-105' : 'border-blue-900/50 opacity-70 hover:opacity-100 hover:border-blue-600'
                            }`}
                          >
                            <img src={angioImage} alt={`프레임 ${targetFr}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono bg-gray-900/90 px-1 rounded text-blue-200 border border-blue-800/40">
                              F{targetFr}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentFrame(prev => Math.min(prev + 5, totalFrames))}
                      className="p-1 rounded bg-gray-900 border border-blue-800/40 text-gray-200 hover:bg-blue-900/50 shrink-0"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* 우측 패널 영역 */}
              <div className="flex flex-col space-y-4">
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl">
                  <div className="border-b border-blue-800/40 pb-3 mb-3">
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
                <div className="mt-4">
                  <Xai_visualization 
                      overlayMode={overlayMode}
                      setOverlayMode={setOverlayMode}
                      heatmapOpacity={heatmapOpacity}
                      setHeatmapOpacity={setHeatmapOpacity}
                      confidenceThreshold={confidenceThreshold}
                      setConfidenceThreshold={setConfidenceThreshold}
                  />
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