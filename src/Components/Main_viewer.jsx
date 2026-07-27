import { useEffect, useRef, useState } from 'react'
import angioImage from '../assets/angio_sample.png'
import { 
    Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, 
    Maximize2, Minimize2, FolderSearch, Upload, 
    BoxSelect, Type, PenTool, Trash2 
} from 'lucide-react'

function Main_viewer({
    patientData,
    showHeatmap = true,
    showBoundingBox = true,
    confidenceThreshold,
    aiFileUrl = null,
    aiResult = null,
    heatmapOpacity = 70,
}) {
    const [currentFrame, setCurrentFrame] = useState(125)
    const [isPlaying, setIsPlaying] = useState(false)
    const [selectedSeries, setSelectedSeries] = useState('1')
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [scale, setScale] = useState(1)
    const [isZoomMode, setIsZoomMode] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    // 주석 도구 상태 관리 ('bbox' | 'text' | 'pen' | null)
    const [activeTool, setActiveTool] = useState(null)
    const [userAnnotations, setUserAnnotations] = useState([]) // 사용자가 그린 주석 목록
    const [currentText, setCurrentText] = useState('')
    
    // 그리기 인터랙션 임시 상태
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 })
    const [currentPath, setCurrentPath] = useState([])

    // 드래그 앤 드롭 및 외부 이미지 상태
    const [customImageUrl, setCustomImageUrl] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const imageRef = useRef(null)
    const overlayCanvasRef = useRef(null)
    const heatmapImageRef = useRef(null)
    const heatmapSrcRef = useRef(null)

    const [position, setPosition] = useState({ x: 0, y: 0 })
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 })
    const viewerRef = useRef(null)

    const totalFrames = 250

    // 환자 데이터 변경 시 초기화
    useEffect(() => {
        setCustomImageUrl(null)
        setIsImageLoaded(false)
        setScale(1)
        setPosition({ x: 0, y: 0 })
        setUserAnnotations([])
        setActiveTool(null)
        heatmapImageRef.current = null
        heatmapSrcRef.current = null
    }, [patientData])

    // 부모에서 GCS key_frame / 업로드 URL이 바뀌면 다시 로드
    useEffect(() => {
        setIsImageLoaded(false)
        heatmapImageRef.current = null
        heatmapSrcRef.current = null
    }, [aiFileUrl])

    useEffect(() => {
        if (!isPlaying) return

        const frameInterval = 1000 / (10 * playbackSpeed)
        const playTimer = setInterval(() => {
            setCurrentFrame((prev) => {
                if (prev >= totalFrames) {
                    setIsPlaying(false)
                    return totalFrames
                }
                return prev + 1
            })
        }, frameInterval)

        return () => clearInterval(playTimer)
    }, [isPlaying, playbackSpeed, totalFrames])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement))
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // AI 히트맵 / 바운딩박스 + 사용자 주석 캔버스
    // 히트맵·박스는 서로 독립 토글. 박스 토글 시 히트맵을 다시 깨지 않도록 이미지 캐시.
    useEffect(() => {
        const image = imageRef.current
        const canvas = overlayCanvasRef.current

        if (!image || !canvas || !isImageLoaded) return

        let cancelled = false

        const toDataUrl = (value) => {
            if (!value) return null
            if (String(value).startsWith('data:')) return String(value)
            return `data:image/png;base64,${value}`
        }

        const heatmapSrc = toDataUrl(
            aiResult?.heatmap_base64
            || aiResult?.overlay_base64
            || aiResult?.classification?.heatmap_base64
            || aiResult?.classification?.overlay_base64
        )

        const boxes = aiResult?.bounding_boxes || aiResult?.boxes || []
        const threshold = confidenceThreshold ?? 25

        const drawAnnotations = (context) => {
            userAnnotations.forEach((ann) => {
                if (ann.type === 'bbox') {
                    context.strokeStyle = '#3b82f6'
                    context.lineWidth = 3
                    context.strokeRect(ann.x, ann.y, ann.width, ann.height)

                    context.fillStyle = '#3b82f6'
                    context.fillRect(ann.x, Math.max(ann.y - 18, 0), 65, 18)
                    context.fillStyle = '#ffffff'
                    context.font = 'bold 11px sans-serif'
                    context.fillText('Dr. Annotation', ann.x + 4, Math.max(ann.y - 4, 12))
                } else if (ann.type === 'pen' && ann.path && ann.path.length > 0) {
                    context.strokeStyle = '#10b981'
                    context.lineWidth = 3
                    context.lineCap = 'round'
                    context.beginPath()
                    ann.path.forEach((pt, idx) => {
                        if (idx === 0) context.moveTo(pt.x, pt.y)
                        else context.lineTo(pt.x, pt.y)
                    })
                    context.stroke()
                } else if (ann.type === 'text') {
                    context.fillStyle = '#f59e0b'
                    context.font = 'bold 14px sans-serif'
                    context.fillText(ann.text, ann.x, ann.y)
                }
            })
        }

        const drawCanvasContent = () => {
            if (cancelled) return

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

            // 1. Grad-CAM heatmap (독립 토글)
            const heatmapImage = heatmapImageRef.current
            if (showHeatmap && heatmapImage) {
                context.save()
                context.globalAlpha = Math.max(0, Math.min(1, (heatmapOpacity || 0) / 100))
                context.drawImage(heatmapImage, 0, 0, imageWidth, imageHeight)
                context.restore()
            }

            // 2. AI Bounding Box (독립 토글)
            if (showBoundingBox) {
                const scaleX = image.naturalWidth ? imageWidth / image.naturalWidth : 1
                const scaleY = image.naturalHeight ? imageHeight / image.naturalHeight : 1

                boxes
                    .filter((box) => (box.confidence ?? 0) * 100 >= threshold)
                    .forEach((box) => {
                        const boxX = (box.x ?? 0) * scaleX
                        const boxY = (box.y ?? 0) * scaleY
                        const boxWidth = (box.width ?? 0) * scaleX
                        const boxHeight = (box.height ?? 0) * scaleY
                        const labelText = `${box.label || 'Stenosis'} ${Math.round((box.confidence ?? 0) * 100)}%`

                        context.strokeStyle = '#ef4444'
                        context.lineWidth = 3
                        context.strokeRect(boxX, boxY, boxWidth, boxHeight)

                        context.font = 'bold 12px sans-serif'
                        const labelWidth = context.measureText(labelText).width + 8
                        const labelHeight = 18

                        context.fillStyle = '#ef4444'
                        context.fillRect(boxX, Math.max(boxY - labelHeight, 0), labelWidth, labelHeight)

                        context.fillStyle = '#ffffff'
                        context.fillText(labelText, boxX + 4, Math.max(boxY - 4, 12))
                    })
            }

            // 3. user annotations
            drawAnnotations(context)
        }

        const ensureHeatmapThenDraw = () => {
            if (!showHeatmap || !heatmapSrc) {
                drawCanvasContent()
                return
            }

            // 같은 src면 재로딩하지 않고 캐시 사용
            if (heatmapSrcRef.current === heatmapSrc && heatmapImageRef.current) {
                drawCanvasContent()
                return
            }

            const loader = new Image()
            loader.onload = () => {
                if (cancelled) return
                heatmapImageRef.current = loader
                heatmapSrcRef.current = heatmapSrc
                drawCanvasContent()
            }
            loader.onerror = () => {
                console.error('Failed to load Grad-CAM heatmap image')
                if (cancelled) return
                drawCanvasContent()
            }
            loader.src = heatmapSrc
        }

        ensureHeatmapThenDraw()

        window.addEventListener('resize', drawCanvasContent)
        return () => {
            cancelled = true
            window.removeEventListener('resize', drawCanvasContent)
        }
    }, [
        showHeatmap,
        showBoundingBox,
        confidenceThreshold,
        heatmapOpacity,
        isImageLoaded,
        userAnnotations,
        aiResult,
    ])

    // --- 주석 그리기 마우스 인터랙션 핸들러 ---
    const handleCanvasMouseDown = (e) => {
        if (!activeTool || isZoomMode) return
        const rect = overlayCanvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (activeTool === 'text') {
            if (!currentText.trim()) {
                alert('입력할 텍스트 주석 내용을 먼저 적어주세요.')
                return
            }
            setUserAnnotations(prev => [...prev, { type: 'text', x, y, text: currentText }])
            setCurrentText('')
            setActiveTool(null)
            return
        }

        setIsDrawing(true)
        setDrawStartPos({ x, y })
        if (activeTool === 'pen') {
            setCurrentPath([{ x, y }])
        }
    }

    const handleCanvasMouseMove = (e) => {
        if (!isDrawing || !activeTool || isZoomMode) return
        const rect = overlayCanvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (activeTool === 'pen') {
            setCurrentPath(prev => [...prev, { x, y }])
        }
    }

    const handleCanvasMouseUp = (e) => {
        if (!isDrawing || !activeTool || isZoomMode) return
        const rect = overlayCanvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (activeTool === 'bbox') {
            const width = x - drawStartPos.x
            const height = y - drawStartPos.y
            if (Math.abs(width) > 5 && Math.abs(height) > 5) {
                setUserAnnotations(prev => [
                    ...prev,
                    {
                        type: 'bbox',
                        x: width < 0 ? x : drawStartPos.x,
                        y: height < 0 ? y : drawStartPos.y,
                        width: Math.abs(width),
                        height: Math.abs(height),
                    },
                ])
            }
        } else if (activeTool === 'pen') {
            if (currentPath.length > 1) {
                setUserAnnotations(prev => [...prev, { type: 'pen', path: currentPath }])
            }
        }

        setIsDrawing(false)
        setCurrentPath([])
    }

    const handlePreviousFrame = () => {
        setIsPlaying(false)
        setCurrentFrame((prev) => Math.max(prev - 1, 1))
    }

    const handleNextFrame = () => {
        setIsPlaying(false)
        setCurrentFrame((prev) => Math.min(prev + 1, totalFrames))
    }

    const handlePlay = () => {
        if (currentFrame >= totalFrames) {
            setCurrentFrame(1)
            setIsPlaying(true)
            return
        }
        setIsPlaying((prev) => !prev)
    }

    const handleFullscreen = async () => {
        if (!viewerRef.current) return
        try {
            if (!document.fullscreenElement) {
                await viewerRef.current.requestFullscreen()
            } else {
                await document.exitFullscreen()
            }
        } catch (error) {
            console.error('전체화면 실행 오류:', error)
        }
    }

    const handleReset = () => {
        setIsPlaying(false)
        setCurrentFrame(125)
        setPlaybackSpeed(1)
        setScale(1)
        setIsZoomMode(false)
        setIsDragging(false)
        setPosition({ x: 0, y: 0 })
        setActiveTool(null)
    }

    const handleZoomToggle = () => {
        setIsZoomMode((prev) => {
            const next = !prev
            if (next) setActiveTool(null) // 줌 모드 진입 시 주석 툴 해제
            if (!next) {
                setScale(1)
                setPosition({ x: 0, y: 0 })
                setIsDragging(false)
            }
            return next
        })
    }

    const handleWheelZoom = (e) => {
        if (!isZoomMode) return
        e.preventDefault()
        const zoomAmount = e.deltaY < 0 ? 0.2 : -0.2
        setScale((prev) => {
            const next = Math.min(Math.max(prev + zoomAmount, 1), 4)
            if (next === 1) setPosition({ x: 0, y: 0 })
            return next
        })
    }

    const handleMouseDown = (e) => {
        if (activeTool) return // 주석 모드일 때는 뷰어 드래그 방지
        if (!isZoomMode || scale <= 1) return
        setIsDragging(true)
        dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, imageX: position.x, imageY: position.y }
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        const moveX = e.clientX - dragStartRef.current.mouseX
        const moveY = e.clientY - dragStartRef.current.mouseY
        setPosition({ x: dragStartRef.current.imageX + moveX, y: dragStartRef.current.imageY + moveY })
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => setIsDragging(false)

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file)
                setCustomImageUrl(imageUrl)
                setIsImageLoaded(false)
            } else {
                alert('이미지 파일만 업로드 가능합니다.')
            }
        }
    }

    if (!patientData) {
        return (
            <section className="flex h-full min-h-[100px] flex-col items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400">
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="rounded-full bg-gray-800 p-3 text-blue-500">
                        <FolderSearch size={30} />
                    </div>
                    <h3 className="text-base font-medium text-white">선택된 환자 영상이 없습니다</h3>
                    <p className="text-xs text-gray-400">좌측 메뉴나 빠른 검색을 통해 진단할 환자를 선택해 주세요.</p>
                </div>
            </section>
        )
    }

    const getThumbnailFrames = () => {
        const frames = []
        const start = Math.max(1, currentFrame - 3)
        const end = Math.min(totalFrames, currentFrame + 3)
        for (let i = start; i <= end; i++) {
            frames.push(i)
        }
        return frames
    }

    // Dashboard가 넘기는 aiFileUrl(환자 key_frame blob)을 매핑
    const currentDisplayImage =
        customImageUrl ||
        aiFileUrl ||
        patientData?.imageUrl ||
        patientData?.url ||
        angioImage

    return (
        <section
            ref={viewerRef}
            className="flex h-[calc(100vh-1.5rem)] max-h-[820px] flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900 text-xs"
        >
            {/* 상단 툴바 (기존 기능 + 주석 도구 추가) */}
            <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-white">
                        {patientData?.patient_name || patientData?.name
                          ? `${patientData.patient_name || patientData.name} 영상 뷰어`
                          : (patientData?.title || '영상 뷰어')}
                    </h2>
                    <select
                        value={selectedSeries}
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none"
                    >
                        <option value="1">시리즈 1</option>
                        <option value="2">시리즈 2</option>
                        <option value="3">시리즈 3</option>
                    </select>
                </div>

                {/* 주석 도구 및 뷰어 조작 버튼 그룹 */}
                <div className="flex items-center gap-2">
                    {/* 의사 판독 주석 도구들 */}
                    <div className="flex items-center gap-1 rounded bg-gray-800/80 p-0.5 border border-gray-700">
                        <button
                            type="button"
                            onClick={() => { setActiveTool(activeTool === 'bbox' ? null : 'bbox'); setIsZoomMode(false); }}
                            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                                activeTool === 'bbox' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-white'
                            }`}
                            title="박스(BBox) 그리기"
                        >
                            <BoxSelect size={13} />
                            <span>박스</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTool(activeTool === 'text' ? null : 'text'); setIsZoomMode(false); }}
                            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                                activeTool === 'text' ? 'bg-indigo-500 text-white' : 'text-gray-300 hover:text-white'
                            }`}
                            title="텍스트 주석 추가"
                        >
                            <Type size={13} />
                            <span>텍스트</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTool(activeTool === 'pen' ? null : 'pen'); setIsZoomMode(false); }}
                            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                                activeTool === 'pen' ? 'bg-emerald-500 text-black' : 'text-gray-300 hover:text-white'
                            }`}
                            title="자유선 펜 드로잉"
                        >
                            <PenTool size={13} />
                            <span>펜</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserAnnotations([])}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-all"
                            title="모든 주석 삭제 (초기화)"
                        >
                            <Trash2 size={13} />
                            <span>지우기</span>
                        </button>
                    </div>

                    <div className="h-4 w-px bg-gray-700" />

                    <button
                        type="button"
                        onClick={handleZoomToggle}
                        className={`rounded px-2.5 py-1 transition-colors ${
                            isZoomMode ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        줌
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded px-2.5 py-1 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        onClick={handleFullscreen}
                        className="flex items-center gap-1 rounded px-2.5 py-1 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        <span>{isFullscreen ? '축소' : '전체화면'}</span>
                    </button>
                </div>
            </div>

            {/* 텍스트 주석 입력 가이드 오버레이 */}
            {activeTool === 'text' && (
                <div className="absolute right-4 top-14 z-30 flex items-center gap-2 rounded-lg border border-indigo-500/50 bg-gray-900/95 p-2 shadow-xl backdrop-blur">
                    <input
                        type="text"
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder="입력할 주석 내용을 적어주세요."
                        className="rounded border border-gray-700 bg-gray-950 px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-indigo-300">영상의원 위치 클릭</span>
                </div>
            )}

            {/* 중앙 이미지 뷰어 영역 */}
            <div
                className={`relative flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-black select-none transition-colors ${
                    isDragOver ? 'border-2 border-dashed border-blue-500 bg-blue-950/20' : ''
                } ${
                    isZoomMode && scale > 1
                        ? isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        : activeTool ? 'cursor-crosshair' : isZoomMode ? 'cursor-zoom-in' : ''
                }`}
                onWheel={handleWheelZoom}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragOver && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-blue-400 pointer-events-none">
                        <Upload size={40} className="mb-2 animate-bounce" />
                        <p className="text-sm font-bold">여기에 이미지 파일을 놓아주세요</p>
                    </div>
                )}

                <div className="absolute left-3 top-3 z-10 space-y-0.5 text-[11px] text-gray-300 pointer-events-none">
                    <p>Patient ID : {patientData?.patient_id || patientData?.patientId || patientData?.id || '00012345'}</p>
                    <p>Study Date : {patientData.date || '2026-07-25'}</p>
                </div>

                <div className="absolute right-3 top-3 z-10 space-y-0.5 text-right text-[11px] text-gray-300 pointer-events-none">
                    <p>Frame : {currentFrame} / {totalFrames}</p>
                    <p>LAO 45° / CRAN 20°</p>
                </div>

                <div className="flex h-full w-full items-center justify-center p-2">
                    {patientData?.mediaType === 'video' ? (
                        <iframe
                            src={patientData.mediaUrl}
                            title={patientData.title || '촬영 영상'}
                            className="w-full h-full border-0"
                            allowFullScreen
                        />
                    ) : (
                        <div
                            className="relative inline-block max-h-full max-w-full"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={currentDisplayImage}
                                alt="혈관조영술"
                                onLoad={() => setIsImageLoaded(true)}
                                className="max-h-[calc(100vh-280px)] max-w-full select-none object-contain pointer-events-none"
                                draggable={false}
                            />
                            {/* 주석 및 AI BBox가 그려지는 캔버스 레이어 */}
                            <canvas
                                ref={overlayCanvasRef}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                className={`absolute left-0 top-0 h-full w-full ${
                                    activeTool ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
                                }`}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handlePreviousFrame}
                    disabled={currentFrame === 1}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/80 disabled:opacity-30 z-20"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    type="button"
                    onClick={handleNextFrame}
                    disabled={currentFrame === totalFrames}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/80 disabled:opacity-30 z-20"
                >
                    <ChevronRight size={20} />
                </button>

                <div className="absolute bottom-2 left-3 text-[11px] text-gray-300 pointer-events-none">
                    <span>{patientData.vessel || 'RCA'} | W: 4095 / L: 2048</span>
                </div>
            </div>

            {/* 하단 재생 컨트롤 및 썸네일 스트립 */}
            <div className="border-t border-gray-800 bg-gray-900 px-3 py-2 space-y-2">
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
                    <span className="text-[11px] text-gray-400 mr-1">프레임:</span>
                    {getThumbnailFrames().map((frameNum) => {
                        const isSelected = frameNum === currentFrame
                        return (
                            <button
                                key={frameNum}
                                type="button"
                                onClick={() => { setIsPlaying(false); setCurrentFrame(frameNum) }}
                                className={`group relative flex flex-col items-center rounded overflow-hidden border transition-all ${
                                    isSelected ? 'border-blue-500 ring-1 ring-blue-500 scale-105' : 'border-gray-700 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <div className="h-8 w-12 bg-black flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={currentDisplayImage} 
                                        alt={`프레임 ${frameNum}`} 
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                <span className={`text-[9px] w-full py-0.2 text-center ${isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}>
                                    {frameNum}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { setIsPlaying(false); setCurrentFrame(1) }}
                        disabled={currentFrame === 1}
                        className="rounded p-1 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <SkipBack size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePreviousFrame}
                        disabled={currentFrame === 1}
                        className="rounded p-1 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePlay}
                        className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-500"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleNextFrame}
                        disabled={currentFrame === totalFrames}
                        className="rounded p-1 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsPlaying(false); setCurrentFrame(totalFrames) }}
                        disabled={currentFrame === totalFrames}
                        className="rounded p-1 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <SkipForward size={16} />
                    </button>

                    <span className="min-w-16 text-center text-[11px] text-gray-300">
                        {currentFrame} / {totalFrames}
                    </span>

                    <input
                        type="range"
                        min="1"
                        max={totalFrames}
                        value={currentFrame}
                        onChange={(e) => { setIsPlaying(false); setCurrentFrame(Number(e.target.value)) }}
                        className="h-1 flex-1 cursor-pointer accent-blue-500"
                    />

                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="rounded border border-gray-700 bg-gray-800 px-1.5 py-1 text-[11px] text-gray-100 outline-none"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                    </select>
                </div>
            </div>
        </section>
    )
}

export default Main_viewer