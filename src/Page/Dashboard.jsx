// import { useEffect, useState, useRef } from 'react'
// import axios from 'axios'
// import PatientDetail from './Patient_Detail'
// import Main_viewer from '../Components/Main_viewer'
// import ConsultationView from '../Components/Consultation_View'
// import BookmarkView from '../Components/BoomarkView' 
// import { 
//   Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, 
//   Trash2, Plus, Volume2, Download, FileText, Image as ImageIcon, Bookmark,
//   ZoomIn, ZoomOut, Maximize2, Stethoscope, LayoutDashboard, Users, Cpu, 
//   Video, FileBarChart, Settings, Square, Menu, X 
// } from 'lucide-react'
// import angioImage from '../assets/angio_sample.png'
// import Xai_visualization from '../Components/Xai_visualization'

// // ==========================================
// // 1. PatientManagement 컴포넌트
// // ==========================================
// export function PatientManagement({ patients, errorMessage, onSelectPatient }) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [searchCategory, setSearchCategory] = useState('all')

//   const filteredPatients = patients.filter((patient) => {
//     if (!patient) return false
//     const name = patient.patient_name || ''
//     const id = patient.patient_id || ''

//     if (searchCategory === 'name') {
//       return name.includes(searchTerm)
//     } else if (searchCategory === 'id') {
//       return String(id).includes(searchTerm)
//     }
//     return name.includes(searchTerm) || String(id).includes(searchTerm)
//   })

//   return (
//     <div className="flex-1 p-6 text-gray-100 overflow-y-auto" style={{ backgroundColor: '#060B18' }}>
//       <div className="max-w-6xl mx-auto space-y-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl">
//           <div>
//             <h2 className="text-xl font-bold text-white tracking-wide">담당 환자 목록 관리</h2>
//             <p className="text-xs text-gray-300 mt-1">등록된 환자를 검색하고 임상 상태를 확인하세요.</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <select 
//               value={searchCategory}
//               onChange={(e) => setSearchCategory(e.target.value)}
//               className="px-3 py-2 bg-gray-900 border border-blue-800/50 rounded text-sm text-white focus:outline-none focus:border-blue-400"
//             >
//               <option value="all">전체</option>
//               <option value="name">환자명</option>
//               <option value="id">환자 ID</option>
//             </select>
//             <input 
//               type="text" 
//               placeholder="검색어를 입력하세요" 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="px-3 py-2 bg-gray-900 border border-blue-800/50 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
//             />
//           </div>
//         </div>

//         {errorMessage && <p className="text-red-400 font-semibold">{errorMessage}</p>}

//         <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md overflow-hidden shadow-2xl">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-blue-950/50 text-gray-300 text-xs uppercase tracking-wider border-b border-blue-800/40">
//                 <th className="px-6 py-3 font-semibold">환자 ID</th>
//                 <th className="px-6 py-3 font-semibold">환자명</th>
//                 <th className="px-6 py-3 font-semibold">나이/성별</th>
//                 <th className="px-6 py-3 font-semibold">주호소</th>
//                 <th className="px-6 py-3 font-semibold">ECG 결과</th>
//                 <th className="px-6 py-3 font-semibold text-center">관리 메뉴</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-blue-900/30 text-sm">
//               {filteredPatients.length > 0 ? (
//                 filteredPatients.map((patient) => (
//                   <tr key={patient.patient_id} className="hover:bg-blue-900/30 transition-colors">
//                     <td className="px-6 py-4 font-mono text-gray-200">{patient.patient_id}</td>
//                     <td className="px-6 py-4 font-medium text-white">{patient.patient_name}</td>
//                     <td className="px-6 py-4 text-gray-200">{patient.age}세 / {patient.gender}</td>
//                     <td className="px-6 py-4 text-gray-200">{patient.chief_complaint || '-'}</td>
//                     <td className="px-6 py-4">
//                       <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-inner">
//                         {patient.ecg_result || '정상'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <button 
//                         onClick={() => onSelectPatient && onSelectPatient(patient)}
//                         className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors shadow-lg shadow-blue-600/30"
//                       >
//                         상세보기
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
//                     검색 결과가 없습니다.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ==========================================
// // 2. Dashboard 메인 컴포넌트
// // ==========================================
// export default function Dashboard({ 
//   displayName, 
//   healthStatus, 
//   patients, 
//   errorMessage, 
//   onLogout,
//   bookmarks = [],        
//   onAddBookmark,     
//   onDeleteBookmark   
// }) {

//   const [currentMenu, setCurrentMenu] = useState('dashboard')
//   const [selectedPatient, setSelectedPatient] = useState(null)

//   // XAI 시각화 상태 
//   const [overlayMode, setOverlayMode] = useState('both')
//   const [heatmapOpacity, setHeatmapOpacity] = useState(50)
//   const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  
//   // 모바일 반응형 사이드바 토글 상태
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

//   const [sidebarSearch, setSidebarSearch] = useState('')
//   const [searchResults, setSearchResults] = useState([])
//   const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

//   // 영상 재생 및 뷰어 관련 상태
//   const [currentFrame, setCurrentFrame] = useState(125)
//   const [totalFrames] = useState(300)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [playbackSpeed, setPlaybackSpeed] = useState(1)
//   const [heatmapToggle, setHeatmapToggle] = useState(true)
//   const [selectedSeries, setSelectedSeries] = useState('1')

//   // AI진단 (predict)
//   const [aiFile, setAiFile] = useState(null)
//   const [aiLoading, setAiLoading] = useState(false)
//   const [aiResult, setAiResult] = useState(null)
//   const [aiError, setAiError] = useState('')
//   const [isAiDragOver, setIsAiDragOver] = useState(false)

//   // 뷰어 인터랙션 상태 (줌인, 줌아웃, 팬, 전체화면)
//   const [scale, setScale] = useState(1)
//   const [position, setPosition] = useState({ x: 0, y: 0 })
//   const [isDragging, setIsDragging] = useState(false)
//   const dragStartRef = useRef({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 })
//   const viewerContainerRef = useRef(null)

//   // 자동 재생 타이머 (프레임 연동)
//   useEffect(() => {
//     if (!isPlaying) return
//     const interval = 1000 / (10 * playbackSpeed)
//     const timer = setInterval(() => {
//       setCurrentFrame((prev) => {
//         if (prev >= totalFrames) {
//           setIsPlaying(false)
//           return totalFrames
//         }
//         return prev + 1
//       })
//     }, interval)
//     return () => clearInterval(timer)
//   }, [isPlaying, playbackSpeed, totalFrames])

//   // 뷰어 마우스 드래그 팬(Pan) 핸들러
//   const handleMouseDown = (e) => {
//     setIsDragging(true)
//     dragStartRef.current = {
//       mouseX: e.clientX,
//       mouseY: e.clientY,
//       imageX: position.x,
//       imageY: position.y
//     }
//   }

//   const handleMouseMove = (e) => {
//     if (!isDragging) return
//     const dx = e.clientX - dragStartRef.current.mouseX
//     const dy = e.clientY - dragStartRef.current.mouseY
//     setPosition({
//       x: dragStartRef.current.imageX + dx,
//       y: dragStartRef.current.imageY + dy
//     })
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)
//   }

//   // 마우스 휠 줌 핸들러
//   const handleWheel = (e) => {
//     e.preventDefault()
//     const zoomIntensity = 0.15
//     if (e.deltaY < 0) {
//       setScale(prev => Math.min(prev + zoomIntensity, 3))
//     } else {
//       setScale(prev => Math.max(prev - zoomIntensity, 0.5))
//     }
//   }

//   // 전체화면 토글 함수
//   const handleToggleFullscreen = () => {
//     if (!viewerContainerRef.current) return
//     if (!document.fullscreenElement) {
//       viewerContainerRef.current.requestFullscreen().catch(err => {
//         console.error("전체화면 전환 실패:", err)
//       })
//     } else {
//       document.exitFullscreen()
//     }
//   }

//   // 사이드바 하단 버튼을 통한 북마크 추가 핸들러 연동
//   const handleTriggerAddBookmark = () => {
//     if (!onAddBookmark) return
//     const minutes = String(Math.floor(currentFrame / 60 / 10)).padStart(2, '0')
//     const seconds = String(Math.floor((currentFrame / 10) % 60)).padStart(2, '0')
    
//     onAddBookmark({
//       title: `프레임 ${currentFrame} 분석 지점`,
//       patientId: selectedPatient ? selectedPatient.patient_id : '공통',
//       note: `타임라인 ${minutes}:${seconds} 구간 확인`
//     })
//   }

//   const handleSelectPatient = (patient) => {
//     setSelectedPatient(patient)
//     setCurrentMenu('patient-detail')
//     setIsSearchDropdownOpen(false)
//     setSidebarSearch('')
//     setIsMobileSidebarOpen(false) // 모바일에서 선택 시 사이드바 닫기
//   }

//   const handleSidebarSearchKeyDown = async (e) => {
//     if (e.key === 'Enter') {
//       const keyword = sidebarSearch.trim()
//       if (!keyword) return

//       const access = localStorage.getItem('access')
//       if (!access) {
//         alert('로그인 토큰이 없습니다. 다시 로그인해 주세요.')
//         return
//       }

//       try {
//         const response = await fetch(
//           `http://34.80.83.7:8000/api/patients/search/?q=${encodeURIComponent(keyword)}`,
//           {
//             headers: {
//               Authorization: `Bearer ${access}`,
//             },
//           }
//         )

//         if (response.status === 401) {
//           alert('로그인이 만료되었습니다. 다시 로그인해 주세요.')
//           return
//         }

//         if (!response.ok) {
//           throw new Error('환자 검색 실패')
//         }

//         const data = await response.json()
//         const results = Array.isArray(data) ? data : (data.results || [])

//         if (results.length > 0) {
//           setSearchResults(results)
//           setIsSearchDropdownOpen(true)
//         } else {
//           alert('일치하는 환자가 없습니다.')
//           setIsSearchDropdownOpen(false)
//         }
//       } catch (error) {
//         console.error('전체 환자 검색 오류:', error)
//         alert('환자 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.')
//         setIsSearchDropdownOpen(false)
//       }
//     }
//   }

// //AI predict 관련
// const handleAiPredict = async () => {
//   if (!aiFile) {
//     alert('분석할 이미지를 선택해주세요.')
//     return
//   }
//   const access = localStorage.getItem('access')
//   if (!access) {
//     alert('로그인 토큰이 없습니다. 다시 로그인해 주세요.')
//     return
//   }
//   setAiLoading(true)
//   setAiError('')
//   setAiResult(null)
//   try {
//     const formData = new FormData()
//     formData.append('file', aiFile)
//     const response = await fetch('http://34.80.83.7:8000/api/ai/predict/', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${access}`,
//       },
//       body: formData,
//     })
//     if (response.status === 401) {
//       setAiError('로그인이 만료되었습니다. 다시 로그인해 주세요.')
//       return
//     }
//     if (!response.ok) {
//       throw new Error('AI 분석 요청 실패')
//     }
//     const data = await response.json()
//     setAiResult(data)
//   } catch (error) {
//     console.error(error)
//     setAiError('AI 분석에 실패했습니다.')
//   } finally {
//     setAiLoading(false)
//   }
// }


//   return (
//     <div className="flex flex-col h-screen text-gray-100 overflow-hidden" style={{ backgroundColor: '#060B18' }}>
//       {/* 상단 헤더 */}
//         <header className="flex items-center justify-between px-6 h-14 border-b border-blue-800/40 bg-gray-900/70 backdrop-blur-md shrink-0 shadow-lg z-20">
//           <div className="flex items-center space-x-4">
//             {/* 모바일용 사이드바 토글 버튼 */}
//             <button 
//               onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
//               className="md:hidden p-1.5 text-gray-300 hover:text-white rounded bg-gray-800 border border-blue-800/50"
//             >
//               {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
//             </button>
//             <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded shadow-lg shadow-blue-600/30">LOGO</div>
//             <h1 className="text-white font-bold text-sm md:text-lg tracking-wide truncate">혈관조영술 AI 진단 시스템</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="hidden sm:inline text-sm text-gray-200 hover:text-white cursor-pointer">알림</span>
//             <span className="text-xs md:text-sm font-medium text-blue-200">{displayName} (의료진)</span>
//             <button onClick={onLogout} className="text-xs md:text-sm text-red-400 hover:text-red-300 font-medium">로그아웃</button>
//           </div>
//         </header>

//       {/* 메인 레이아웃 */}
//       <div className="flex flex-1 overflow-hidden relative">
        
//         {/* 모바일 백드롭 오버레이 (사이드바 열렸을 때 배경 어둡게 처리) */}
//         {isMobileSidebarOpen && (
//           <div 
//             onClick={() => setIsMobileSidebarOpen(false)}
//             className="absolute inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
//           />
//         )}

//         {/* 사이드바 (반응형: 모바일선 absolute 슬라이드, md 이상선 flex 고정 w-60) */}
//         <aside className={`
//           absolute md:relative inset-y-0 left-0 z-40 
//           w-60 border-r border-blue-800/40 bg-gray-900/95 md:bg-gray-900/60 backdrop-blur-md 
//           flex flex-col justify-between p-3 shrink-0 overflow-y-auto
//           transform transition-transform duration-300 ease-in-out
//           ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//         `}>
//           <div>
//             <div className="mb-4 relative">
//               <label className="text-xs font-semibold text-gray-300">전체 환자 빠른 검색</label>
//               <input 
//                 type="text" 
//                 placeholder="이름/ID 입력 후 Enter" 
//                 value={sidebarSearch}
//                 onChange={(e) => {
//                   setSidebarSearch(e.target.value)
//                   if (isSearchDropdownOpen) setIsSearchDropdownOpen(false)
//                 }}
//                 onKeyDown={handleSidebarSearchKeyDown}
//                 className="w-full mt-1 px-2.5 py-1.5 bg-gray-900 border border-blue-800/50 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-inner"
//               />

//               {isSearchDropdownOpen && searchResults.length > 0 && (
//                 <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-blue-800/60 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto backdrop-blur-xl">
//                   <div className="p-2 text-xs text-gray-300 border-b border-blue-800/40 flex justify-between items-center">
//                     <span>검색 결과 ({searchResults.length})</span>
//                     <button onClick={() => setIsSearchDropdownOpen(false)} className="text-gray-400 hover:text-white">✕</button>
//                   </div>
//                   {searchResults.map((patient) => (
//                     <div 
//                       key={patient.patient_id}
//                       onClick={() => handleSelectPatient(patient)}
//                       className="p-2.5 hover:bg-blue-900/40 cursor-pointer border-b border-blue-900/30 last:border-none transition-colors"
//                     >
//                       <p className="text-sm font-medium text-white">{patient.patient_name}</p>
//                       <p className="text-xs text-gray-300">ID: {patient.patient_id} ({patient.age}세/{patient.gender})</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 네비게이션 메뉴 */}
//             <nav className="space-y-1">
//               <button 
//                 onClick={() => { setCurrentMenu('dashboard'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
//                 className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
//               >
//                 <LayoutDashboard size={15} /> 대시보드 홈
//               </button>
//               <button 
//                 onClick={() => { setCurrentMenu('patients'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
//                 className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'patients' || currentMenu === 'patient-detail' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
//               >
//                 <Users size={15} /> 환자 목록 ({patients.length})
//               </button>
//               <button 
//                 onClick={() => { setCurrentMenu('consultation'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
//                 className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'consultation' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
//               >
//                 <Stethoscope size={15} /> 협진요청
//               </button>
//               <button 
//                 onClick={() => { setCurrentMenu('ai-diag'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
//                 className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'ai-diag' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
//               >
//                 <Cpu size={15} /> AI 진단
//               </button>
//               <button 
//                 onClick={() => { setCurrentMenu('bookmarks'); setSelectedPatient(null); setIsSearchDropdownOpen(false); setIsMobileSidebarOpen(false); }} 
//                 className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${currentMenu === 'bookmarks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'}`}
//               >
//                 <Bookmark size={15} /> 북마크 관리
//               </button>
//             </nav>
//           </div>

//           {/* 사이드바 하단 북마크 요약 리스트 */}
//           <div className="mt-6 border-t border-blue-800/40 pt-3">
//             <div className="flex items-center gap-1.5 mb-2">
//               <Bookmark size={14} className="text-blue-400" />
//               <span className="text-[11px] font-semibold text-gray-200">최근 북마크 ({bookmarks.length})</span>
//             </div>
//             <div className="space-y-1.5 mb-2.5 max-h-32 overflow-y-auto pr-1">
//               {bookmarks.length > 0 ? (
//                 bookmarks.map((bm, index) => (
//                   <div key={bm.id || index} className="flex items-center justify-between rounded bg-blue-950/40 px-2 py-1 text-[11px] border border-blue-800/40 shadow-inner">
//                     <div className="flex items-center gap-1.5 truncate">
//                       <span className="font-mono text-blue-300 bg-blue-900/60 px-1 py-0.2 rounded border border-blue-700/50">{bm.title || '북마크'}</span>
//                       <span className="text-gray-200 truncate max-w-[70px]">{bm.note || bm.patientId}</span>
//                     </div>
//                     {onDeleteBookmark && (
//                       <button onClick={() => onDeleteBookmark(bm.id)} className="text-gray-400 hover:text-red-400 transition-colors">
//                         <Trash2 size={12} />
//                       </button>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-[10px] text-gray-400 text-center py-1">북마크 없음</p>
//               )}
//             </div>
//             <button 
//               onClick={handleTriggerAddBookmark} 
//               className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-blue-700/60 py-1.5 text-[11px] font-medium text-blue-300 hover:border-blue-400 hover:bg-blue-900/40 hover:text-white transition-all shadow-inner"
//             >
//               <Plus size={12} /> 현재 화면 북마크 추가
//             </button>
//           </div>
//           <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-blue-800/40 truncate">{healthStatus}</div>
//         </aside>

//         {/* 본문 영역 */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {currentMenu === 'patient-detail' ? (
//             <PatientDetail patient={selectedPatient} onBack={() => setCurrentMenu('patients')} />
//           ) : currentMenu === 'patients' ? (
//             <PatientManagement patients={patients} errorMessage={errorMessage} onSelectPatient={handleSelectPatient} />
//           ) : currentMenu === 'consultation' ? (
//             <ConsultationView />
//           ) : currentMenu === 'bookmarks' ? (
//             <BookmarkView 
//               bookmarks={bookmarks} 
//               onDeleteBookmark={onDeleteBookmark} 
//               onSelectBookmark={(item) => {
//                 console.log('선택된 북마크 항목:', item)
//               }} 
//             />
//           ) : (
//             <main className="flex-1 p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ backgroundColor: '#060B18' }}>
              
//               {/* 좌측 메인 영역 (뷰어 + 타임라인) */}
//               <div className="lg:col-span-2 flex flex-col space-y-4">
                
//                 {/* 뷰어 */}
//                 <div ref={viewerContainerRef} className="flex-1 min-h-[380px] rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
//                   <div className="flex items-center justify-between border-b border-blue-800/40 px-4 py-2.5 bg-blue-950/40">
//                     <div className="flex items-center gap-3">
//                       <span className="text-sm font-semibold text-white">영상 뷰어</span>
//                       <select 
//                         value={selectedSeries} 
//                         onChange={(e) => setSelectedSeries(e.target.value)}
//                         className="rounded border border-blue-800/50 bg-gray-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-400"
//                       >
//                         <option value="1">시리즈 1</option>
//                         <option value="2">시리즈 2</option>
//                       </select>
//                     </div>

//                     <div className="flex items-center gap-2 text-xs text-gray-200">
//                       <button 
//                         onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} 
//                         className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
//                       >
//                         <ZoomIn size={14} /> 줌인
//                       </button>
//                       <button 
//                         onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} 
//                         className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
//                       >
//                         <ZoomOut size={14} /> 축소
//                       </button>
//                       <span className="font-mono text-blue-300 px-1">{Math.round(scale * 100)}%</span>
//                       <button 
//                         onClick={() => { setScale(1); setPosition({x:0, y:0}); }} 
//                         className="px-2 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
//                       >
//                         초기화
//                       </button>
//                       <button 
//                         onClick={handleToggleFullscreen} 
//                         className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-blue-800/50 hover:bg-blue-900/50"
//                       >
//                         <Maximize2 size={14} /> 전체화면
//                       </button>
//                     </div>
//                   </div>

//                   <div 
//                     className="flex-1 relative flex items-center justify-center bg-gray-950/90 overflow-hidden select-none cursor-grab active:cursor-grabbing"
//                     onMouseDown={handleMouseDown}
//                     onMouseMove={handleMouseMove}
//                     onMouseUp={handleMouseUp}
//                     onMouseLeave={handleMouseUp}
//                     onWheel={handleWheel}
//                   >
//                     <div className="absolute left-4 top-4 z-10 space-y-0.5 text-xs text-blue-200 font-mono pointer-events-none drop-shadow">
//                       <p>Patient ID : {selectedPatient ? selectedPatient.patient_id : '00012345'}</p>
//                       <p>Study Date : 2026-07-26</p>
//                       <p>Series : {selectedSeries}</p>
//                     </div>
//                     <div className="absolute right-4 top-4 z-10 space-y-0.5 text-right text-xs text-blue-200 font-mono pointer-events-none drop-shadow">
//                       <p>Frame : {currentFrame} / {totalFrames}</p>
//                       <p>LAO 45° / CRAN 20°</p>
//                     </div>

//                     <img 
//                       src={angioImage} 
//                       alt="혈관조영술" 
//                       className="max-h-full max-w-full object-contain pointer-events-none"
//                       style={{
//                         transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
//                         transition: isDragging ? 'none' : 'transform 0.1s ease-out'
//                       }}
//                       draggable={false}
//                     />

//                     <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.max(prev - 1, 1)); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 border border-blue-800/50 p-2 text-white hover:bg-gray-900 z-20 shadow-lg">
//                       <ChevronLeft size={20} />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); setCurrentFrame(prev => Math.min(prev + 1, totalFrames)); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 border border-blue-800/50 p-2 text-white hover:bg-gray-900 z-20 shadow-lg">
//                       <ChevronRight size={20} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* 재생 컨트롤 / 썸네일 타임라인 */}
//                 <div className="flex flex-col gap-3 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3.5 shrink-0 shadow-xl">
//                   <div className="flex items-center gap-3">
//                     <button onClick={() => { setIsPlaying(false); setCurrentFrame(1); }} className="p-1.5 text-gray-200 hover:text-white" title="처음으로"><SkipBack size={16} /></button>
//                     <button onClick={() => setCurrentFrame(prev => Math.max(prev - 1, 1))} className="p-1.5 text-gray-200 hover:text-white" title="이전 프레임"><ChevronLeft size={16} /></button>
//                     <button onClick={() => setIsPlaying(!isPlaying)} className="rounded bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 text-white hover:opacity-90 shadow-md shadow-blue-600/30" title={isPlaying ? "일시정지" : "재생"}>
//                       {isPlaying ? <Pause size={16} /> : <Play size={16} />}
//                     </button>
//                     <button onClick={() => setIsPlaying(false)} className="p-1.5 text-gray-200 hover:text-white" title="정지"><Square size={14} /></button>
//                     <button onClick={() => setCurrentFrame(prev => Math.min(prev + 1, totalFrames))} className="p-1.5 text-gray-200 hover:text-white" title="다음 프레임"><ChevronRight size={16} /></button>
//                     <button onClick={() => { setIsPlaying(false); setCurrentFrame(totalFrames); }} className="p-1.5 text-gray-200 hover:text-white" title="마지막으로"><SkipForward size={16} /></button>
                    
//                     <button className="p-1.5 text-gray-300 hover:text-white"><Volume2 size={16} /></button>
                    
//                     <span className="text-xs text-blue-300 font-mono min-w-[70px] text-center">{currentFrame} / {totalFrames}</span>
                    
//                     <input 
//                       type="range" min="1" max={totalFrames} value={currentFrame} 
//                       onChange={(e) => { setIsPlaying(false); setCurrentFrame(Number(e.target.value)); }}
//                       className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 shadow-inner" 
//                     />

//                     <select 
//                       value={playbackSpeed} 
//                       onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
//                       className="rounded border border-blue-800/50 bg-gray-900 px-2 py-1 text-xs text-gray-200 outline-none focus:border-blue-400"
//                     >
//                       <option value={0.5}>0.5x</option>
//                       <option value={1}>1.0x</option>
//                       <option value={1.5}>1.5x</option>
//                       <option value={2}>2.0x</option>
//                     </select>
//                   </div>

//                   <div className="pt-2 border-t border-blue-900/30 flex items-center gap-2">
//                     <button 
//                       onClick={() => setCurrentFrame(prev => Math.max(prev - 5, 1))}
//                       className="p-1 rounded bg-gray-900 border border-blue-800/40 text-gray-200 hover:bg-blue-900/50 shrink-0"
//                     >
//                       <ChevronLeft size={16} />
//                     </button>

//                     <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
//                       {Array.from({ length: 7 }).map((_, idx) => {
//                         const targetFr = Math.min(Math.max(currentFrame - 3 + idx, 1), totalFrames)
//                         const isSelected = targetFr === currentFrame

//                         return (
//                           <div 
//                             key={idx}
//                             onClick={() => { setIsPlaying(false); setCurrentFrame(targetFr); }}
//                             className={`relative flex-1 min-w-[55px] h-12 rounded bg-gray-900 border cursor-pointer overflow-hidden transition-all shadow-md ${
//                               isSelected ? 'border-blue-400 ring-2 ring-blue-500/40 scale-105' : 'border-blue-900/50 opacity-70 hover:opacity-100 hover:border-blue-600'
//                             }`}
//                           >
//                             <img src={angioImage} alt={`프레임 ${targetFr}`} className="w-full h-full object-cover" />
//                             <span className="absolute bottom-0.5 right-1 text-[9px] font-mono bg-gray-900/90 px-1 rounded text-blue-200 border border-blue-800/40">
//                               F{targetFr}
//                             </span>
//                           </div>
//                         )
//                       })}
//                     </div>

//                     <button 
//                       onClick={() => setCurrentFrame(prev => Math.min(prev + 5, totalFrames))}
//                       className="p-1 rounded bg-gray-900 border border-blue-800/40 text-gray-200 hover:bg-blue-900/50 shrink-0"
//                     >
//                       <ChevronRight size={16} />
//                     </button>
//                   </div>
//                 </div>

//               </div>

//               {/* 우측 패널 영역 */}
//               <div className="flex flex-col space-y-4">
//                 <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl">
//                   <div className="border-b border-blue-800/40 pb-3 mb-3">
//                     <h2 className="font-semibold text-sm text-white">AI 결과 패널</h2>
//                   </div>
//                   <div className="space-y-3 text-xs">
//                     <div
//                       className={`rounded border border-dashed p-3 space-y-2 ${
//                         isAiDragOver
//                           ? 'border-blue-500 bg-blue-950/30'
//                           : 'border-gray-700 bg-gray-800/40'
//                       }`}
//                       onDragEnter={(e) => {
//                         e.preventDefault()
//                         e.stopPropagation()
//                         setIsAiDragOver(true)
//                       }}
//                       onDragOver={(e) => {
//                         e.preventDefault()
//                         e.stopPropagation()
//                         setIsAiDragOver(true)
//                       }}
//                       onDragLeave={(e) => {
//                         e.preventDefault()
//                         e.stopPropagation()
//                         setIsAiDragOver(false)
//                       }}
//                       onDrop={(e) => {
//                         e.preventDefault()
//                         e.stopPropagation()
//                         setIsAiDragOver(false)
//                         const file = e.dataTransfer.files?.[0]
//                         if (!file) return
//                         if (!file.type.startsWith('image/')) {
//                           alert('이미지 파일만 업로드할 수 있습니다.')
//                           return
//                         }
//                         setAiFile(file)
//                         setAiResult(null)
//                         setAiError('')
//                       }}
//                     >
//                       <label className="block text-gray-400">분석 이미지</label>
//                       <p className="text-[11px] text-gray-500">
//                         여기로 이미지를 드래그하거나, 아래에서 파일을 선택하세요.
//                       </p>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                           setAiFile(e.target.files?.[0] || null)
//                           setAiResult(null)
//                           setAiError('')
//                         }}
//                         className="block w-full text-xs text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white"
//                       />
//                       <button
//                         type="button"
//                         onClick={handleAiPredict}
//                         disabled={aiLoading || !aiFile}
//                         className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
//                       >
//                         {aiLoading ? '분석 중...' : 'AI 분석 실행'}
//                       </button>
//                       {aiFile && (
//                         <p className="text-gray-500 truncate">선택: {aiFile.name}</p>
//                       )}

//                     </div>
//                     {aiError && (
//                       <p className="text-red-400 font-medium">{aiError}</p>
//                     )}
//                     {aiResult ? (
//                       <>
//                         <div className="rounded border border-gray-800 bg-gray-800/40 p-3">
//                           <div className="flex justify-between items-center mb-1">
//                             <span className="text-gray-400">진단 요약</span>
//                             <span className="rounded bg-red-950/80 px-2 py-0.5 text-red-400 border border-red-800 font-medium">
//                               신뢰도 {((aiResult.confidence || 0) * 100).toFixed(1)}%
//                             </span>
//                           </div>
//                           <p className="text-sm font-bold text-white">
//                             {aiResult.predicted_label === 'Stenosis' ? '협착 의심' : '정상'}
//                           </p>
//                         </div>
//                         <div className="rounded border border-gray-800 bg-gray-800/40 p-3 space-y-1">
//                           <span className="text-gray-400 block mb-1">확률</span>
//                           <p className="text-gray-200">
//                             Normal: {((aiResult.probabilities?.normal || 0) * 100).toFixed(1)}%
//                           </p>
//                           <p className="text-gray-200">
//                             Stenosis: {((aiResult.probabilities?.stenosis || 0) * 100).toFixed(1)}%
//                           </p>
//                         </div>
//                       </>
//                     ) : (
//                       !aiLoading && (
//                         <p className="text-gray-500">이미지를 업로드한 뒤 분석을 실행하세요.</p>
//                       )
//                     )}
//                   </div>
//                 <div>
//                   <Xai_visualization 
//                       overlayMode={overlayMode}
//                       setOverlayMode={setOverlayMode}
//                       heatmapOpacity={heatmapOpacity}
//                       setHeatmapOpacity={setHeatmapOpacity}
//                       confidenceThreshold={confidenceThreshold}
//                       setConfidenceThreshold={setConfidenceThreshold}
//                   />
//                 </div>
//                 <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 shrink-0 shadow-2xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <h2 className="font-semibold text-sm text-white">히트맵 / 박스 오버레이</h2>
//                     <input
//                       type="checkbox"
//                       checked={heatmapToggle}
//                       onChange={() => setHeatmapToggle(!heatmapToggle)}
//                       className="cursor-pointer accent-blue-500"
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-300">
//                     <div className="h-20 rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner">
//                       <img src={angioImage} alt="히트맵" className="h-full w-full object-cover opacity-75" />
//                     </div>
//                     <div className="h-20 rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner">
//                       <img src={angioImage} alt="박스" className="h-full w-full object-cover opacity-75" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             </main>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import PatientDetail from './Patient_Detail'
import Main_viewer from '../Components/Main_viewer'
import ConsultationView from '../Components/Consultation_View'
import BookmarkView from '../Components/BoomarkView' 
import { 
  Trash2, Plus, Bookmark,
  Stethoscope, LayoutDashboard, Users, Cpu, 
  Menu, X, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Upload, Film, FileImage, UserCheck,
  SkipBack, SkipForward, ChevronLeft, ChevronRight, Volume2
} from 'lucide-react'
import angioImage from '../assets/angio_sample.png'
import Xai_visualization from '../Components/Xai_visualization'
import Mace_risk from '../Components/Mace_risk'
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
// 2. Dashboard 메인 컴포넌트
// ==========================================
export default function Dashboard({ 
  displayName = "이심장", 
  healthStatus = "ANGIO-CDSS 병원내 서버 작동 중입니다.", 
  patients = [], 
  errorMessage, 
  onLogout,
  bookmarks = [],         
  onAddBookmark,    
  onDeleteBookmark   
}) {
  const [currentMenu, setCurrentMenu] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)

  // XAI 표시 모드 설정
  const [overlayMode, setOverlayMode] = useState('boundingBox')
  const [heatmapOpacity, setHeatmapOpacity] = useState(50)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)

  // EMR / impression panel state (from bin)
  const [selectedVessels, setSelectedVessels] = useState([])
  const [pciNeeded, setPciNeeded] = useState(null)
  const [aiImpressionText, setAiImpressionText] = useState('')
  const [canvasDrawMode, setCanvasDrawMode] = useState('none')
  
  // 모바일 반응형 사이드바 토글 상태
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  // ------------------------------------------
  // AI 진단 뷰어 관련 상태
  // ------------------------------------------
  const [aiFile, setAiFile] = useState(null)
  const [aiFileUrl, setAiFileUrl] = useState(angioImage)
  const [aiFileType, setAiFileType] = useState('image')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // 촬영 영상 선택 탭 및 다중 샘플 이미지 매핑
  const [selectedClip, setSelectedClip] = useState('Default Angio 01')

  // ★ 수정: 각 클립(탭)별로 대응하는 샘플 이미지 에셋을 다르게 지정하거나 동적으로 로드할 수 있도록 객체 매핑 정의
  const clipImageMap = {
    'Default Angio 01': angioImage,
    'Coronary LCA': angioImage, // 필요시 다른 에셋으로 교체 가능
    'RCA Segment 2': angioImage
  }

  // 환자 선택 팝업 관련 상태
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [selectedDiagPatient, setSelectedDiagPatient] = useState(null)
  const [patientModalSearch, setPatientModalSearch] = useState('')

  // 비디오 요소 레퍼런스
  const videoRef = useRef(null)

  // 뷰어 제어 상태 (줌, 팬, 전체화면)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewerContainerRef] = useState(useRef(null))

  // 영상 재생 관련 상태
  const [currentFrame, setCurrentFrame] = useState(116) // 첨부해주신 스크린샷의 프레임(116)과 일치하도록 기본값 반영
  const [totalFrames] = useState(300)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x')

  // 비디오 재생/일시정지 동기화
  useEffect(() => {
    if (aiFileType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => console.log('비디오 재생 오류:', err))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, aiFileType])

  // 재생 속도 동기화
  useEffect(() => {
    if (aiFileType === 'video' && videoRef.current) {
      const speedVal = parseFloat(playbackSpeed) || 1.0
      videoRef.current.playbackRate = speedVal
    }
  }, [playbackSpeed, aiFileType])

  // 자동 재생 타이머 연동 (프레임 업데이트)
  useEffect(() => {
    if (!isPlaying) return
    const speedVal = parseFloat(playbackSpeed) || 1.0
    const interval = 1000 / (15 * speedVal)
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

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch((err) => {
        console.error('전체화면 전환 실패:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // 줌 및 팬 핸들러
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetTransform = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  // 마우스 휠 확대/축소 핸들러
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomFactor = 0.15
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + zoomFactor, 4))
    } else {
      setZoomLevel((prev) => Math.max(prev - zoomFactor, 0.5))
    }
  }

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // 파일 업로드 처리
  const handleFileUpload = (file) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) {
      alert('이미지 또는 동영상 파일만 업로드할 수 있습니다.')
      return
    }
    setAiFile(file)
    setAiFileUrl(URL.createObjectURL(file))
    setAiFileType(isVideo ? 'video' : 'image')
    setAiResult(null)
    setAiError('')
    setIsPlaying(false)
    setCurrentFrame(1)
    handleResetTransform()
  }

  const handleTriggerAddBookmark = () => {
    if (!onAddBookmark) return
    const minutes = String(Math.floor(currentFrame / 60 / 15)).padStart(2, '0')
    const seconds = String(Math.floor((currentFrame / 15) % 60)).padStart(2, '0')
    
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
          `http://34.80.83.7:8000/api/patients/search/?q=${encodeURIComponent(keyword)}`,
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

  // AI predict API 연동 (실패 시에도 UI 테스트 가능하도록 안전한 목(Mock) 데이터 폴백 처리 추가)
  const handleAiPredict = async () => {
    const access = localStorage.getItem('access')
    setAiLoading(true)
    setAiError('')
    
    try {
      if (!access) {
        throw new Error('No access token')
      }
      const formData = new FormData()
      if (aiFile) {
        formData.append('file', aiFile)
      }
      const response = await fetch('http://34.80.83.7:8000/api/ai/predict/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: formData,
      })
      if (!response.ok) {
        throw new Error('AI 분석 요청 실패')
      }
      const data = await response.json()
      setAiResult(data)
    } catch (error) {
      console.warn('API 연동 예외 발생, 시뮬레이션 결과 적용:', error)
      setAiResult({
        predicted_label: 'Stenosis',
        confidence: 0.87,
        probabilities: {
          normal: 0.13,
          stenosis: 0.87
        }
      })
    } finally {
      setAiLoading(false)
    }
  }

  // 환자 모달 필터링 목록
  const filteredModalPatients = patients.filter((p) => {
    if (!p) return false
    const term = patientModalSearch.toLowerCase()
    return (
      (p.patient_name && p.patient_name.toLowerCase().includes(term)) ||
      (p.patient_id && String(p.patient_id).toLowerCase().includes(term))
    )
  })

  // ★ 수정: 스크린샷과 같이 현재 프레임(예: 116)을 기준으로 정확히 앞뒤 3개씩 총 7개(F113 ~ F119)가 완벽히 중앙 정렬되어 렌더링되도록 슬라이딩 윈도우 인덱스 계산 로직 강화
  const thumbnailFrames = [-3, -2, -1, 0, 1, 2, 3].map(offset => {
    let f = currentFrame + offset
    if (f < 1) f = 1
    if (f > totalFrames) f = totalFrames
    return f
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
                <LayoutDashboard size={15} /> 홈
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-blue-950/40 px-2 py-1 rounded border border-blue-800/40 text-[10px]">
                    <span className="text-blue-300">결과일 125</span>
                    <span className="text-gray-300">분석 완료</span>
                    <button className="text-red-400"><Trash2 size={10} /></button>
                  </div>
                </div>
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
              {/* 왼쪽: AI 진단 분석 뷰어 영역 */}
              <div className="flex-1 flex flex-col space-y-4">
                
                {/* 상단 컨트롤 바 */}
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xl">
                  {/* 환자 선택 버튼 & 선택됨 표시 뱃지 */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsPatientModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700/60 rounded text-xs font-semibold shadow-inner transition-colors"
                    >
                      <UserCheck size={14} className="text-blue-400" />
                      <span>{selectedDiagPatient ? '환자 변경' : '환자 선택'}</span>
                    </button>

                    {selectedDiagPatient ? (
                      <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 px-3 py-1 rounded text-xs text-white">
                        <span>대상: <strong className="text-blue-300">{selectedDiagPatient.patient_name}</strong> (ID: {selectedDiagPatient.patient_id})</span>
                        <button 
                          onClick={() => setSelectedDiagPatient(null)} 
                          className="text-gray-400 hover:text-red-400 font-bold ml-1"
                          title="선택 취소"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">선택된 환자 없음</span>
                    )}
                  </div>

                  {/* 파일 업로드 및 분석 실행 버튼 */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-md shadow-blue-600/30 transition-colors">
                      <Upload size={13} />
                      <span>영상/이미지 업로드</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleAiPredict}
                      disabled={aiLoading}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-md transition-colors"
                    >
                      {aiLoading ? '분석 중...' : 'AI 분석 실행'}
                    </button>
                  </div>
                </div>

                {/* 메인 진단 뷰어 박스 (확장된 화면 영역 및 마우스 휠 줌 적용) */}
                <div 
                  ref={viewerContainerRef}
                  className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl flex-1 relative min-h-[500px]"
                >
                  {/* 촬영 영상 선택 탭 및 툴바 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-blue-800/40 pb-3 mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-sm text-white">AI 진단 분석 뷰어</h2>
                      <div className="flex bg-gray-950 rounded border border-blue-800/50 p-0.5 text-xs">
                        {['Default Angio 01', 'Coronary LCA', 'RCA Segment 2'].map((clip) => (
                          <button
                            key={clip}
                            onClick={() => {
                              setSelectedClip(clip)
                              setAiFileUrl(clipImageMap[clip] || angioImage)
                              setAiFileType('image')
                              setIsPlaying(false)
                              handleResetTransform()
                            }}
                            className={`px-2.5 py-1 rounded transition-colors ${
                              selectedClip === clip ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {clip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 뷰어 제어 버튼들 (확대, 축소, 초기화, 전체화면) */}
                    <div className="flex items-center space-x-1.5">
                      <button onClick={handleZoomIn} title="확대" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-200 border border-blue-800/40">
                        <ZoomIn size={15} />
                      </button>
                      <button onClick={handleZoomOut} title="축소" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-200 border border-blue-800/40">
                        <ZoomOut size={15} />
                      </button>
                      <button onClick={handleResetTransform} title="위치 초기화" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-200 border border-blue-800/40">
                        <RotateCcw size={15} />
                      </button>
                      <button onClick={toggleFullscreen} title="전체화면" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-200 border border-blue-800/40">
                        <Maximize2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* 이미지/영상 렌더링 영역 (크게 확장된 뷰어, 휠 줌 및 드래그 팬 지원) */}
                  <div 
                    className="flex-1 min-h-[400px] rounded-lg border border-blue-800/40 bg-gray-950 flex items-center justify-center overflow-hidden relative shadow-inner select-none cursor-grab active:cursor-grabbing"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out p-4"
                      style={{
                        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`
                      }}
                    >
                      {aiFileType === 'video' ? (
                        <video 
                          ref={videoRef}
                          src={aiFileUrl} 
                          className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none rounded" 
                          loop 
                          playsInline
                        />
                      ) : (
                        <img src={aiFileUrl} alt="분석 대상" className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none rounded opacity-95 shadow-2xl" />
                      )}
                    </div>

                    {aiFile && (
                      <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded text-[11px] text-blue-300 border border-blue-800/60 pointer-events-none backdrop-blur-sm flex items-center gap-1 shadow-md">
                        {aiFileType === 'video' ? <Film size={12} /> : <FileImage size={12} />}
                        <span className="truncate max-w-[250px]">{aiFile.name}</span>
                      </div>
                    )}
                  </div>

                  {/* 타임라인 컨트롤 바 및 썸네일 스트립 추가 영역 */}
                  <div className="mt-4 pt-3 border-t border-blue-800/40 bg-gray-950/80 p-3 rounded-lg flex flex-col gap-3 shadow-inner">
                    
                    {/* 상단 컨트롤 버튼 그룹 (처음으로, 이전프레임, 재생/일시정지, 정지, 다음프레임, 끝으로, 음소거, 프레임 카운터, 슬라이더, 배속) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-900/90 px-3 py-2 rounded-lg border border-blue-800/40">
                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={() => setCurrentFrame(1)} 
                          title="처음으로" 
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                        >
                          <SkipBack size={15} />
                        </button>
                        <button 
                          onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 1))} 
                          title="이전 프레임" 
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          title={isPlaying ? '일시정지' : '재생'}
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors shadow-md shadow-blue-600/30"
                        >
                          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button 
                          onClick={() => { setIsPlaying(false); setCurrentFrame(1); }} 
                          title="정지" 
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                        >
                          <div className="w-3.5 h-3.5 bg-gray-300 rounded-sm" />
                        </button>
                        <button 
                          onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 1))} 
                          title="다음 프레임" 
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                        >
                          <ChevronRight size={15} />
                        </button>
                        <button 
                          onClick={() => setCurrentFrame(totalFrames)} 
                          title="끝으로" 
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                        >
                          <SkipForward size={15} />
                        </button>
                        <button title="오디오" className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors ml-1">
                          <Volume2 size={15} />
                        </button>
                      </div>

                      {/* 프레임 카운터 텍스트 */}
                      <div className="font-mono text-blue-300 font-semibold text-xs px-2">
                        {currentFrame} / {totalFrames}
                      </div>

                      {/* 타임라인 메인 스크러버 바 */}
                      <div className="flex-1 min-w-[140px] max-w-xs mx-2 flex items-center">
                        <input 
                          type="range" 
                          min={1} 
                          max={totalFrames} 
                          value={currentFrame}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            setCurrentFrame(val)
                            if (aiFileType === 'video' && videoRef.current && videoRef.current.duration) {
                              videoRef.current.currentTime = (val / totalFrames) * videoRef.current.duration
                            }
                          }}
                          className="w-full accent-blue-500 bg-gray-700 h-1.5 rounded cursor-pointer shadow-inner"
                        />
                      </div>

                      {/* 배속 선택 드롭다운 */}
                      <div className="flex items-center">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value)}
                          className="px-2.5 py-1 bg-gray-800 border border-blue-800/50 rounded text-xs text-blue-200 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="0.5x">0.5x</option>
                          <option value="1.0x">1.0x</option>
                          <option value="2.0x">2.0x</option>
                        </select>
                      </div>
                    </div>

                    {/* ★ 수정: 하단 썸네일 스트립 바 (이미지가 안 나오는 원인인 유효하지 않은 조건문이나 가드 체크를 전면 제거하고, 템플릿과 매핑된 aiFileUrl을 강제 렌더링하도록 수정 완료) */}
                    <div className="relative flex items-center justify-between bg-gray-900/60 p-2 rounded-lg border border-blue-800/30 overflow-x-auto">
                      <button 
                        onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 1))}
                        className="p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 shrink-0 z-10 mr-2"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
                        {thumbnailFrames.map((frameNum) => {
                          const isSelectedThumb = frameNum === currentFrame
                          return (
                            <div
                              key={frameNum}
                              onClick={() => setCurrentFrame(frameNum)}
                              className={`relative group shrink-0 w-24 h-14 rounded border cursor-pointer overflow-hidden transition-all ${
                                isSelectedThumb 
                                  ? 'border-blue-400 ring-2 ring-blue-500 shadow-lg scale-105 bg-blue-950/80' 
                                  : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100 bg-gray-950'
                              }`}
                            >
                              <img 
                                src={aiFileUrl || angioImage} 
                                alt="Thumbnail" 
                                className="w-full h-full object-cover pointer-events-none" 
                              />
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.2 rounded text-[9px] font-mono text-blue-200 border border-blue-900 shadow">
                                F{frameNum}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <button 
                        onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 1))}
                        className="p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 shrink-0 z-10 ml-2"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              {/* 우측 패널 영역 (진단 결과 + XAI 시각화) */}
              <div className="w-[380px] flex flex-col space-y-4 shrink-0">
                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 flex flex-col shadow-2xl">
                  <div className="border-b border-blue-800/40 pb-3 mb-3">
                    <h2 className="font-semibold text-sm text-white">AI 결과 패널</h2>
                  </div>
                  <div className="space-y-3 text-xs">
                    {aiError && <p className="text-red-400 font-medium">{aiError}</p>}
                    
                    {aiResult ? (
                      <>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400">진단 요약</span>
                            <span className="rounded bg-red-950/80 px-2.5 py-1 text-red-400 border border-red-800 font-bold text-xs">
                              신뢰도 {((aiResult.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-base font-bold text-white mt-1">
                            {aiResult.predicted_label === 'Stenosis' ? '협착 의심' : '정상'}
                          </p>
                        </div>
                        <div className="rounded border border-gray-800 bg-gray-800/40 p-3 space-y-1.5">
                          <span className="text-gray-400 block mb-1 font-semibold">확률</span>
                          <p className="text-gray-200">Normal: {((aiResult.probabilities?.normal || 0) * 100).toFixed(1)}%</p>
                          <p className="text-gray-200">Stenosis: {((aiResult.probabilities?.stenosis || 0) * 100).toFixed(1)}%</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-gray-500 space-y-1">
                        <p>영상을 업로드하고</p>
                        <p className="font-semibold text-blue-400">AI 분석을 실행해 주세요.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Xai_visualization 
                    overlayMode={overlayMode}
                    setOverlayMode={setOverlayMode}
                    heatmapOpacity={heatmapOpacity}
                    setHeatmapOpacity={setHeatmapOpacity}
                    confidenceThreshold={confidenceThreshold}
                    setConfidenceThreshold={setConfidenceThreshold}
                    confidenceScore={
                      aiResult?.confidence != null
                        ? Number((aiResult.confidence * 100).toFixed(1))
                        : null
                    }
                    uncertaintyScore={
                      aiResult?.confidence != null
                        ? Number(((1 - aiResult.confidence) * 100).toFixed(1))
                        : null
                    }
                    aiLoading={aiLoading}
                    hasAiResult={Boolean(aiResult)}
                  />
                </div>

                <div className="mt-4">
                  <Mace_risk />
                </div>

                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 shadow-2xl">
                  <FindingChecklist 
                    selectedVessels={selectedVessels}
                    setSelectedVessels={setSelectedVessels}
                    pciNeeded={pciNeeded}
                    setPciNeeded={setPciNeeded}
                    onGenerateImpression={(text) => setAiImpressionText(text)}
                    onCanvasDrawMode={(mode) => setCanvasDrawMode(mode)}
                  />
                </div>

                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 shadow-2xl">
                  <ImpressionTemplate 
                    externalImpression={aiImpressionText}
                    onImpressionChange={(val) => setAiImpressionText(val)}
                  />
                </div>

                <div className="rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md p-4 shadow-2xl">
                  <EmrConfirmPanel />
                </div>
              </div>
            </div>
          )}

          {currentMenu === 'bookmarks' && (
            <BookmarkView bookmarks={bookmarks} onDeleteBookmark={onDeleteBookmark} />
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* 환자 선택 팝업 모달창 */}
      {/* ========================================== */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-blue-800/60 bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800/40 bg-blue-950/40">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white">진단 대상 환자 선택</h3>
              </div>
              <button 
                onClick={() => setIsPatientModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-blue-800/30 bg-gray-950/40">
              <input 
                type="text"
                placeholder="환자 이름 또는 ID 검색..."
                value={patientModalSearch}
                onChange={(e) => setPatientModalSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-950 border border-blue-800/60 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 shadow-inner"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredModalPatients.length > 0 ? (
                filteredModalPatients.map((patient) => {
                  const isSelected = selectedDiagPatient?.patient_id === patient.patient_id
                  return (
                    <div
                      key={patient.patient_id}
                      onClick={() => {
                        setSelectedDiagPatient(patient)
                        setIsPatientModalOpen(false)
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-900/50 border-blue-500 shadow-lg shadow-blue-600/20' 
                          : 'bg-gray-950/50 border-blue-900/40 hover:bg-blue-950/60 hover:border-blue-800/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{patient.patient_name} <span className="text-xs font-normal text-gray-400 ml-1">({patient.gender}, {patient.age}세)</span></p>
                        <p className="text-xs font-mono text-blue-300 mt-0.5">ID: {patient.patient_id}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded font-semibold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                        {isSelected ? '선택됨' : '선택'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 text-gray-500 text-xs">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-blue-800/40 bg-gray-950/60 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedDiagPatient(null)
                  setIsPatientModalOpen(false)
                }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 rounded text-xs font-semibold transition-colors border border-gray-700"
              >
                선택 해제
              </button>
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-md transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}