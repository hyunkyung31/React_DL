import { Activity, HeartPulse, TriangleAlert, } from 'lucide-react'

export default function Mace_risk() {
  // UI 확인용 Mock 데이터
  const riskScore = 18.7
  const riskLevel = '중간 위험'

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
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">
                심혈관 사건 및 사망 위험도
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {riskScore}%
              </p>
            </div>

            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
              {riskLevel}
            </span>
          </div>

          {/* 위험도 게이지 */}
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>낮음</span>
              <span>중간</span>
              <span>높음</span>
            </div>

            <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                style={{ width: `${riskScore}%` }}
              />
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
              <p className="text-gray-500">협착 개수</p>
              <p className="mt-1 font-semibold text-white">2개</p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">환자 나이</p>
              <p className="mt-1 font-semibold text-white">67세</p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">고혈압</p>
              <p className="mt-1 font-semibold text-white">있음</p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
              <p className="text-gray-500">당뇨병</p>
              <p className="mt-1 font-semibold text-white">있음</p>
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-gray-400">
          <TriangleAlert
            size={16}
            className="mt-0.5 shrink-0 text-amber-300"
          />

          <p>
            현재는 UI 확인을 위한 임시값이며, 향후 실제 MACE 예측 API 응답과 연동할 예정입니다.
          </p>
        </div>
      </div>
    </section>
  )
}