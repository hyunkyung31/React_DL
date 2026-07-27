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
  Video, FileBarChart, Settings, Square, Menu, X, UserCheck, RotateCcw, CheckCircle2, Upload 
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
  const [ecgModal, setEcgModal] = useState(null) // { patientId, ecgResult, objectUrl }
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
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-inner hover:bg-blue-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
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

  // XAI 시각화 상태 
  const [overlayMode, setOverlayMode] = useState('heatmap')
  const [heatmapOpacity, setHeatmapOpacity] = useState(50)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false)

  const viewerImageRef = useRef(null)
  const heatmapCanvasRef = useRef(null)
  const boundingBoxCanvasRef = useRef(null)
  const videoRef = useRef(null)
  
  // 모바일 반응형 사이드바 토글 상태
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // 영상 재생 및 뷰어 관련 상태
  const [currentFrame, setCurrentFrame] = useState(1)
  const [totalFrames] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x')
  const [selectedSeries, setSelectedSeries] = useState('Default Angio 01')

  // AI진단 (predict)
  const [aiFile, setAiFile] = useState(null)
  const [aiFileUrl, setAiFileUrl] = useState(null)
  const [aiFileType, setAiFileType] = useState('image')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [isMainDragOver, setIsMainDragOver] = useState(false)

  // AI 결과 신뢰도
  const confidenceScore = aiResult?.confidence != null
    ? Number((aiResult.confidence * 100).toFixed(1)) : null 

  // AI 결과 불확실도
  const uncertaintyScore = aiResult?.confidence != null
    ? Number(((1 - aiResult.confidence) * 100).toFixed(1)) : null

  // 실제 XAI 응답 우선, 없으면 Mock 사용
  const xaiData = useMemo(() => { return {
    showGradcam: aiResult?.show_gradcam ?? aiResult?.predicted_label === 'Stenosis',
    heatmapBase64: aiResult?.heatmap_base64 ?? null,
    overlayBase64: aiResult?.overlay_base64 ?? null,
    boundingBoxes: aiResult?.bounding_boxes ?? aiResult?.boxes ?? [{ id: 1, x: 120, y: 90, width: 150, height: 120, label: 'Stenosis', confidence: 0.94,},],}
  }, [aiResult])

  // 실제 YOLO Detection 결과
  const yoloDetections = aiResult?.detections ?? aiResult?.yolo_result?.detections ?? []


  // 뷰어 인터랙션 상태 (줌인, 줌아웃, 팬, 전체화면)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 })
  const viewerContainerRef = useRef(null)

  // ==========================================
  // [희욱 추가] Llama-3 XAI 및 Interactive BBox / Canvas 주석 상태
  // ==========================================
  const [selectedVessels, setSelectedVessels] = useState([])
  const [pciNeeded, setPciNeeded] = useState(false)
  const [aiImpressionText, setAiImpressionText] = useState('')
  const [canvasDrawMode, setCanvasDrawMode] = useState(null)
  const [canvasAnnotations, setCanvasAnnotations] = useState([]) 
  const [currentBBox, setCurrentBBox] = useState(null) 

  // Main_viewer 컴포넌트와 연동할 의사 커스텀 주석 상태 관리
  const [userAnnotations, setUserAnnotations] = useState([])

  // 비디오 첫 프레임(썸네일) 설정 및 끝 재생 처리
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = video.duration || 0; 
    };

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        const progress = video.currentTime / video.duration;
        const calculatedFrame = Math.min(totalFrames, Math.max(1, Math.floor(progress * totalFrames) + 1));
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [aiFileUrl, totalFrames]);

  // 하단 재생 버튼 상태와 실제 비디오 재생 동기화
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch((err) => console.log("재생 오류:", err))
    } else {
      video.pause()
    }
  }, [isPlaying])

  // Django 백엔드 환자 목록 연동
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

  // 자동 재생 타이머 (프레임 연동)
  useEffect(() => {
    if (!isPlaying) return
    const speedVal = parseFloat(playbackSpeed.replace('x', ''))
    const interval = 1000 / (10 * speedVal)
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

  const handleFrameChange = (newFrame) => {
    setCurrentFrame(newFrame);
    const video = videoRef.current;
    if (video && !isNaN(video.duration) && video.duration > 0) {
      const targetTime = ((newFrame - 1) / (totalFrames - 1)) * video.duration;
      video.currentTime = targetTime;
    }
  };

  // XAI Heatmap 렌더링
  useEffect(() => {
    const image = viewerImageRef.current
    const canvas = heatmapCanvasRef.current

    if (!image || !canvas || !isViewerImageLoaded) return

    if (!aiResult) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

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

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, imageWidth, imageHeight)

      if (overlayMode !== 'heatmap') return
      if (xaiData.heatmapBase64) return

      const opacity = heatmapOpacity / 100
      const drawHeatPoint = (centerX, centerY, radius, intensity = 1) => {
        const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        gradient.addColorStop(0,  `rgba(255, 0, 0, ${opacity * intensity})`)
        gradient.addColorStop(0.3, `rgba(255, 90, 0, ${opacity * intensity * 0.9})`)
        gradient.addColorStop(0.55, `rgba(255, 200, 0, ${opacity * intensity * 0.65})`)
        gradient.addColorStop(0.78, `rgba(170, 255, 0, ${opacity * intensity * 0.3})`)
        gradient.addColorStop(1, 'rgba(170, 255, 0, 0)')

        context.fillStyle = gradient
        context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)
      }

      drawHeatPoint(imageWidth * 0.53, imageHeight * 0.45, Math.min(imageWidth, imageHeight) * 0.24, 1)
      drawHeatPoint(imageWidth * 0.47, imageHeight * 0.40, Math.min(imageWidth, imageHeight) * 0.16, 0.65)
      drawHeatPoint(imageWidth * 0.59, imageHeight * 0.50, Math.min(imageWidth, imageHeight) * 0.14, 0.55)
    }

    drawHeatmap()
    window.addEventListener('resize', drawHeatmap)
    return () => window.removeEventListener('resize', drawHeatmap)
  }, [overlayMode, heatmapOpacity, isViewerImageLoaded, aiResult, xaiData.heatmapBase64])

  // Bounding Box 렌더링
  useEffect(() => {
    const image = viewerImageRef.current
    const canvas = boundingBoxCanvasRef.current

    if (!image || !canvas || !isViewerImageLoaded) return

    if (!aiResult) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

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

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, imageWidth, imageHeight)

      if (overlayMode !== 'boundingBox') return

      const scaleX = imageWidth / image.naturalWidth
      const scaleY = imageHeight / image.naturalHeight

      xaiData.boundingBoxes
        .filter((box) => Number(box.confidence ?? 0) * 100 >= confidenceThreshold)
        .forEach((box) => {
          const boxX = box.x * scaleX
          const boxY = box.y * scaleY
          const boxWidth = box.width * scaleX
          const boxHeight = box.height * scaleY
          const labelText = `${box.label} ${Math.round(box.confidence * 100)}%`

          context.strokeStyle = '#ef4444'
          context.lineWidth = 4
          context.strokeRect(boxX, boxY, boxWidth, boxHeight)

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
    return () => window.removeEventListener('resize', drawBoundingBoxes)
  }, [overlayMode, confidenceThreshold, isViewerImageLoaded, aiResult, xaiData.boundingBoxes])

  // 마우스 상호작용 핸들러
  const handleMouseDown = (e) => {
    if (!aiFileUrl) return
    const rect = viewerContainerRef.current.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    if (canvasDrawMode === 'bbox') {
      setIsDragging(true)
      setCurrentBBox({ startX, startY, width: 0, height: 0, frame: currentFrame })
      return
    }

    if (canvasDrawMode === 'text') {
      const textToDraw = prompt('Canvas에 표시할 임상 주석을 입력하세요:', 'LAD 75% 협착')
      if (textToDraw) {
        setCanvasAnnotations(prev => [
          ...prev, 
          { id: Date.now(), type: 'text', text: textToDraw, x: startX, y: startY, frame: currentFrame }
        ])
      }
      return
    }

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

    const rect = viewerContainerRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    if (canvasDrawMode === 'bbox' && currentBBox) {
      setCurrentBBox({
        ...currentBBox,
        width: currentX - currentBBox.startX,
        height: currentY - currentBBox.startY
      })
      return
    }

    const dx = e.clientX - dragStartRef.current.mouseX
    const dy = e.clientY - dragStartRef.current.mouseY
    setPosition({
      x: dragStartRef.current.imageX + dx,
      y: dragStartRef.current.imageY + dy
    })
  }

  const handleMouseUp = () => {
    if (canvasDrawMode === 'bbox' && currentBBox) {
      if (Math.abs(currentBBox.width) > 10 && Math.abs(currentBBox.height) > 10) {
        setCanvasAnnotations(prev => [
          ...prev,
          { id: Date.now(), type: 'bbox', ...currentBBox }
        ])
      }
      setCurrentBBox(null)
    }
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    if (!aiFileUrl) return
    e.preventDefault()
    const zoomIntensity = 0.15
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + zoomIntensity, 3))
    } else {
      setScale(prev => Math.max(prev - zoomIntensity, 0.5))
    }
  }

  const handleFileUpload = (file) => {
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setAiFileUrl(fileUrl)
    setAiFile(file)
    if (file.type.startsWith('video/')) {
      setAiFileType('video')
    } else {
      setAiFileType('image')
    }
    setIsPlaying(false)
    setCurrentFrame(1)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setAiResult(null)
    setAiError('')
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

  // 환자 선택 시 DB/GCS key_frame을 AI 뷰어에 로드
  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadKeyFrame() {
      if (!selectedPatient?.patient_id) return

      const access = localStorage.getItem('access')
      if (!access) return

      try {
        const res = await fetch(
          `http://34.80.83.7:8000/api/patients/${selectedPatient.patient_id}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        )
        if (!res.ok) throw new Error('patient detail failed')

        const data = await res.json()
        const keyFrameUrl = data.examinations?.[0]?.key_frame_url
        if (!keyFrameUrl) {
          console.warn('key_frame_url missing for', selectedPatient.patient_id)
          return
        }

        objectUrl = await fetchAuthBlobUrl(keyFrameUrl)
        if (cancelled) return

        const blobRes = await fetch(objectUrl)
        const blob = await blobRes.blob()
        const file = new File([blob], `${selectedPatient.patient_id}_key_frame.png`, {
          type: blob.type || 'image/png',
        })

        setIsViewerImageLoaded(false)
        setAiFileUrl(objectUrl)
        setAiFile(file)
        setAiFileType('image')
        setAiResult(null)
        setAiError('')
      } catch (err) {
        console.error('key_frame load failed', err)
      }
    }

    loadKeyFrame()

    return () => {
      cancelled = true
      // objectUrl은 다음 이미지로 교체될 때 뷰어가 쓰므로 여기서 revoke하지 않음
    }
  }, [selectedPatient])

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
      alert('분석할 이미지나 파일을 선택해주세요.')
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
      setAiResult(data)
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
                  {searchResults.map((patient) => {
                    const isSelected = selectedDiagPatient?.patient_id === patient.patient_id
                    return (
                      <div 
                        key={patient.patient_id}
                        onClick={() => handleToggleSelectPatient(patient)}
                        className={`p-2.5 cursor-pointer border-b border-blue-900/30 last:border-none transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-blue-900/60 border-l-4 border-l-blue-400' : 'hover:bg-blue-900/30'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-1">
                            {patient.patient_name}
                            {isSelected && <CheckCircle2 size={13} className="text-blue-400 inline" />}
                          </p>
                          <p className="text-xs text-gray-300">ID: {patient.patient_id} ({patient.age}세/{patient.gender})</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${isSelected ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-blue-600 text-white'}`}>
                          {isSelected ? '선택취소' : '선택'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <nav className="space-y-1">
              <button onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <LayoutDashboard size={15} /> 대시보드 홈
              </button>
              <button onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'patients' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Users size={15} /> 환자 목록 ({patientList.length})
              </button>
              <button onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'consultation' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Stethoscope size={15} /> 협진요청
              </button>
              <button onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'ai-diag' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
                <Cpu size={15} /> AI 진단
              </button>
              <button onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'bookmarks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-300 hover:bg-blue-900/30'}`}>
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
              {bookmarks.map((bm, index) => (
                <div key={bm.id || index} className="flex items-center justify-between rounded bg-blue-950/40 px-2 py-1 text-[11px] border border-blue-800/40 shadow-inner">
                  <span className="text-gray-200 truncate">{bm.note || bm.title}</span>
                  {onDeleteBookmark && (
                    <button onClick={() => onDeleteBookmark(bm.id)} className="text-gray-400 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleTriggerAddBookmark} className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-blue-700/60 py-1.5 text-[11px] font-medium text-blue-300 hover:bg-blue-900/40">
              <Plus size={12} /> 현재 화면 북마크 추가
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-blue-800/40 truncate">{healthStatus}</div>
        </aside>

        {/* 본문 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
            <main className="flex-1 p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ backgroundColor: '#060B18' }}>
              
              {/* [좌측 영역: 메인 뷰어 및 재생 컨트롤 통합] */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                
                {/* 환자 선택 및 업로드 바 */}
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 flex flex-col gap-2.5 shadow-xl">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsPatientModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700/60 rounded text-xs font-semibold shadow-inner"
                    >
                      <UserCheck size={14} className="text-blue-400" />
                      <span>{selectedDiagPatient ? '환자 변경' : '환자 검색'}</span>
                    </button>
                    {selectedDiagPatient ? (
                      <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 px-2.5 py-0.5 rounded text-xs text-white truncate">
                        <span className="truncate"><strong className="text-blue-300">{selectedDiagPatient.patient_name}</strong></span>
                        <button onClick={() => setSelectedDiagPatient(null)} className="text-red-400 hover:text-red-300 font-bold ml-1 shrink-0" title="선택 취소">✕</button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">선택 환자 없음</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-blue-200 border border-blue-800/50 rounded text-xs font-semibold cursor-pointer shadow-md">
                      <Upload size={13} />
                      <span>파일 업로드</span>
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e.target.files?.[0])} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleAiPredict}
                      disabled={aiLoading || !aiFile}
                      className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 shadow-md shadow-blue-600/30"
                    >
                      {aiLoading ? '분석 중...' : 'AI 분석'}
                    </button>
                  </div>
                </div>

                {/* Main_viewer 컴포넌트 장착부 (커스텀 주석 콜백 연동) */}
                <Main_viewer
                  patientData={selectedDiagPatient || selectedPatient}
                  aiFileUrl={aiFileUrl}
                  aiFileType={aiFileType}
                  aiResult={aiResult}
                  overlayMode={overlayMode}
                  confidenceThreshold={confidenceThreshold}
                  heatmapOpacity={heatmapOpacity}
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={setPlaybackSpeed}
                  onFrameChange={handleFrameChange}
                  userAnnotations={userAnnotations}
                  onAnnotationsChange={(updatedAnnotations) => setUserAnnotations(updatedAnnotations)}
                />

              </div>

              {/* [우측 영역: AI 결과 및 패널들] */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                
                {/* 패널 A: AI 결과 및 XAI / Mace Risk */}
                <div className="flex flex-col space-y-3">
                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 flex flex-col shadow-2xl">
                    <div className="border-b border-blue-800/40 pb-1.5 mb-2">
                      <h2 className="font-semibold text-xs text-white">AI 결과 패널</h2>
                    </div>
                    <div className="space-y-2 text-xs">
                      {aiError && (
                        <p className="text-red-400 font-medium">{aiError}</p>
                      )}
                      {aiResult ? (
                        <>
                          <div className="rounded border border-gray-800 bg-gray-800/40 p-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-400">진단 요약</span>
                              <span className="rounded bg-red-950/80 px-2 py-0.5 text-red-400 border border-red-800 font-medium">
                                신뢰도 {((aiResult.confidence || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white">
                              {aiResult.predicted_label === 'Stenosis' ? '협착 의심' : '정상'}
                            </p>
                          </div>
                          <div className="rounded border border-gray-800 bg-gray-800/40 p-2 space-y-1">
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
                          <p className="text-gray-500 text-[11px]">상단에서 파일을 업로드한 뒤 분석을 실행하세요.</p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 shadow-2xl">
                    <Xai_visualization 
                        overlayMode={overlayMode}
                        setOverlayMode={setOverlayMode}
                        heatmapOpacity={heatmapOpacity}
                        setHeatmapOpacity={setHeatmapOpacity}
                        confidenceThreshold={confidenceThreshold}
                        setConfidenceThreshold={setConfidenceThreshold}
                        confidenceScore={
                          aiResult?.confidence != null
                            ? Number((aiResult.confidence * 100).toFixed(1)) : null
                        }
                        uncertaintyScore={
                          aiResult?.confidence != null
                            ? Number(((1 - aiResult.confidence) * 100).toFixed(1)) : null
                        }
                        aiLoading={aiLoading}
                        hasAiResult={Boolean(aiResult)}
                    />
                  </div>

                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 shadow-2xl">
                    <Mace_risk />
                  </div>
                </div>

                {/* 패널 B: 판독 체크리스트, 임상 소견 및 EMR 확정 */}
                <div className="flex flex-col space-y-3">
                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 shadow-2xl">
                    <FindingChecklist 
                      selectedVessels={selectedVessels}
                      setSelectedVessels={setSelectedVessels}
                      pciNeeded={pciNeeded}
                      setPciNeeded={setPciNeeded}
                      onGenerateImpression={(text) => setAiImpressionText(text)}
                      onCanvasDrawMode={(mode) => setCanvasDrawMode(mode)}
                    />
                  </div>

                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 shadow-2xl">
                    <ImpressionTemplate 
                      externalImpression={aiImpressionText}
                      onImpressionChange={(val) => setAiImpressionText(val)}
                    />
                  </div>

                  <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3 shadow-2xl">
                    <EmrConfirmPanel
                      impression={aiImpressionText}
                      selectedVessels={selectedVessels}
                      pciNeeded={pciNeeded}
                    />
                  </div>
                </div>

              </div>

            </main>
          )}
        </div>
      </div>

      {/* 환자 검색, 선택 및 선택취소 모달 */}
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
                  onClick={() => setSelectedDiagPatient(null)}
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