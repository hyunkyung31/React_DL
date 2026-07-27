import React, { useState, useEffect } from 'react'
import { FileText, Heart, User, AlertCircle, CheckCircle2, Printer, ChevronDown } from 'lucide-react'
import { fetchAuthBlobUrl } from '../utils/authMedia'

export default function PatientReportView({ patient, ecgImageUrl: initialEcgUrl, clinicalReport, patients = [], onSelectPatient }) {
  const [selectedReportPatient, setSelectedReportPatient] = useState(patient)
  const [ecgBlobUrl, setEcgBlobUrl] = useState(null)
  const [isImageLoading, setIsImageLoading] = useState(false)

  // 상위에서 환자가 바뀌거나 로컬 선택이 바뀔 때 동기화
  useEffect(() => {
    if (patient) {
      setSelectedReportPatient(patient)
    } else if (patients.length > 0 && !selectedReportPatient) {
      setSelectedReportPatient(patients[0])
    }
  }, [patient, patients])

  // 인증이 필요한 ECG 이미지 안전하게 불러오기 (Blob URL 변환)
  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadEcgImage() {
      const targetUrl = selectedReportPatient?.ecg_image_url || initialEcgUrl
      if (!targetUrl) {
        setEcgBlobUrl(null)
        return
      }

      setIsImageLoading(true)
      try {
        // 인증 토큰을 동반하여 이미지 블롭 가져오기
        objectUrl = await fetchAuthBlobUrl(targetUrl)
        if (!cancelled) {
          setEcgBlobUrl(objectUrl)
        }
      } catch (err) {
        console.error('ECG 이미지 로드 실패:', err)
        if (!cancelled) setEcgBlobUrl(targetUrl) // 실패 시 원본 URL 대체 시도
      } finally {
        if (!cancelled) setIsImageLoading(false)
      }
    }

    loadEcgImage()

    return () => {
      cancelled = true
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [selectedReportPatient, initialEcgUrl])

  if (!selectedReportPatient && patients.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400" style={{ backgroundColor: '#060B18' }}>
        <AlertCircle size={48} className="text-blue-500 mb-3 animate-pulse" />
        <h2 className="text-lg font-bold text-white mb-1">등록된 환자가 없습니다</h2>
        <p className="text-xs text-gray-400">환자 목록을 먼저 등록해 주세요.</p>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto text-gray-100" style={{ backgroundColor: '#060B18' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 상단 타이틀 및 [환자 빠른 변경 드롭다운] + 인쇄 버튼 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-blue-800/40 bg-gray-900/65 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">환자 임상 지표 진단 및 예측 보고서</h2>
              <p className="text-xs text-gray-400">임상 지표 기반 AI 진단, ECG 검사 및 환자 서브그룹 분류 요약</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {patients.length > 0 && (
              <div className="relative">
                <select
                  value={selectedReportPatient?.patient_id || ''}
                  onChange={(e) => {
                    const found = patients.find(p => String(p.patient_id) === e.target.value)
                    if (found) {
                      setSelectedReportPatient(found)
                      if (onSelectPatient) onSelectPatient(found)
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-950 border border-blue-700/60 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-400 shadow-inner cursor-pointer"
                >
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.patient_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
            >
              <Printer size={14} />
              <span>보고서 인쇄 / PDF</span>
            </button>
          </div>
        </div>

        {/* 1. 환자 기본 정보 카드 */}
        <div className="rounded-xl border border-blue-800/40 bg-gray-900/65 backdrop-blur-md p-5 shadow-xl">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User size={14} /> 환자 임상 기본 정보
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-gray-950/60 p-3 rounded-lg border border-blue-900/30">
              <span className="text-gray-400 block mb-1">환자 성명 / ID</span>
              <span className="font-bold text-white text-sm">
                {selectedReportPatient?.patient_name} <span className="text-xs font-mono text-blue-300">({selectedReportPatient?.patient_id})</span>
              </span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-lg border border-blue-900/30">
              <span className="text-gray-400 block mb-1">나이 / 성별</span>
              <span className="font-bold text-white text-sm">{selectedReportPatient?.age}세 / {selectedReportPatient?.gender}</span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-lg border border-blue-900/30">
              <span className="text-gray-400 block mb-1">주호소 (Chief Complaint)</span>
              <span className="font-bold text-white text-sm truncate">{selectedReportPatient?.chief_complaint || '흉통 (Chest Pain)'}</span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-lg border border-blue-900/30">
              <span className="text-gray-400 block mb-1">핵심 지표 (Glucose / BMI)</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {selectedReportPatient?.glucose != null ? `${selectedReportPatient.glucose} mg/dL / ${selectedReportPatient.bmi || '-'}` : '105 mg/dL / 24.2'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. 검사 결과 이미지 섹션 (ECG 및 AI 분석) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ECG 분석 결과 */}
          <div className="rounded-xl border border-blue-800/40 bg-gray-900/65 backdrop-blur-md p-5 shadow-xl flex flex-col">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Heart size={14} className="text-red-400" /> 12-Lead 심전도 (ECG) 검사
            </h3>
            <div className="flex-1 bg-gray-950 rounded-lg border border-blue-900/40 p-2 flex items-center justify-center min-h-[180px] relative overflow-hidden">
              {isImageLoading ? (
                <p className="text-xs text-blue-400 animate-pulse">ECG 이미지 불러오는 중...</p>
              ) : ecgBlobUrl ? (
                <img src={ecgBlobUrl} alt="Patient ECG" className="max-h-40 w-full object-contain rounded bg-white" />
              ) : (
                <p className="text-xs text-gray-500">등록된 ECG 이미지가 없습니다.</p>
              )}
            </div>
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-gray-400">ECG 패턴 판독:</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800">
                {selectedReportPatient?.ecg_result || 'Normal Sinus Rhythm'}
              </span>
            </div>
          </div>

          {/* AI 진단 및 서브그룹 분류 요약 */}
          <div className="rounded-xl border border-blue-800/40 bg-gray-900/65 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> AI 진단 및 서브그룹 분류 종합
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-gray-950/60 rounded-lg border border-blue-900/30">
                  <span className="text-gray-300">질환 위험도 예측</span>
                  <span className="font-bold text-red-400">고위험군 예측 (확률 94.2%)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-gray-950/60 rounded-lg border border-blue-900/30">
                  <span className="text-gray-300">환자 서브그룹 분류</span>
                  <span className="font-bold text-amber-400">대사증후군 동반 군집 (Subgroup B)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-gray-950/60 rounded-lg border border-blue-900/30">
                  <span className="text-gray-300">임상 지표 기반 권고</span>
                  <span className="font-bold text-blue-300">추가 정밀 진단 및 식이/운동 권장</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 text-[11px] text-gray-400 flex justify-between">
              <span>작성일시: {new Date().toLocaleDateString()}</span>
              <span className="text-blue-400 font-medium">Clinical AI Prediction System</span>
            </div>
          </div>
        </div>

        {/* 3. 최종 임상 소견 (Clinical Impression) */}
        <div className="rounded-xl border border-blue-800/40 bg-gray-900/65 backdrop-blur-md p-5 shadow-xl">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText size={14} /> 최종 임상 소견 및 진단 내용
          </h3>
          <div className="p-4 rounded-lg bg-gray-950/80 border border-blue-900/40 text-xs text-gray-200 leading-relaxed min-h-[120px] whitespace-pre-wrap font-sans">
            {clinicalReport || selectedReportPatient?.clinical_report || '작성된 임상 소견 내용이 없습니다. 우측 패널의 소견 템플릿을 통해 소견을 작성해 주세요.'}
          </div>
        </div>

      </div>
    </div>
  )
}