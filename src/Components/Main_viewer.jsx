import { useEffect, useRef, useState } from 'react'
import angioImage from '../assets/angio_sample.png'
import {Play, Pause, SkipBack,SkipForward, ChevronLeft, ChevronRight,} from 'lucide-react'

function Main_viewer() {
    const [currentFrame, setCurrentFrame] = useState(125)
    const [isPlaying, setIsPlaying] = useState(false)
    const [selectedSeries, setSelectedSeries] = useState('1')
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [scale, setScale] = useState(1)
    const [isZoomMode, setIsZoomMode] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    })

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        imageX: 0,
        imageY: 0,
    })

    const totalFrames = 250

    useEffect(() => {
        if (!isPlaying) return

        const frameInterval = 1000 / (10 * playbackSpeed)

        const playTimer = setInterval(() => {
            setCurrentFrame((previousFrame) => {
                if (previousFrame >= totalFrames) {
                    setIsPlaying(false)
                    return totalFrames
            }

            return previousFrame + 1
        })
    }, frameInterval)

        return () => {
            clearInterval(playTimer)
        }
    }, [isPlaying, playbackSpeed, totalFrames])

    const handlePreviousFrame = () => {
        setIsPlaying(false)

        setCurrentFrame((previousFrame) =>
            Math.max(previousFrame - 1, 1)
        )
    }

    const handleNextFrame = () => {
        setIsPlaying(false)

        setCurrentFrame((previousFrame) => {
        return Math.min(previousFrame + 1, totalFrames)
        })
    }

    const handlePlay = () => {
        if (currentFrame >= totalFrames) {
            setCurrentFrame(1)
            setIsPlaying(true)
            return
    }

        setIsPlaying((previousState) => !previousState)
    }

    const handleReset = () => {
        setIsPlaying(false)
        setCurrentFrame(125)
        setPlaybackSpeed(1)

        setScale(1)
        setIsZoomMode(false)
        setIsDragging(false)
        setPosition({
            x: 0,
            y: 0,
        })
    }

    const handleZoomToggle = () => {
        setIsZoomMode((previousState) => {
            const nextState = !previousState

            if (!nextState) {
                setScale(1)
                setPosition({
                    x: 0,
                    y: 0,
                })
                setIsDragging(false)
            }

            return nextState
        })
    }

    const handleWheelZoom = (event) => {
        if (!isZoomMode) return

        event.preventDefault()

        const zoomAmount = event.deltaY < 0 ? 0.2 : -0.2

        setScale((previousScale) => {
            const nextScale = Math.min(
                Math.max(previousScale + zoomAmount, 1), 4
            )

            if (nextScale === 1) {
                setPosition({
                    x: 0,
                    y: 0,
                })
            }

            return nextScale
        })
    }

    const handleMouseDown = (event) => {
        if (!isZoomMode || scale <= 1) return

        setIsDragging(true)

        dragStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            imageX: position.x,
            imageY: position.y,
        }
    }

    const handleMouseMove = (event) => {
        if (!isDragging) return

        const moveX =
            event.clientX - dragStartRef.current.mouseX

        const moveY =
            event.clientY - dragStartRef.current.mouseY

        setPosition({
            x: dragStartRef.current.imageX + moveX,
            y: dragStartRef.current.imageY + moveY,
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    return (
        <section className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        {/* 상단 영상 뷰어 도구 모음 */}
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-white">
                영상 뷰어
            </h2>

            <select
                value={selectedSeries}
                onChange={(event) => setSelectedSeries(event.target.value)}
                className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
            >
                <option value="1">시리즈 1</option>
                <option value="2">시리즈 2</option>
                <option value="3">시리즈 3</option>
            </select>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                onClick={handleZoomToggle}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isZoomMode
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
                줌
            </button>

            <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
                팬
            </button>

            <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
                측정
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
                className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
                전체화면
            </button>
            </div>
        </div>

        {/* 영상이 표시될 영역 */}
        <div
            className={`relative flex flex-1 items-center justify-center overflow-hidden bg-black ${
                isZoomMode && scale > 1
                    ? isDragging
                        ? 'cursor-grabbing'
                        : 'cursor-grab'
                    : isZoomMode
                        ? 'cursor-zoom-in'
                        : ''
            }`}
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            >
            <div className="absolute left-4 top-4 z-10 space-y-1 text-xs text-gray-200">
            <p>Patient ID : 00012345</p>
            <p>Study Date : 2026-07-25</p>
            <p>Series : {selectedSeries}</p>
            </div>

            <div className="absolute right-4 top-4 z-10 space-y-1 text-right text-xs text-gray-200">
            <p>
                Frame : {currentFrame} / {totalFrames}
            </p>
            <p>LAO 45°</p>
            <p>CRAN 20°</p>
            </div>

            <div className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-black">

                <div className="flex h-full w-full items-center justify-center">
                    <img
                    src={angioImage}
                    alt="혈관조영술"
                    className="max-h-full max-w-full select-none object-contain"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging
                            ? 'none' : 'transform 0.1s ease-out',
                    }}
                    draggable={false}
                    />
                </div>

            </div>

            <button
                type="button"
                onClick={handlePreviousFrame}
                disabled={currentFrame === 1}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
                title="이전 프레임"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                type="button"
                onClick={handleNextFrame}
                disabled={currentFrame === totalFrames}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
                title="다음 프레임"
            >
                <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-4 text-xs text-gray-200">
            <p>RCA</p>
            <p>W: 4095 / L: 2048</p>
            </div>
        </div>

                {/* 하단 재생 컨트롤 */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
            <div className="flex items-center gap-3">
            {/* 첫 프레임 */}
            <button
                type="button"
                onClick={() => {
                setIsPlaying(false)
                setCurrentFrame(1)
                }}
                disabled={currentFrame === 1}
                className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="첫 프레임"
            >
                <SkipBack size={18} />
            </button>

            {/* 이전 프레임 */}
            <button
                type="button"
                onClick={handlePreviousFrame}
                disabled={currentFrame === 1}
                className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="이전 프레임"
            >
                <ChevronLeft size={18} />
            </button>

            {/* 재생 / 일시정지 */}
            <button
                type="button"
                onClick={handlePlay}
                className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-500"
                title={isPlaying ? '일시정지' : '재생'}
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* 다음 프레임 */}
            <button
                type="button"
                onClick={handleNextFrame}
                disabled={currentFrame === totalFrames}
                className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="다음 프레임"
            >
                <ChevronRight size={18} />
            </button>

            {/* 마지막 프레임 */}
            <button
                type="button"
                onClick={() => {
                setIsPlaying(false)
                setCurrentFrame(totalFrames)
                }}
                disabled={currentFrame === totalFrames}
                className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="마지막 프레임"
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
                onChange={(event) => {
                setIsPlaying(false)
                setCurrentFrame(Number(event.target.value))
                }}
                className="h-1 flex-1 cursor-pointer accent-blue-500"
            />

            <select
                value={playbackSpeed}
                onChange={(event) =>
                setPlaybackSpeed(Number(event.target.value))
                }
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
)
}

export default Main_viewer