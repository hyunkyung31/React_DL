import {
  Box,
  Flame,
  BrainCircuit,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'

function Xai_visualization({
    overlayMode,
    setOverlayMode,
    heatmapOpacity,
    setHeatmapOpacity,
    confidenceThreshold,
    setConfidenceThreshold,
    confidenceScore,
    uncertaintyScore,
    aiLoading,
    hasAiResult,
}) {

    const overlayOptions = [{
        value: 'boundingBox',
        label: 'Bounding Box',
        icon: Box,
    },
    {
        value: 'heatmap',
        label: 'Heatmap',
        icon: Flame,
    },
  ]

  return (
    <section className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      {/* 제목 영역 */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <BrainCircuit size={18} />
            XAI 시각화
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            AI가 병변 판단에 사용한 위치와 근거를 표시합니다.
          </p>
        </div>

        {aiLoading ? (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">분석 중...</span>
        ) : hasAiResult ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">분석 완료</span>
        ) : (
            <span className="rounded-full border border-gray-600 bg-gray-700/40 px-2.5 py-1 text-xs font-medium text-gray-300">분석 대기</span>
        )}
      </div>

      <div className="space-y-5 p-4">
        {/* 시각화 모드 */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-200">
            시각화 모드
          </p>

          <div className="grid grid-cols-2 gap-2">
            {overlayOptions.map((option) => {
              const Icon = option.icon
              const isSelected = overlayMode === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOverlayMode(option.value)}
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-xs transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={25} />

                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Heatmap 투명도 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="heatmapOpacity"
              className="text-sm font-medium text-gray-300"
            >
              Heatmap 투명도
            </label>

            <span className="text-sm font-semibold text-blue-300">
              {heatmapOpacity}%
            </span>
          </div>

          <input
            id="heatmapOpacity"
            type="range"
            min="0"
            max="100"
            value={heatmapOpacity}
            onChange={(event) =>
              setHeatmapOpacity(Number(event.target.value))
            }
            disabled={overlayMode === 'boundingBox'}
            className="h-1.5 w-full cursor-pointer accent-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
          />

          {overlayMode === 'boundingBox' && (
            <p className="mt-2 text-xs text-gray-500">
              Heatmap 표시 모드에서 조절할 수 있습니다.
            </p>
          )}
        </div>

        {/* Confidence Threshold */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="confidenceThreshold"
              className="text-sm font-medium text-gray-300"
            >
              Confidence Threshold
            </label>

            <span className="text-sm font-semibold text-blue-300">
              {confidenceThreshold}%
            </span>
          </div>

          <input
            id="confidenceThreshold"
            type="range"
            min="0"
            max="100"
            value={confidenceThreshold}
            onChange={(event) =>
              setConfidenceThreshold(Number(event.target.value))
            }
            className="h-1.5 w-full cursor-pointer accent-blue-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            설정값 이상의 탐지 결과만 표시합니다.
          </p>
        </div>

        {/* Confidence / Uncertainty Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck size={17} />

              <span className="text-sm font-medium">
                Confidence
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-white">
              {confidenceScore != null
               ? `${confidenceScore}%` : '-'}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {confidenceScore != null
                ? 'AI 판단 신뢰도' : '분석 결과 없음'}
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-amber-300">
              <TriangleAlert size={17} />

              <span className="text-sm font-medium">
                Uncertainty
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-white">
              {uncertaintyScore != null
                ? `${uncertaintyScore}%` : '-'}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {uncertaintyScore != null
                ? '신뢰도 기반 보완값' : '분석 결과 없음'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Xai_visualization;