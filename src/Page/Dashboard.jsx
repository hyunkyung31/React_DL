import { useEffect, useState, useRef, useMemo } from 'react'
import axios from 'axios'
import PatientDetail from './Patient_Detail'
import Main_viewer from '../Components/Main_viewer'
import ConsultationView from '../Components/Consultation_View'
import BookmarkView from '../Components/BoomarkView' 
import { 
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, 
  Trash2, Plus, Volume2, Download, FileText, Image as ImageIcon, Bookmark,
  ZoomIn, ZoomOut, Maximize2, Stethoscope, LayoutDashboard, Users, Cpu, 
  Video, FileBarChart, Settings, Square, Menu, X, UserCheck, RotateCcw, CheckCircle2, Upload, Heart, AlertTriangle 
} from 'lucide-react'
import angioImage from '../assets/angio_sample.png'
import { fetchAuthBlobUrl } from '../utils/authMedia'
import Xai_visualization from '../Components/Xai_visualization'
import Mace_risk from "../Components/Mace_risk"

// ==========================================
// [희욱 파트] 신규 컴포넌트 3종 Import
// ==========================================
import ImpressionTemplate from '../Components/ImpressionTemplate'
import FindingChecklist from '../Components/FindingChecklist'
import EmrConfirmPanel from '../Components/EmrConfirmPanel'
import Home from './Home'

// ==========================================
// 1. PatientManagement 컴포넌트
// ==========================================
export function PatientManagement({ patients, errorMessage, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')
  const [ecgModal, setEcgModal] = useState(null)
  const [ecgLoadingId, setEcgLoadingId] = useState(null)

  const openEcgModal = async (patient) => {
    if (!patient?.ecg_image_url) {
      alert('ECG 이미지가 없습니다. 생성/배포를 확인하세요.')
      return
    }
    setEcgLoadingId(patient.patient_id)
    try {
      const objectUrl = await fetchAuthBlobUrl(patient.ecg_image_url)
      setEcgModal({
        patientId: patient.patient_id,
        ecgResult: patient.ecg_result,
        objectUrl,
      })
    } catch (e) {
      console.error(e)
      alert('ECG 이미지를 불러오지 못했습니다.')
    } finally {
      setEcgLoadingId(null)
    }
  }

  const closeEcgModal = () => {
    if (ecgModal?.objectUrl) URL.revokeObjectURL(ecgModal.objectUrl)
    setEcgModal(null)
    setEcgLoadingId(null)
  }

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
                <th className="px-6 py-3 font-semibold">Troponin T</th>
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEcgModal(patient)
                        }}
                        disabled={ecgLoadingId === patient.patient_id}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-inner hover:bg-blue-800/85 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        title="ECG 이미지 보기"
                      >
                        {ecgLoadingId === patient.patient_id
                          ? '로딩...'
                          : (patient.ecg_result || '-')}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-200">
                      {patient.troponin_t_level != null && patient.troponin_t_level !== ''
                        ? `${patient.troponin_t_level} ng/L`
                        : '-'}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ecgModal?.objectUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeEcgModal}
        >
          <div
            className="bg-gray-950 border border-blue-800/50 rounded-xl max-w-5xl w-full p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">
                ECG — {ecgModal.patientId} ({ecgModal.ecgResult})
              </h3>
              <button
                type="button"
                onClick={closeEcgModal}
                className="text-gray-300 hover:text-white text-sm px-2 py-1"
              >
                닫기
              </button>
            </div>
            <img
              src={ecgModal.objectUrl}
              alt="12-lead ECG"
              className="w-full h-auto rounded bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">데모용 합성 12유도 이미지</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. Dashboard 메인 컴포넌트
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

  const [currentMenu, setCurrentMenu] = useState('ai-diag')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDiagPatient, setSelectedDiagPatient] = useState(null)
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [patientList, setPatientList] = useState(patients)
  const [modalSearchKeyword, setModalSearchKeyword] = useState('')
  const [isPatientLoading, setIsPatientLoading] = useState(false)

  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showBoundingBox, setShowBoundingBox] = useState(true)
  const [heatmapOpacity, setHeatmapOpacity] = useState(50)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false)

  const viewerImageRef = useRef(null)
  const heatmapCanvasRef = useRef(null)
  const boundingBoxCanvasRef = useRef(null)
  const videoRef = useRef(null)
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  const [currentFrame, setCurrentFrame] = useState(1)
  const [totalFrames] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x')
  const [selectedSeries, setSelectedSeries] = useState('Default Angio 01')

  const [aiFile, setAiFile] = useState(null)
  const [aiFileUrl, setAiFileUrl] = useState(null)
  const [aiFileType, setAiFileType] = useState('image')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')

  const xaiData = useMemo(() => { return {
    showGradcam: aiResult?.show_gradcam ?? aiResult?.predicted_label === 'Stenosis',
    heatmapBase64: aiResult?.heatmap_base64 ?? null,
    overlayBase64: aiResult?.overlay_base64 ?? null,
    boundingBoxes: aiResult?.bounding_boxes ?? aiResult?.boxes ?? [{ id: 1, x: 120, y: 90, width: 150, height: 120, label: 'Stenosis', confidence: 0.94,},],}
  }, [aiResult])

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const [selectedVessels, setSelectedVessels] = useState([])
  const [pciNeeded, setPciNeeded] = useState(false)
  const [aiImpressionText, setAiImpressionText] = useState('')
  const [canvasDrawMode, setCanvasDrawMode] = useState(null)
  const [userAnnotations, setUserAnnotations] = useState([])

  // 환자 목록 동기화
  useEffect(() => {
    if (patients && patients.length > 0) {
      setPatientList(patients)
      return
    }
    const fetchPatients = async () => {
      setIsPatientLoading(true)
      try {
        const accessToken = localStorage.getItem('access')
        const response = await axios.get('http://34.80.83.7:8000/api/patients/', {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
          },
        })
        const data = response.data
        if (Array.isArray(data)) {
          setPatientList(data)
        } else if (data && Array.isArray(data.results)) {
          setPatientList(data.results)
        }
      } catch (error) {
        console.error('환자 목록 불러오기 실패:', error)
      } finally {
        setIsPatientLoading(false)
      }
    }
    fetchPatients()
  }, [patients])

  // 환자 선택 시 DICOM/이미지 연동 로직
  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadPatientImage() {
      const target = selectedDiagPatient || selectedPatient
      if (!target?.patient_id) return

      const access = localStorage.getItem('access')
      if (!access) return

      try {
        const res = await fetch(
          `http://34.80.83.7:8000/api/patients/${target.patient_id}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        )
        if (!res.ok) throw new Error('patient detail failed')

        const data = await res.json()
        const imageUrl = data.examinations?.[0]?.key_frame_url || data.key_frame_url || data.image_url

        if (!imageUrl) {
          setAiFileUrl(null)
          setAiFile(null)
          setIsViewerImageLoaded(false)
          return
        }

        objectUrl = await fetchAuthBlobUrl(imageUrl)
        if (cancelled) return

        const blobRes = await fetch(objectUrl)
        const blob = await blobRes.blob()
        const file = new File([blob], `${target.patient_id}_image.png`, {
          type: blob.type || 'image/png',
        })

        setIsViewerImageLoaded(true)
        setAiFileUrl(objectUrl)
        setAiFile(file)
        setAiFileType('image')
        setAiResult(null)
        setAiError('')
      } catch (err) {
        console.error('환자 이미지 로드 실패:', err)
        setIsViewerImageLoaded(false)
      }
    }

    loadPatientImage()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selectedDiagPatient, selectedPatient])

  const handleFileUpload = (file) => {
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setAiFileUrl(fileUrl)
    setAiFile(file)
    setAiFileType(file.type.startsWith('video/') ? 'video' : 'image')
    setIsPlaying(false)
    setCurrentFrame(1)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setAiResult(null)
    setAiError('')
    setIsViewerImageLoaded(true)
  }

  const handleTriggerAddBookmark = () => {
    if (!onAddBookmark) {
      alert('북마크 기능을 사용할 수 없습니다. 다시 로그인해 주세요.')
      return
    }
    const patientId = selectedDiagPatient?.patient_id || selectedPatient?.patient_id
    if (!patientId) {
      alert('환자를 먼저 선택하세요')
      return
    }

    const minutes = String(Math.floor(currentFrame / 60 / 10)).padStart(2, '0')
    const seconds = String(Math.floor((currentFrame / 10) % 60)).padStart(2, '0')

    const bboxFromAi =
      aiResult && (aiResult.bbox || aiResult.box)
        ? [
            {
              id: 'ai-1',
              ...(aiResult.bbox || aiResult.box),
              label: aiResult.predicted_label || 'Stenosis',
              score: aiResult.confidence ?? null,
            },
          ]
        : []

    onAddBookmark({
      title: `프레임 ${currentFrame} 분석 지점`,
      patientId: patientId,
      note: `타임라인 ${minutes}:${seconds} 구간 확인`,
      frameNumber: currentFrame,
      examId: null,
      bboxData: bboxFromAi,
    })
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setSelectedDiagPatient(patient)
    setCurrentMenu('ai-diag')
    setIsSearchDropdownOpen(false)
    setSidebarSearch('')
    setIsMobileSidebarOpen(false)
  }

  const handleToggleSelectPatient = (patient) => {
    if (selectedDiagPatient?.patient_id === patient.patient_id) {
      setSelectedDiagPatient(null)
      setAiFileUrl(null)
      setAiFile(null)
      setIsViewerImageLoaded(false)
    } else {
      setSelectedDiagPatient(patient)
    }
  }

  const handleSidebarSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const keyword = sidebarSearch.trim()
      if (!keyword) {
        setSearchResults([])
        setIsSearchDropdownOpen(false)
        return
      }
      const results = patientList.filter(p => 
        (p.patient_name && p.patient_name.toLowerCase().includes(keyword.toLowerCase())) || 
        (p.patient_id && String(p.patient_id).toLowerCase().includes(keyword.toLowerCase()))
      )
      setSearchResults(results)
      setIsSearchDropdownOpen(true)
    }
  }

  const handleAiPredict = async () => {
    if (!aiFile) {
      alert('Error: 등록된 이미지가 없습니다. Dicom파일이나 영상파일을 업로드 후 분석을 실행하세요.')
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
      const response = await fetch('http://34.80.83.7:8000/api/ai/image-analyze/', {
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
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || `AI 분석 요청 실패 (${response.status})`)
      }
      const data = await response.json()
      const classification = data.classification || data
      const detection = data.detection || {}
      const detections = detection.detections || data.detections || []
      const boundingBoxes = detections.map((det, index) => {
        const box = det.bbox || det.box || det
        const x1 = box.x1 ?? box.x ?? (box.xyxy ? box.xyxy[0] : 0)
        const y1 = box.y1 ?? box.y ?? (box.xyxy ? box.xyxy[1] : 0)
        const x2 = box.x2 ?? ((box.x != null && box.width != null) ? box.x + box.width : (box.xyxy ? box.xyxy[2] : 0))
        const y2 = box.y2 ?? ((box.y != null && box.height != null) ? box.y + box.height : (box.xyxy ? box.xyxy[3] : 0))
        const norm = det.normalized_bbox
        return {
          id: det.detection_id || index + 1,
          x: norm ? norm[0] * (detection.image_width || 1) : x1,
          y: norm ? norm[1] * (detection.image_height || 1) : y1,
          width: norm ? (norm[2] - norm[0]) * (detection.image_width || 1) : Math.max(0, x2 - x1),
          height: norm ? (norm[3] - norm[1]) * (detection.image_height || 1) : Math.max(0, y2 - y2),
          label: det.class_name || det.label || 'Stenosis',
          confidence: det.confidence ?? 0,
        }
      })
      setAiResult({
        ...data,
        ...classification,
        predicted_label: classification.predicted_label ?? data.predicted_label,
        confidence: classification.confidence ?? data.confidence,
        probabilities: classification.probabilities ?? data.probabilities,
        show_gradcam: classification.show_gradcam ?? data.show_gradcam,
        heatmap_base64: classification.heatmap_base64 ?? data.heatmap_base64,
        overlay_base64: classification.overlay_base64 ?? data.overlay_base64,
        detections,
        bounding_boxes: boundingBoxes.length ? boundingBoxes : (data.bounding_boxes || data.boxes || []),
      })
    } catch (error) {
      console.error('AI 분석 오류:', error)
      setAiError(String(error))
    } finally {
      setAiLoading(false)
    }
  }

  const filteredModalPatients = patientList.filter(p => {
    const name = p.patient_name || ''
    const id = p.patient_id || ''
    const kw = modalSearchKeyword.toLowerCase().trim()
    return name.toLowerCase().includes(kw) || String(id).toLowerCase().includes(kw)
  })

  // 동적 MACE 위험도 계산 로직 (협착 개수, 환자 나이, 고혈압/당뇨 여부 기반 수식 계산)
  const activePatient = selectedDiagPatient || selectedPatient
  const currentStenosisCount = aiResult?.bounding_boxes?.length ?? activePatient?.stenosis_count ?? 1
  const currentAge = activePatient?.age ?? 67
  const hasHypertensionVal = activePatient?.has_hypertension ?? true
  const hasDiabetesVal = activePatient?.has_diabetes ?? true

  // 입력 요인에 따른 동적 MACE 위험도 계산 공식 적용
  const calculatedMaceRisk = Math.min(
    100,
    Math.max(
      0,
      (currentAge * 0.4) + (currentStenosisCount * 12) + (hasHypertensionVal ? 15 : 0) + (hasDiabetesVal ? 18 : 0) - 10
    )
  )
  const currentMaceRisk = aiResult?.mace_risk_score ?? activePatient?.mace_risk_score ?? calculatedMaceRisk
  const currentHypertension = hasHypertensionVal ? '있음' : '없음'
  const currentDiabetes = hasDiabetesVal ? '있음' : '없음'

  // MACE 위험도 단계 결정 (낮음 / 중간 / 높음)
  const maceCategory = currentMaceRisk < 30 ? '낮음 위험' : currentMaceRisk < 70 ? '중간 위험' : '높음 위험'
  const maceCategoryColor = currentMaceRisk < 30 ? 'text-emerald-400' : currentMaceRisk < 70 ? 'text-amber-400' : 'text-red-400'

  // 반원형 게이지 SVG 인디케이터 위치 계산
  const maceAngle = (currentMaceRisk / 100) * 180 - 90
  const maceRad = (maceAngle * Math.PI) / 180
  const gaugeCx = 75
  const gaugeCy = 70
  const gaugeR = 52
  const indicatorX = gaugeCx + gaugeR * Math.cos(maceRad)
  const indicatorY = gaugeCy + gaugeR * Math.sin(maceRad)

  return (
    <div className="flex flex-col h-screen overflow-hidden text-gray-100" style={{ backgroundColor: '#060B18' }}>
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-blue-800/40 bg-gray-900/70 backdrop-blur-md shrink-0 shadow-lg z-25">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-1 text-gray-300 hover:text-white rounded bg-gray-800 border border-blue-800/50"
          >
            {isMobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded shadow-lg shadow-blue-600/30">LOGO</div>
          <h1 className="text-white font-bold text-sm tracking-wide truncate">혈관조영술 AI 진단 시스템</h1>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="hidden sm:inline text-gray-300 hover:text-white cursor-pointer">알림</span>
          <span className="font-medium text-blue-200">{displayName} (의료진)</span>
          <button onClick={onLogout} className="text-red-400 hover:text-red-300 font-medium">로그아웃</button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 h-[calc(100vh-3rem)] overflow-hidden relative">
        {isMobileSidebarOpen && (
          <div onClick={() => setIsMobileSidebarOpen(false)} className="absolute inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" />
        )}

        {/* 사이드바 */}
        <aside className={`
          absolute md:relative inset-y-0 left-0 z-40 
          w-56 border-r border-blue-800/40 bg-gray-900/95 md:bg-gray-900/60 backdrop-blur-md 
          flex flex-col justify-between p-2.5 shrink-0 overflow-y-hidden
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="overflow-y-auto pr-0.5">
            <div className="mb-3 relative">
              <label className="text-[11px] font-semibold text-gray-300">전체 환자 빠른 검색</label>
              <input 
                type="text" 
                placeholder="이름/ID 입력 후 Enter" 
                value={sidebarSearch}
                onChange={(e) => {
                  setSidebarSearch(e.target.value)
                  if (isSearchDropdownOpen) setIsSearchDropdownOpen(false)
                }}
                onKeyDown={handleSidebarSearchKeyDown}
                className="w-full mt-1 px-2 py-1 bg-gray-900 border border-blue-800/50 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-inner"
              />

              {isSearchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-blue-800/60 rounded-lg shadow-2xl z-50 max-h-52 overflow-y-auto backdrop-blur-xl">
                  <div className="p-1.5 text-[11px] text-gray-300 border-b border-blue-800/40 flex justify-between items-center">
                    <span>검색 결과 ({searchResults.length})</span>
                    <button onClick={() => setIsSearchDropdownOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  {searchResults.map((patient) => {
                    const isSelected = selectedDiagPatient?.patient_id === patient.patient_id
                    return (
                      <div 
                        key={patient.patient_id}
                        onClick={() => handleToggleSelectPatient(patient)}
                        className={`p-2 cursor-pointer border-b border-blue-900/30 last:border-none transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-blue-900/60 border-l-4 border-l-blue-400' : 'hover:bg-blue-900/30'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-medium text-white flex items-center gap-1">
                            {patient.patient_name}
                            {isSelected && <CheckCircle2 size={12} className="text-blue-400 inline" />}
                          </p>
                          <p className="text-[10px] text-gray-300">ID: {patient.patient_id}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-blue-600 text-white'}`}>
                          {isSelected ? '취소' : '선택'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <nav className="space-y-1">
              <button onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${currentMenu === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <LayoutDashboard size={14} /> 대시보드 홈
              </button>
              <button onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${currentMenu === 'patients' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Users size={14} /> 환자 목록 ({patientList.length})
              </button>
              <button onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${currentMenu === 'consultation' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Stethoscope size={14} /> 협진요청
              </button>
              <button onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${currentMenu === 'ai-diag' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Cpu size={14} /> AI 진단
              </button>
              <button onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${currentMenu === 'bookmarks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Bookmark size={14} /> 북마크 관리
              </button>
            </nav>
          </div>

          <div className="mt-2 border-t border-blue-800/40 pt-2 shrink-0">
            <div className="flex items-center gap-1 mb-1">
              <Bookmark size={12} className="text-blue-400" />
              <span className="text-[10px] font-semibold text-gray-200">최근 북마크 ({bookmarks.length})</span>
            </div>
            <div className="space-y-1 mb-2 max-h-20 overflow-y-auto pr-1">
              {bookmarks.map((bm, index) => (
                <div key={bm.id || index} className="flex items-center justify-between rounded bg-blue-950/40 px-2 py-0.5 text-[10px] border border-blue-800/40 shadow-inner">
                  <span className="text-gray-200 truncate">{bm.note || bm.title}</span>
                  {onDeleteBookmark && (
                    <button onClick={() => onDeleteBookmark(bm.id)} className="text-gray-400 hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleTriggerAddBookmark} className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-blue-700/60 py-1 text-[10px] font-medium text-blue-300 hover:bg-blue-900/40">
              <Plus size={10} /> 현재 화면 북마크 추가
            </button>
            <div className="text-[9px] text-gray-400 mt-2 truncate">{healthStatus}</div>
          </div>
        </aside>

        {/* 본문 영역 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {currentMenu === 'dashboard' ? (
            <Home
              displayName={displayName}
              patients={patientList}
              onNavigate={(menu) => setCurrentMenu(menu)}
              onSelectPatient={handleSelectPatient}
            />
          ) : currentMenu === 'patient-detail' ? (
            <PatientDetail patient={selectedPatient} onBack={() => setCurrentMenu('patients')} />
          ) : currentMenu === 'patients' ? (
            <PatientManagement patients={patientList} errorMessage={errorMessage} onSelectPatient={handleSelectPatient} />
          ) : currentMenu === 'consultation' ? (
            <ConsultationView />
          ) : currentMenu === 'bookmarks' ? (
            <BookmarkView 
              bookmarks={bookmarks} 
              onDeleteBookmark={onDeleteBookmark} 
              onSelectBookmark={(item) => console.log('선택된 북마크 항목:', item)} 
            />
          ) : (
            <main className="flex-1 p-1.5 h-full overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-1.5" style={{ backgroundColor: '#060B18' }}>
              
              {/* [좌측 메인 뷰어 영역 - 6컬럼] */}
              <div className="lg:col-span-6 flex flex-col h-full space-y-1.5 overflow-hidden">
                
                {/* 환자 선택 및 업로드 바 (드래그 앤 드롭 영역 포함) */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0])
                    }
                  }}
                  className="rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 flex flex-col gap-1 shadow-xl shrink-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsPatientModalOpen(true)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700/60 rounded text-[10px] font-semibold shadow-inner"
                    >
                      <UserCheck size={12} className="text-blue-400" />
                      <span>{selectedDiagPatient ? '환자 변경' : '환자 검색'}</span>
                    </button>
                    {selectedDiagPatient ? (
                      <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 px-2 py-0.5 rounded text-[10px] text-white truncate">
                        <span className="truncate"><strong className="text-blue-300">{selectedDiagPatient.patient_name}</strong></span>
                        <button onClick={() => {
                          setSelectedDiagPatient(null)
                          setAiFileUrl(null)
                          setAiFile(null)
                          setIsViewerImageLoaded(false)
                        }} className="text-red-400 hover:text-red-300 font-bold ml-1 shrink-0" title="선택 취소">✕</button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">선택 환자 없음 (파일을 드래그하여 올리세요)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-blue-200 border border-blue-800/50 rounded text-[10px] font-semibold cursor-pointer shadow-md">
                      <Upload size={11} />
                      <span>파일 업로드 (또는 드래그 앤 드롭)</span>
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e.target.files?.[0])} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleAiPredict}
                      disabled={aiLoading}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold disabled:opacity-50 shadow-md shadow-blue-600/30"
                    >
                      {aiLoading ? '분석 중...' : 'AI 분석'}
                    </button>
                  </div>
                </div>

                {/* Main_viewer 영역 */}
                <div className="flex-1 overflow-hidden flex flex-col relative">
                  {!isViewerImageLoaded && (
                    <div className="absolute inset-0 z-10 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                      <AlertTriangle size={32} className="text-amber-400 mb-2" />
                      <p className="text-xs font-bold text-white mb-1">Error: 등록된 이미지가 없습니다.</p>
                      <p className="text-[10px] text-gray-400">Dicom파일이나 영상파일을 업로드 후 분석을 실행하세요.</p>
                    </div>
                  )}
                  <Main_viewer
                    patientData={selectedDiagPatient || selectedPatient}
                    aiFileUrl={aiFileUrl}
                    aiFileType={aiFileType}
                    aiResult={aiResult}
                    showHeatmap={showHeatmap}
                    showBoundingBox={showBoundingBox}
                    confidenceThreshold={confidenceThreshold}
                    heatmapOpacity={heatmapOpacity}
                    currentFrame={currentFrame}
                    totalFrames={totalFrames}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onFrameChange={setCurrentFrame}
                    userAnnotations={userAnnotations}
                    onAnnotationsChange={setUserAnnotations}
                  />
                </div>

              </div>

              {/* [중앙 패널 영역 - 3컬럼] */}
              <div className="lg:col-span-3 flex flex-col h-full space-y-1.5 overflow-hidden">
                
                {/* AI 결과 패널 */}
                <div className="flex-[0.55] flex flex-col rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl overflow-hidden">
                  <div className="border-b border-blue-800/40 pb-0.5 mb-1 shrink-0">
                    <h2 className="font-semibold text-[11px] text-white">AI 결과 패널</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 text-[10px] pr-0.5">
                    {aiError && <p className="text-red-400 font-medium">{aiError}</p>}
                    {aiResult ? (
                      <>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-1.5 flex justify-between items-center">
                          <div>
                            <span className="text-gray-400 text-[9px] block">진단 요약</span>
                            <span className="text-[11px] font-bold text-white">
                              {String(aiResult.predicted_label || '').toLowerCase() === 'stenosis' ? '협착 의심' : (aiResult.predicted_label || '정상')}
                            </span>
                          </div>
                          {aiResult.confidence != null && (
                            <span className="rounded bg-red-950/80 px-2 py-0.5 text-red-400 border border-red-800 font-medium text-[9px]">
                              신뢰도 {(aiResult.confidence * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-1.5">
                          <span className="text-gray-400 text-[9px] block mb-0.5">확률</span>
                          <div className="text-[10px] space-y-0.5 font-medium text-gray-200">
                            <div className="flex justify-between">
                              <span>Normal:</span>
                              <span className="font-mono">
                                {aiResult.probabilities?.normal != null ? `${(aiResult.probabilities.normal * 100).toFixed(1)}%` : aiResult.confidence != null && String(aiResult.predicted_label || '').toLowerCase() !== 'stenosis' ? `${(aiResult.confidence * 100).toFixed(1)}%` : '94.9%'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stenosis:</span>
                              <span className="font-mono">
                                {aiResult.probabilities?.stenosis != null ? `${(aiResult.probabilities.stenosis * 100).toFixed(1)}%` : aiResult.confidence != null && String(aiResult.predicted_label || '').toLowerCase() === 'stenosis' ? `${(aiResult.confidence * 100).toFixed(1)}%` : '5.1%'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-2 text-gray-500 text-[10px]">
                        {aiLoading ? 'AI 분석 중입니다...' : '상단에서 파일을 업로드한 뒤 분석을 실행하세요.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* XAI 시각화 영역 */}
                <div className="flex-[1.75] flex flex-col rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-0.5">
                    <Xai_visualization 
                        showHeatmap={showHeatmap}
                        setShowHeatmap={setShowHeatmap}
                        showBoundingBox={showBoundingBox}
                        setShowBoundingBox={setShowBoundingBox}
                        heatmapOpacity={heatmapOpacity}
                        setHeatmapOpacity={setHeatmapOpacity}
                        confidenceThreshold={confidenceThreshold}
                        setConfidenceThreshold={setConfidenceThreshold}
                        confidenceScore={aiResult?.confidence != null ? Number((aiResult.confidence * 100).toFixed(1)) : null}
                        uncertaintyScore={aiResult?.confidence != null ? Number(((1 - aiResult.confidence) * 100).toFixed(1)) : null}
                        aiLoading={aiLoading}
                        hasAiResult={Boolean(aiResult)}
                    />
                  </div>
                </div>

                {/* MACE 위험도 영역 */}
                <div className="flex-[1.15] flex flex-col rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl overflow-hidden justify-between">
                  <div className="shrink-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-white font-bold text-[10px]">
                        <Heart size={11} className="text-red-400 fill-red-400" />
                        <span>3년 내 MACE 위험도 예측</span>
                      </div>
                      <span className="px-1.5 py-0.2 bg-amber-500/25 border border-amber-500/50 text-amber-300 text-[8px] font-bold rounded-full">
                        MACE Beta
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-300 leading-tight">
                      협착 개수, 환자 나이, 기저질환을 기반으로 위험도를 제공합니다.
                    </p>
                  </div>

                  <div className="bg-gray-950/60 border border-blue-900/40 rounded p-1 shrink-0 flex flex-col items-center relative">
                    <span className="text-[9px] font-semibold text-gray-300 mb-0.5">심혈관 사건 및 사망 위험도</span>
                    <svg width="150" height="65" className="overflow-visible my-0.5">
                      <defs>
                        <linearGradient id="maceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 15 60 A 55 55 0 0 1 135 60"
                        fill="none"
                        stroke="url(#maceGradient)"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={indicatorX}
                        cy={indicatorY + 10}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#1F2937"
                        strokeWidth="2"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="text-center -mt-1 mb-0.5">
                      <span className="text-xs font-extrabold text-white">
                        {currentMaceRisk.toFixed(1)}%
                      </span>
                      <span className={`text-[9px] font-bold ml-1 ${maceCategoryColor}`}>{maceCategory}</span>
                    </div>
                    <div className="w-full flex justify-between px-2 text-[8px] text-gray-400 border-t border-gray-800 pt-0.5">
                      <span>낮음<br/>0%</span>
                      <span className="text-center">중간<br/>50%</span>
                      <span className="text-right">높음<br/>100%</span>
                    </div>
                  </div>

                  <div className="shrink-0 space-y-1">
                    <div className="flex items-center gap-1 text-white font-semibold text-[9px]">
                      <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      <span>예측 입력 요인</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <div className="bg-gray-950/60 border border-blue-900/40 rounded p-0.5 text-center">
                        <span className="text-[8px] text-gray-400 block">협착 개수</span>
                        <span className="text-[10px] font-bold text-white">{currentStenosisCount}개</span>
                      </div>
                      <div className="bg-gray-950/60 border border-blue-900/40 rounded p-0.5 text-center">
                        <span className="text-[8px] text-gray-400 block">환자 나이</span>
                        <span className="text-[10px] font-bold text-white">{currentAge}세</span>
                      </div>
                      <div className="bg-gray-950/60 border border-blue-900/40 rounded p-0.5 text-center">
                        <span className="text-[8px] text-gray-400 block">고혈압</span>
                        <span className="text-[10px] font-bold text-white">{currentHypertension}</span>
                      </div>
                      <div className="bg-gray-950/60 border border-blue-900/40 rounded p-0.5 text-center">
                        <span className="text-[8px] text-gray-400 block">당뇨병</span>
                        <span className="text-[10px] font-bold text-white">{currentDiabetes}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* [우측 패널 영역 - 3컬럼 확장]: 판독 소견 박스 높이를 대폭 늘림 */}
              <div className="lg:col-span-3 flex flex-col h-full space-y-1 overflow-hidden pr-0.5">
                <div className="rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl shrink-0">
                  <FindingChecklist 
                    selectedVessels={selectedVessels}
                    setSelectedVessels={setSelectedVessels}
                    pciNeeded={pciNeeded}
                    setPciNeeded={setPciNeeded}
                    onGenerateImpression={(text) => setAiImpressionText(text)}
                    onCanvasDrawMode={setCanvasDrawMode}
                  />
                </div>

                {/* 최종 판독 문구 영역: flex 비중을 높여 (flex-[1.8]) 박스 크기를 넓게 확보 */}
                <div className="rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl flex-[1.8] flex flex-col overflow-hidden">
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <ImpressionTemplate 
                      externalImpression={aiImpressionText}
                      onImpressionChange={setAiImpressionText}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-1.5 shadow-xl shrink-0">
                  <EmrConfirmPanel
                    impression={aiImpressionText}
                    selectedVessels={selectedVessels}
                    pciNeeded={pciNeeded}
                  />
                </div>
              </div>

            </main>
          )}
        </div>
      </div>

      {/* 환자 검색, 선택 모달 */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-900 border border-blue-800/60 rounded-xl w-[550px] max-h-[85vh] flex flex-col shadow-2xl p-5 text-white">
            <div className="flex justify-between items-center border-b border-blue-800/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-blue-300">전체 환자 검색 및 선택</h3>
                {selectedDiagPatient && (
                  <span className="text-[11px] bg-blue-900/80 px-2 py-0.5 rounded text-blue-200 border border-blue-700">
                    현재 선택됨: <strong>{selectedDiagPatient.patient_name}</strong>
                  </span>
                )}
              </div>
              <button onClick={() => setIsPatientModalOpen(false)} className="text-gray-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="mb-3 flex gap-2">
              <input 
                type="text"
                placeholder="환자 이름 또는 ID 입력 후 검색..."
                value={modalSearchKeyword}
                onChange={(e) => setModalSearchKeyword(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-950 border border-blue-800/50 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-inner"
              />
              {selectedDiagPatient && (
                <button
                  onClick={() => {
                    setSelectedDiagPatient(null)
                    setAiFileUrl(null)
                    setAiFile(null)
                    setIsViewerImageLoaded(false)
                  }}
                  className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold transition-colors"
                >
                  선택 해제
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
              {isPatientLoading ? (
                <p className="text-center text-xs text-gray-400 py-8">환자 목록을 불러오는 중...</p>
              ) : filteredModalPatients.length > 0 ? (
                filteredModalPatients.map((patient) => {
                  const isSelected = selectedDiagPatient?.patient_id === patient.patient_id
                  return (
                    <div 
                      key={patient.patient_id}
                      onClick={() => handleToggleSelectPatient(patient)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-blue-900/40 border-blue-400 ring-1 ring-blue-500 shadow-lg' 
                          : 'bg-gray-950/60 border-blue-900/40 hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-400' : 'border-gray-600 bg-gray-900'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                            {patient.patient_name} 
                            <span className="text-xs text-gray-400 font-normal">({patient.gender} / {patient.age}세)</span>
                          </p>
                          <p className="text-xs text-blue-300 mt-0.5">ID: {patient.patient_id} | 진단 상태: {patient.diagnosis || '진단 대기'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded font-medium shadow transition-colors ${
                        isSelected ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}>
                        {isSelected ? '선택 취소' : '선택'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-xs text-gray-400 py-8">검색된 환자가 없습니다.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-blue-800/40 flex justify-between items-center">
              <span className="text-[11px] text-gray-400">
                {selectedDiagPatient ? `선택된 환자: ${selectedDiagPatient.patient_name}` : '환자를 선택해주세요.'}
              </span>
              <button onClick={() => setIsPatientModalOpen(false)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow">
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}