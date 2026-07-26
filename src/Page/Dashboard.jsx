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
  Video, FileBarChart, Settings, Square, Menu, X, ArrowRight, Activity, ShieldCheck, HeartPulse 
} from 'lucide-react'
import angioImage from '../assets/angio_sample.png'
import Xai_visualization from '../Components/Xai_visualization'

// ==========================================
// 1. Home 컴포넌트 (대시보드 홈 화면)
// ==========================================
function Home({ displayName, patients = [], onNavigate, onSelectPatient }) {
  const recentPatients = patients.slice(0, 5)
  const totalPatientsCount = patients.length
  const normalCount = patients.filter(p => (p.ecg_result || '정상') === '정상').length
  const alertCount = totalPatientsCount - normalCount

  return (
    <div className="flex-1 p-6 text-gray-100 overflow-y-auto space-y-6" style={{ backgroundColor: '#060B18' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 mb-1">
            <ShieldCheck size={14} /> 혈관조영술 AI 진단 시스템 v1.0
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            환영합니다, <span className="text-blue-400">{displayName}</span> 의료진님 👋
          </h2>
          <p className="text-xs text-gray-300">
            오늘도 환자의 임상 데이터를 안전하게 분석하고 최적의 진단을 지원합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate && onNavigate('ai-diag')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Cpu size={16} /> AI 분석 시작하기 <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">전체 관리 환자</p>
            <p className="text-2xl font-bold text-white">{totalPatientsCount}명</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400"><Users size={20} /></div>
        </div>
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">정상 소견</p>
            <p className="text-2xl font-bold text-emerald-400">{normalCount}명</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400"><Activity size={20} /></div>
        </div>
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">정밀 진단/주의</p>
            <p className="text-2xl font-bold text-red-400">{alertCount}명</p>
          </div>
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-400"><HeartPulse size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <LayoutDashboard size={16} className="text-blue-400" /> 빠른 메뉴 이동
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button onClick={() => onNavigate && onNavigate('patients')} className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20">
              <Users size={18} className="text-blue-400" /><span className="font-semibold">환자 목록 관리</span>
            </button>
            <button onClick={() => onNavigate && onNavigate('consultation')} className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20">
              <Stethoscope size={18} className="text-indigo-400" /><span className="font-semibold">협진요청</span>
            </button>
            <button onClick={() => onNavigate && onNavigate('ai-diag')} className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20">
              <Cpu size={18} className="text-cyan-400" /><span className="font-semibold">AI 진단 분석</span>
            </button>
            <button onClick={() => onNavigate && onNavigate('bookmarks')} className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20">
              <Bookmark size={18} className="text-amber-400" /><span className="font-semibold">북마크 관리</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 p-5 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Users size={16} className="text-blue-400" /> 최근 등록 환자 요약
            </h3>
            <button onClick={() => onNavigate && onNavigate('patients')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-950/50 text-gray-300 border-b border-blue-800/40">
                  <th className="px-3 py-2.5 font-semibold">환자 ID</th>
                  <th className="px-3 py-2.5 font-semibold">환자명</th>
                  <th className="px-3 py-2.5 font-semibold">나이/성별</th>
                  <th className="px-3 py-2.5 font-semibold">주호소</th>
                  <th className="px-3 py-2.5 font-semibold text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient) => (
                    <tr key={patient.patient_id} className="hover:bg-blue-900/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-gray-300">{patient.patient_id}</td>
                      <td className="px-3 py-2.5 font-medium text-white">{patient.patient_name}</td>
                      <td className="px-3 py-2.5 text-gray-300">{patient.age}세 / {patient.gender}</td>
                      <td className="px-3 py-2.5 text-gray-300 truncate max-w-[120px]">{patient.chief_complaint || '-'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button onClick={() => onSelectPatient && onSelectPatient(patient)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors shadow">
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-400">등록된 환자 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. PatientManagement 컴포넌트 (환자 관리 화면)
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">검색 결과가 없습니다.</td>
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
// 3. Dashboard 메인 컴포넌트
// ==========================================
export default function Dashboard({ 
  displayName, 
  healthStatus, 
  patients = [], 
  errorMessage, 
  onLogout,
  bookmarks = [],         
  onAddBookmark,     
  onDeleteBookmark   
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [currentFrame, setCurrentFrame] = useState(0)

  // 모바일 반응형 사이드바 토글 상태
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // AI 분석 화면용 상태 추가 (이전 코드 연동)
  const [isAiDragOver, setIsAiDragOver] = useState(false)
  const [aiFile, setAiFile] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // XAI 및 오버레이 시각화 상태 추가
  const [overlayMode, setOverlayMode] = useState('heatmap')
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [heatmapToggle, setHeatmapToggle] = useState(true)

  const handleAiPredict = async () => {
    if (!aiFile) return
    setAiLoading(true)
    setAiError('')
    try {
      // AI 예측 API 호출 로직 (필요시 연동)
      setTimeout(() => {
        setAiResult({
          confidence: 0.92,
          predicted_label: 'Stenosis',
          probabilities: { normal: 0.08, stenosis: 0.92 }
        })
        setAiLoading(false)
      }, 1000)
    } catch (err) {
      setAiError('AI 분석 중 오류가 발생했습니다.')
      setAiLoading(false)
    }
  }

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
    setIsMobileSidebarOpen(false)
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
            headers: { Authorization: `Bearer ${access}` },
          }
        )

        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해 주세요.')
          return
        }

        if (!response.ok) throw new Error('환자 검색 실패')

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

  return (
    <div className="flex flex-col h-screen text-gray-100 overflow-hidden" style={{ backgroundColor: '#060B18' }}>
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-blue-800/40 bg-gray-900/70 backdrop-blur-md shrink-0 shadow-lg z-20">
        <div className="flex items-center space-x-4">
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
        {isMobileSidebarOpen && (
          <div onClick={() => setIsMobileSidebarOpen(false)} className="absolute inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" />
        )}

        {/* 사이드바 */}
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

            <nav className="space-y-1">
              <button onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}>
                <LayoutDashboard size={15} /> 대시보드 홈
              </button>
              <button onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}>
                <Users size={15} /> 환자 목록 ({patients.length})
              </button>
              <button onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'consultation' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}>
                <Stethoscope size={15} /> 협진요청
              </button>
              <button onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'ai-diag' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}>
                <Cpu size={15} /> AI 진단
              </button>
              <button onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'bookmarks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}>
                <Bookmark size={15} /> 북마크 관리
              </button>
            </nav>
          </div>

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
            <button onClick={handleTriggerAddBookmark} className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-blue-700/60 py-1.5 text-[11px] font-medium text-blue-300 hover:border-blue-400 hover:bg-blue-900/40 hover:text-white transition-all shadow-inner">
              <Plus size={12} /> 현재 화면 북마크 추가
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-blue-800/40 truncate">{healthStatus}</div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentMenu === 'dashboard' && (
            <Home 
              displayName={displayName} 
              patients={patients} 
              onNavigate={(menu) => setCurrentMenu(menu)} 
              onSelectPatient={handleSelectPatient} 
            />
          )}

          {currentMenu === 'patients' && (
            <PatientManagement 
              patients={patients} 
              errorMessage={errorMessage} 
              onSelectPatient={handleSelectPatient} 
            />
          )}

          {currentMenu === 'patient-detail' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto">
                <Main_viewer patientData={selectedPatient} />
              </div>
              <div className="w-[420px] border-l border-gray-800 bg-[#1C2541] p-4 overflow-y-auto flex-shrink-0">
                <PatientDetail patient={selectedPatient} />
              </div>
            </div>
          )}

          {currentMenu === 'consultation' && (
            <ConsultationView />
          )}

          {currentMenu === 'ai-diag' && (
            <div className="flex-1 p-6 text-white overflow-y-auto flex gap-6" style={{ backgroundColor: '#060B18' }}>
              <div className="flex-1 flex flex-col space-y-4">
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl">
                  <div className="border-b border-blue-800/40 pb-3 mb-3">
                    <h2 className="font-semibold text-sm text-white">AI 진단 분석 뷰어</h2>
                  </div>
                  <div className="h-64 rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner">
                    <img src={aiFile ? URL.createObjectURL(aiFile) : angioImage} alt="분석 대상" className="h-full w-full object-cover opacity-90" />
                  </div>
                </div>
              </div>

              {/* 우측 패널 영역 */}
              <div className="w-[380px] flex flex-col space-y-4 shrink-0">
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl">
                  <div className="border-b border-blue-800/40 pb-3 mb-3">
                    <h2 className="font-semibold text-sm text-white">AI 결과 패널</h2>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div
                      className={`rounded border border-dashed p-3 space-y-2 ${
                        isAiDragOver ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 bg-gray-800/40'
                      }`}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsAiDragOver(true) }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsAiDragOver(true) }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsAiDragOver(false) }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation(); setIsAiDragOver(false)
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
                      <p className="text-[11px] text-gray-500">여기로 이미지를 드래그하거나, 아래에서 파일을 선택하세요.</p>
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
                      {aiFile && <p className="text-gray-500 truncate">선택: {aiFile.name}</p>}
                    </div>
                    {aiError && <p className="text-red-400 font-medium">{aiError}</p>}
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
                          <p className="text-gray-200">Normal: {((aiResult.probabilities?.normal || 0) * 100).toFixed(1)}%</p>
                          <p className="text-gray-200">Stenosis: {((aiResult.probabilities?.stenosis || 0) * 100).toFixed(1)}%</p>
                        </div>
                      </>
                    ) : (
                      !aiLoading && <p className="text-gray-500">이미지를 업로드한 뒤 분석을 실행하세요.</p>
                    )}
                  </div>
                </div>

                <div>
                  <Xai_visualization 
                    overlayMode={overlayMode}
                    setOverlayMode={setOverlayMode}
                    heatmapOpacity={heatmapOpacity}
                    setHeatmapOpacity={setHeatmapOpacity}
                    confidenceThreshold={confidenceThreshold}
                    setConfidenceThreshold={setConfidenceThreshold}
                  />
                </div>

                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 shrink-0 shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-sm text-white">히트맵 / 박스 오버레이</h2>
                    <input
                      type="checkbox"
                      checked={heatmapToggle}
                      onChange={() => setHeatmapToggle(!heatmapToggle)}
                      className="cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-300">
                    <div className="h-20 rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner">
                      <img src={angioImage} alt="히트맵" className="h-full w-full object-cover opacity-75" />
                    </div>
                    <div className="h-20 rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner">
                      <img src={angioImage} alt="박스" className="h-full w-full object-cover opacity-75" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentMenu === 'bookmarks' && (
            <BookmarkView bookmarks={bookmarks} onDeleteBookmark={onDeleteBookmark} />
          )}
        </main>
      </div>
    </div>
  )
}