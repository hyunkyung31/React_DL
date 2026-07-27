import { useState } from 'react'
import axios from 'axios'
import { CheckCircle2, FileCheck2, Pencil } from 'lucide-react'

const API_BASE = 'http://34.80.83.7:8000'

export default function EmrConfirmPanel({
  impression = '',
  selectedVessels = [],
  pciNeeded = null,
  onSignOff,
  patientId,
}) {
  const [isSignedOff, setIsSignedOff] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasImpression = Boolean(impression.trim())

  const handleConfirm = async () => {
    if (!hasImpression) {
      alert('최종 임상 소견을 입력해주세요.')
      return
    }

    if (!patientId) {
      alert('환자를 먼저 선택하세요.')
      return
    }

    const confirmed = window.confirm(
      '최종 판독을 확정하고 EMR로 전송하시겠습니까?\n확정 후에는 판독 내용을 수정할 수 없습니다.'
    )

    if (!confirmed) return

    try {
      setIsSubmitting(true)

      const payload = {
        patient_id: patientId,
        finalized: true,
        final_result: impression.trim(),
        ai_result: null,
        report_ready: true,
        emr_transmitted: true,
      }

      if (onSignOff) {
        await onSignOff(payload)
      } else {
        const token = localStorage.getItem('access')
        await axios.post(`${API_BASE}/api/emr-signoffs/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      setIsSignedOff(true)
      alert('최종 판독 확정 및 EMR 전송이 완료되었습니다.')
    } catch (error) {
      console.error('EMR 확정 오류:', error)
      alert(
        error?.response?.data?.detail ||
        error?.message ||
        'EMR 확정 처리 중 오류가 발생했습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm('확정된 판독을 다시 수정하시겠습니까?')

    if (!confirmed) return

    setIsSignedOff(false)
  }

  return (
    <div className="space-y-3">
      {/* 상태 영역 */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2
                size={17}
                className={ isSignedOff ? 'text-emerald-400' : 'text-blue-400' }
              />

              <span className="text-sm font-semibold text-white">
                EMR Sign-off 상태
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              최종 판독 완료 여부를 확인합니다.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              isSignedOff
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}
          >
            {isSignedOff ? '확정 완료 (Signed-off)' : '미확정 (Draft)'}
          </span>
        </div>

        {/* 상태 스위치 */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-700 bg-gray-950/50 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-gray-200">
              최종 판독 완료
            </p>

            <p className="mt-0.5 text-[11px] text-gray-500">
              EMR 전송 버튼을 통해 확정할 수 있습니다.
            </p>
          </div>

          <div
            role="switch"
            aria-checked={isSignedOff}
            aria-label={
              isSignedOff
                ? '최종 판독 확정 완료' : '최종 판독 미확정'
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
              isSignedOff
                ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isSignedOff
                  ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {!hasImpression && !isSignedOff && (
          <p className="mt-3 text-xs text-amber-300">
            최종 임상 소견을 입력해야 판독을 확정할 수 있습니다.
          </p>
        )}
      </div>

      {/* 확정 또는 초기화 버튼 */}
      <div className="w-full min-w-0">
        {isSignedOff ? (
          <button
            type="button"
            onClick={handleReset}
            className="box-border flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-700">
            <Pencil size={16} />
            <span>판독 수정하기</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isSubmitting || !hasImpression
            }
            className="box-border flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle2 size={16} />

            {isSubmitting
              ? 'EMR 전송 중...' : '최종 진단 확정 및 EMR 전송'}
          </button>
        )}
      </div>
    </div>
  )
}
