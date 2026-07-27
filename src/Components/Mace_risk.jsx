import { Activity, HeartPulse, TriangleAlert, } from 'lucide-react'

export default function Mace_risk() {
  // UI 확인용 Mock 데이터
  const riskScore = 18.7
  const riskLevel = '중간 위험'

  const safeRiskScore = Math.min(Math.max(riskScore, 0), 100)

  const riskPointX = 120 - 95 * Math.cos((Math.PI * safeRiskScore) / 100)

  const riskPointY = 120 - 95 * Math.sin((Math.PI * safeRiskScore) / 100)

  return (
    <section className="overflow-hidden rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl">
      {/* 제목 영역 */}
      <div className="flex items-center justify-between border-b border-blue-800/40 px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <HeartPulse size={18} />
            3년 내 MACE 위험도 예측
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            협착 개수, 환자 나이, 기저질환을 기반으로 위험도를 제공합니다.
          </p>
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
          MACE Beta
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* 위험도 요약 */}
        <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-4">
          <p className="text-sm text-gray-400">
            심혈관 사건 및 사망 위험도
          </p>

          <div className="mt-4">
            <div className="relative mx-auto w-full max-w-[300px]">
              <svg
                viewBox="0 0 240 150"
                className="h-auto w-full"
                role="img"
                aria-label={`3년 내 MACE 위험도 ${riskScore}%`}
              >
                {/* 전체 게이지 배경 */}
                <path
                  d="M 25 120 A 95 95 0 0 1 215 120"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* 낮음 구간 */}
                <path
                  d="M 25 120 A 95 95 0 0 1 72.5 37.73"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                />

                {/* 중간 구간 */}
                <path
                  d="M 72.5 37.73 A 95 95 0 0 1 167.5 37.73"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                />

                {/* 높음 구간 */}
                <path
                  d="M 167.5 37.73 A 95 95 0 0 1 215 120"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                />

                {/* 현재 위험도 위치 */}
                <circle
                  cx={riskPointX}
                  cy={riskPointY}
                  r="6"
                  fill="#ffffff"
                  stroke="#111827"
                  strokeWidth="3"
                />

                {/* 위험도 숫자 */}
                <text
                  x="120"
                  y="93"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="32"
                  fontWeight="700"
                >
                  {riskScore}%
                </text>

                {/* 위험 단계 */}
                <text
                  x="120"
                  y="117"
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="13"
                  fontWeight="600"
                >
                  {riskLevel}
                </text>
              </svg>

              {/* 위험 단계 라벨 */}
              <div className="-mt-1 flex justify-between px-1 text-xs text-gray-500">
                <span>낮음</span>
                <span>중간</span>
                <span>높음</span>
              </div>

              {/* 위험도 눈금 */}
              <div className="mt-1 flex justify-between px-1 text-[10px] text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 예측 입력 요인 */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Activity size={17} />
            예측 입력 요인
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">
                협착 개수
              </p>

              <p className="mt-1 text-base font-bold text-white">
                2개
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">
                환자 나이
              </p>

              <p className="mt-1 text-base font-bold text-white">
                67세
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">
                고혈압
              </p>

              <p className="mt-1 text-base font-bold text-white">
                있음
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">
                당뇨병
              </p>

              <p className="mt-1 text-base font-bold text-white">
                있음
              </p>
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-gray-400">
          <TriangleAlert
            size={16}
            className="mt-0.5 shrink-0 text-amber-300"
          />

          <p className="leading-relaxed">
            현재는 UI 확인을 위한 임시값입니다.
            <br />
            향후 실제 MACE 예측 API 응답과 연동할 예정입니다.
          </p>
        </div>
      </div>
    </section>
  )
}