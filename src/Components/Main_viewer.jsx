import { useEffect, useRef, useState } from 'react'
import angioImage from '../assets/angio_sample.png'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Maximize2, Minimize2, FolderSearch } from 'lucide-react'

function Main_viewer({
    patientData,
    overlayMode,
    confidenceThreshold,
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

    const imageRef = useRef(null)
    const overlayCanvasRef = useRef(null)

    const [position, setPosition] = useState({ x: 0, y: 0 })
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 })
    const viewerRef = useRef(null)

    const totalFrames = 250

    const mockBoundingBoxes = [{
        id: 1,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        label: 'Stenosis',
        confidence: 0.92,
    },
    {
        id: 2,
        x: 365,
        y: 310,
        width: 105,
        height: 80,
        label: 'Stenosis',
        confidence: 0.81,
    },
    ]

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

    // 전체화면 상태 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement))
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // Bounding Box Canvas 렌더링
    useEffect(() => {
        const image = imageRef.current
        const canvas = overlayCanvasRef.current

        if (!image || !canvas || !isImageLoaded) return

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

            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
            context.clearRect(0, 0, imageWidth, imageHeight)

            const shouldShowBoundingBox = overlayMode === 'boundingBox'
            if (!shouldShowBoundingBox) return

            const scaleX = imageWidth / image.naturalWidth
            const scaleY = imageHeight / image.naturalHeight

            mockBoundingBoxes
                .filter((box) => box.confidence * 100 >= confidenceThreshold)
                .forEach((box) => {
                    const boxX = box.x * scaleX
                    const boxY = box.y * scaleY
                    const boxWidth = box.width * scaleX
                    const boxHeight = box.height * scaleY

                    const labelText = `${box.label} ${Math.round(box.confidence * 100)}%`

                    context.strokeStyle = '#ef4444'
                    context.lineWidth = 5
                    context.strokeRect(boxX, boxY, boxWidth, boxHeight)

                    context.font = 'bold 18px sans-serif'
                    const labelWidth = context.measureText(labelText).width + 12
                    const labelHeight = 22

                    context.fillStyle = '#ef4444'
                    context.fillRect(boxX, Math.max(boxY - labelHeight, 0), labelWidth, labelHeight)

                    context.fillStyle = '#ffffff'
                    context.fillText(labelText, boxX + 6, Math.max(boxY - 7, 15))
                })
        }

        drawBoundingBoxes()
        window.addEventListener('resize', drawBoundingBoxes)

        return () => {
            window.removeEventListener('resize', drawBoundingBoxes)
        }
    }, [overlayMode, confidenceThreshold, isImageLoaded])

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
    }

    const handleZoomToggle = () => {
        setIsZoomMode((prev) => {
            const next = !prev
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
        if (!isZoomMode || scale <= 1) return
        setIsDragging(true)
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            imageX: position.x,
            imageY: position.y,
        }
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        const moveX = e.clientX - dragStartRef.current.mouseX
        const moveY = e.clientY - dragStartRef.current.mouseY
        setPosition({
            x: dragStartRef.current.imageX + moveX,
            y: dragStartRef.current.imageY + moveY,
        })
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => setIsDragging(false)

    // 선택된 환자 데이터가 없을 경우 처리
    if (!patientData) {
        return (
            <section className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400">
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="rounded-full bg-gray-800 p-4 text-blue-500">
                        <FolderSearch size={36} />
                    </div>
                    <h3 className="text-lg font-medium text-white">선택된 환자 영상이 없습니다</h3>
                    <p className="text-sm text-gray-400">
                        좌측 메뉴의 환자 목록이나 빠른 검색을 통해 진단할 환자를 선택해 주세요.
                    </p>
                </div>
            </section>
        );
    }

    // 썸네일 스트립 바를 위한 주변 프레임 목록 생성 (현재 프레임 기준 앞뒤로 3개씩 총 7개)
    const getThumbnailFrames = () => {
        const frames = []
        const start = Math.max(1, currentFrame - 3)
        const end = Math.min(totalFrames, currentFrame + 3)
        for (let i = start; i <= end; i++) {
            frames.push(i)
        }
        return frames
    }

    return (
        <section
            ref={viewerRef}
            className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900"
        >
            {/* 상단 툴바 */}
            <div className="flex min-h-14 items-center justify-between border-b border-gray-800 px-4 py-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-base font-semibold text-white">
                        {patientData.name ? `${patientData.name} 영상 뷰어` : patientData.title}
                    </h2>
                    <select
                        value={selectedSeries}
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                    >
                        <option value="1">시리즈 1</option>
                        <option value="2">시리즈 2</option>
                        <option value="3">시리즈 3</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleZoomToggle}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                            isZoomMode ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        줌
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        onClick={handleFullscreen}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                        <span>{isFullscreen ? '전체화면 종료' : '전체화면'}</span>
                    </button>
                </div>
            </div>

            {/* 중앙 이미지 뷰어 영역 */}
            <div
                className={`relative flex flex-1 items-center justify-center overflow-hidden bg-black select-none ${
                    isZoomMode && scale > 1
                        ? isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        : isZoomMode ? 'cursor-zoom-in' : ''
                }`}
                onWheel={handleWheelZoom}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute left-4 top-4 z-10 space-y-1 text-xs text-gray-200 pointer-events-none">
                    <p>Patient ID : {patientData.patientId || patientData.id || '00012345'}</p>
                    <p>Study Date : {patientData.date || '2026-07-25'}</p>
                    <p>Series : {selectedSeries}</p>
                </div>

                <div className="absolute right-4 top-4 z-10 space-y-1 text-right text-xs text-gray-200 pointer-events-none">
                    <p>Frame : {currentFrame} / {totalFrames}</p>
                    <p>LAO 45° / CRAN 20°</p>
                </div>

                <div className="flex h-full w-full items-center justify-center">
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
                            src={patientData?.imageUrl || patientData?.url || angioImage}
                            alt="혈관조영술"
                            onLoad={() => setIsImageLoaded(true)}
                            className="max-h-full max-w-full select-none object-contain"
                            draggable={false}
                        />
                        <canvas
                            ref={overlayCanvasRef}
                            className="pointer-events-none absolute left-0 top-0 h-full w-full"
                            aria-label="AI 협착 탐지 Bounding Box"
                        />
                      </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handlePreviousFrame}
                    disabled={currentFrame === 1}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    type="button"
                    onClick={handleNextFrame}
                    disabled={currentFrame === totalFrames}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                >
                    <ChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 left-4 text-xs text-gray-200 pointer-events-none">
                    <p>{patientData.vessel || 'RCA'}</p>
                    <p>W: 4095 / L: 2048</p>
                </div>
            </div>

            {/* 하단 재생 컨트롤 및 썸네일 스트립 바 영역 */}
            <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-3">
                {/* 썸네일 스트립 바 */}
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                    <span className="text-xs text-gray-400 mr-2">프레임 썸네일:</span>
                    {getThumbnailFrames().map((frameNum) => {
                        const isSelected = frameNum === currentFrame
                        return (
                            <button
                                key={frameNum}
                                type="button"
                                onClick={() => {
                                    setIsPlaying(false)
                                    setCurrentFrame(frameNum)
                                }}
                                className={`group relative flex flex-col items-center rounded overflow-hidden border transition-all ${
                                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105' : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <div className="h-10 w-14 bg-black flex items-center justify-center overflow-hidden relative">
                                    {patientData?.mediaType === 'video' ? (
                                        // 영상 파일인 경우 이미지 대신 프레임 번호와 비디오 아이콘/텍스트 표시
                                        <div className="flex flex-col items-center justify-center text-[10px] text-gray-300 bg-gray-800 w-full h-full">
                                            <span className="font-bold text-blue-400">VIDEO</span>
                                            <span>F-{frameNum}</span>
                                        </div>
                                    ) : (
                                        <img 
                                            src={patientData?.imageUrl || patientData?.url || angioImage} 
                                            alt={`프레임 ${frameNum}`} 
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[10px] w-full py-0.5 text-center ${isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}>
                                    {frameNum}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* 컨트롤 바 (재생, 슬라이더, 속도조절 등) */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => { setIsPlaying(false); setCurrentFrame(1) }}
                        disabled={currentFrame === 1}
                        className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <SkipBack size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePreviousFrame}
                        disabled={currentFrame === 1}
                        className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePlay}
                        className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-500"
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleNextFrame}
                        disabled={currentFrame === totalFrames}
                        className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsPlaying(false); setCurrentFrame(totalFrames) }}
                        disabled={currentFrame === totalFrames}
                        className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                    >
                        <SkipForward size={18} />
                    </button>

                    <span className="min-w-20 text-center text-xs text-gray-300">
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
                        className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                    </select>
                </div>
            </div>
        </section>
    );
}

export default Main_viewer;