import { useState } from 'react'
import { BoxSelect, Check, CheckSquare, Sparkles, Type, } from 'lucide-react'

const VESSELS = [
  {
    id: 'LAD',
  },
  {
    id: 'RCA',
  },
  {
    id: 'LCX',
  },
  {
    id: 'LMT',
  },
]

export default function FindingChecklist({
  selectedVessels = [],
  setSelectedVessels,
  pciNeeded = null,
  setPciNeeded,
  onGenerateImpression,
  onCanvasDrawMode,
}) {
  const [isDrawingBBox, setIsDrawingBBox] = useState(false)

  const [isDrawingText, setIsDrawingText] = useState(false)

  const [canvasText, setCanvasText] = useState('')

  const [isAiGenerating, setIsAiGenerating] = useState(false)

  /**
   * 혈관 선택 상태 변경
   */
  const handleVesselToggle = (vesselId) => {
    const updatedVessels =
      selectedVessels.includes(vesselId)
        ? selectedVessels.filter(
            (selectedId) =>
              selectedId !== vesselId
          )
        : [...selectedVessels, vesselId]

    if (setSelectedVessels) { setSelectedVessels(updatedVessels) }

    triggerMockImpressionGeneration( updatedVessels, pciNeeded )
  }

  /**
   * PCI 치료 방침 변경
   */
  const handlePciChange = (value) => {
    if (setPciNeeded) { setPciNeeded(value) }

    triggerMockImpressionGeneration( selectedVessels, value)
  }

  /**
   * 현재는 UI 테스트를 위한 Mock 소견 생성 함수입니다.
   *
   * 추후 실제 XAI/LLM API가 연결되면 이 함수 내부의
   * setTimeout 및 문장 조립 코드를 제거하고,
   * 부모 컴포넌트의 실제 API 요청 함수를 호출하면 됩니다.
   */
  const triggerMockImpressionGeneration = ( vessels, pci ) => {
    setIsAiGenerating(true)

    window.setTimeout(() => { let generatedText = ''

      if (vessels.length === 0) {
        generatedText = [
          '[AI 자동 생성 소견]',
          '',
          '• 병변 위치',
          '  주요 관상동맥에서 유의미한 협착 소견이 관찰되지 않음.',
          '',
          '• 권장 처치',
          '  정기적인 경과 관찰을 권장함.',
        ].join('\n')
      } else {
        let treatmentText = '치료 방침을 선택해 주세요.'

        if (pci === 'needed') { treatmentText = '관상동맥중재술(PCI)을 권장함.' }

        if (pci === 'observation') { treatmentText = '약물 치료 및 추적 관찰을 권장함.' }

        generatedText = [
          '[AI 자동 생성 소견]',
          '',
          '• 병변 위치',
          `  ${vessels.join(', ')}에서 유의미한 혈관 협착이 관찰됨.`,
          '',
          '• AI 분석 신뢰도',
          '  실제 XAI 분석 결과 연동 예정',
          '',
          '• 권장 처치',
          `  ${treatmentText}`,
        ].join('\n')
      }

      if (onGenerateImpression) { onGenerateImpression(generatedText) }

      setIsAiGenerating(false)
    }, 400)
  }

  /**
   * Canvas BBox 모드
   */
  const toggleBBoxMode = () => {
    const nextState = !isDrawingBBox

    setIsDrawingBBox(nextState)

    if (nextState) { setIsDrawingText(false) }

    if (onCanvasDrawMode) { onCanvasDrawMode( nextState ? 'bbox' : 'none' ) }
  }

  /**
   * Canvas 텍스트 모드
   */
  const toggleTextMode = () => {
    const nextState = !isDrawingText

    setIsDrawingText(nextState)

    if (nextState) { setIsDrawingBBox(false) }

    if (onCanvasDrawMode) {
      onCanvasDrawMode( nextState ? 'text' : 'none', canvasText )
    }
  }

  const handleCanvasTextChange = (event) => {
    const value = event.target.value

    setCanvasText(value)

    if ( onCanvasDrawMode && isDrawingText ) { onCanvasDrawMode('text', value) }
  }

  return (
    <div className="space-y-4">
      {/* 패널 제목 */}
      <div className="flex items-center justify-between border-b border-blue-800/40 pb-2">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-blue-400" />

          <h2 className="text-sm font-semibold text-white">
            판독 체크리스트
          </h2>
        </div>

        <span className="rounded border border-blue-700/60 bg-blue-950/70 px-2 py-0.5 text-[10px] font-medium text-blue-300">
          수동 검증 모드
        </span>
      </div>

      {/* Canvas 판독 주석 */}
      <section className="space-y-2.5">
        <div>
          <h3 className="text-xs font-semibold text-gray-300">
            Canvas 판독 주석
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-500">
            영상 위에 판독 위치와 설명을 직접 추가합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleBBoxMode}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
              isDrawingBBox
                ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow-sm'
                : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-blue-600/70 hover:bg-gray-800'
            }`}
          >
            <BoxSelect size={15} className="shrink-0" />

            <span className="truncate">
              {isDrawingBBox ? 'BBox 그리는 중' : 'BBox 추가'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTextMode}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
              isDrawingText
                ? 'border-indigo-400 bg-indigo-500/15 text-indigo-200 shadow-sm'
                : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-blue-600/70 hover:bg-gray-800'
            }`}
          >
            <Type size={15} className="shrink-0" />

            <span className="truncate">
              {isDrawingText ? '텍스트 입력 중' : '텍스트 추가'}
            </span>
          </button>
        </div>

        {isDrawingText && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/10 p-2.5">
            <input
              type="text"
              value={canvasText}
              onChange={handleCanvasTextChange}
              placeholder="Canvas에 표시할 판독 주석을 입력하세요."
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-2.5 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
            />

            <p className="mt-1.5 text-[10px] leading-relaxed text-gray-500">
              입력 후 영상에서 원하는 위치를
              클릭하면 주석이 표시됩니다.
            </p>
          </div>
        )}
      </section>

      {/* 협착 혈관 */}
      <section className="space-y-2.5 border-t border-blue-900/30 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-gray-300">
              협착 의심 혈관
            </h3>

            <p className="mt-0.5 text-[10px] text-gray-500">
              복수 선택할 수 있습니다.
            </p>
          </div>

          <span
            className={`shrink-0 text-[10px] font-medium ${
              selectedVessels.length > 0
                ? 'text-blue-300' : 'text-gray-500'
            }`}
          >
            {selectedVessels.length} /{' '}
            {VESSELS.length} 선택
          </span>
        </div>

        {/* 혈관 선택 */}
        <div className="grid grid-cols-4 gap-2">
          {VESSELS.map((vessel) => {
            const isSelected =
              selectedVessels.includes(vessel.id)

            return (
              <label
                key={vessel.id}
                className={`flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 py-2.5 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/15 text-blue-100 shadow-sm'
                    : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-blue-600/60 hover:bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    handleVesselToggle(vessel.id)
                  }
                  className="sr-only"
                />

                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-500 text-white'
                      : 'border-gray-500 bg-gray-900'
                  }`}
                >
                  {isSelected && (
                    <Check
                      size={10}
                      strokeWidth={3}
                    />
                  )}
                </span>

                <span className="truncate text-xs font-semibold">
                  {vessel.id}
                </span>
              </label>
            )
          })}
        </div>
        

        {/* 선택 결과 요약 */}
        <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950/30 px-3 py-2">
          <span className="mr-1 text-[10px] text-gray-500">
            선택 부위
          </span>

          {selectedVessels.length > 0 ? (
            selectedVessels.map((vesselId) => (
              <span
                key={vesselId}
                className="rounded-full border border-blue-600/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-200"
              >
                {vesselId}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-600">
              선택된 혈관 없음
            </span>
          )}
        </div>
      </section>

      {/* 치료 방침 */}
      <section className="space-y-3 border-t border-blue-900/30 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-200">
              치료 방침
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              최종 권장 치료를 선택합니다.
            </p>
          </div>

          <span className="shrink-0 text-xs text-gray-500">
            단일 선택
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* PCI 권장 */}
          <label
            className={`flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 transition-all ${
              pciNeeded === 'needed'
                ? 'border-red-500 bg-red-500/15 text-red-100 shadow-sm'
                : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-red-500/60 hover:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name="pciOption"
              value="needed"
              checked={pciNeeded === 'needed'}
              onChange={() => handlePciChange('needed')}
              className="sr-only"
            />

            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all ${
                pciNeeded === 'needed'
                  ? 'border-red-400 bg-red-500'
                  : 'border-gray-500 bg-gray-900'
              }`}
            >
              {pciNeeded === 'needed' && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>

            <span className="truncate text-sm font-semibold">
              PCI 권장
            </span>
          </label>

          {/* 경과 관찰 */}
          <label
            className={`flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 transition-all ${
              pciNeeded === 'observation'
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-100 shadow-sm'
                : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-emerald-500/60 hover:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name="pciOption"
              value="observation"
              checked={pciNeeded === 'observation'}
              onChange={() => handlePciChange('observation')}
              className="sr-only"
            />

            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all ${
                pciNeeded === 'observation'
                  ? 'border-emerald-400 bg-emerald-500'
                  : 'border-gray-500 bg-gray-900'
              }`}
            >
              {pciNeeded === 'observation' && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>

            <span className="truncate text-sm font-semibold">
              경과 관찰
            </span>
          </label>
        </div>
      </section>

      {/* AI 소견 생성 상태 */}
      <div className="h-5 pt-1">
        <div
          className={`flex items-center gap-1.5 text-xs text-blue-400 transition-opacity duration-200 ${
            isAiGenerating
              ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Sparkles
            size={14}
            className={ isAiGenerating ? 'animate-pulse' : ''}
          />

          <span>
            AI 판독 소견 생성 중...
          </span>
        </div>
      </div>
    </div>
  )
}