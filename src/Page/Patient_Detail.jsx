import { useState, useEffect } from 'react'
import { fetchAuthBlobUrl } from '../utils/authMedia' // 💡 인증된 미디어 로드 유틸 임포트

export default function PatientDetail({ patient, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(true)

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadPatientImage() {
      if (!patient) return
      setIsLoadingImage(true)
      setImgError(false)

      try {
        // 백엔드 API 응답 구조의 다양한 이미지 경로 속성 대응
        const rawUrl = 
          patient?.examinations?.[0]?.key_frame_url || 
          patient?.key_frame_url || 
          patient?.image_url || 
          patient?.imageUrl || 
          patient?.file_url || 
          patient?.aiFileUrl

        if (!rawUrl) {
          setSelectedImage({
            id: 1,
            name: `${patient.patient_id}_angiography.png`,
            date: '2026-07-28',
            url: ''
          })
          setIsLoadingImage(false)
          return
        }

        // 인증 토큰을 동반한 Blob URL fetch 처리
        objectUrl = await fetchAuthBlobUrl(rawUrl)
        if (cancelled) return

        setSelectedImage({
          id: 1,
          name: patient?.image_name || patient?.file_name || `${patient.patient_id}_angiography.png`,
          date: patient?.date || '2026-07-28',
          url: objectUrl
        })
      } catch (err) {
        console.error('환자 상세 이미지 로드 실패:', err)
        setImgError(true)
      } finally {
        if (!cancelled) setIsLoadingImage(false)
      }
    }

    loadPatientImage()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [patient])

  if (!patient) {
    return (
      <div className="flex-1 p-6 bg-gray-950 text-gray-100 flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">선택된 환자 정보가 없습니다.</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          환자 목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 bg-gray-950 text-gray-100 overflow-y-auto flex flex-col">
      <div className="max-w-6xl w-full mx-auto space-y-6 flex-1 flex flex-col">
        
        {/* 상단 네비게이션 및 타이틀 */}
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4 rounded-xl border border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">환자 상세 프로필 및 임상 이미지 뷰어</h2>
            <p className="text-xs text-gray-400 mt-0.5">환자의 기본 정보와 연결된 실시간 이미지 데이터를 확인합니다.</p>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-colors"
          >
            ← 목록으로
          </button>
        </div>

        {/* 환자 기본 정보 요약 카드 */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
          <div>
            <span className="text-xs text-gray-400 block mb-1">환자 ID</span>
            <span className="font-mono text-white text-sm">{patient.patient_id}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">환자명</span>
            <span className="font-medium text-white text-sm">{patient.patient_name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">나이 / 성별</span>
            <span className="text-white text-sm">{patient.age}세 / {patient.gender}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">ECG 결과</span>
            <span className="text-blue-400 text-sm font-semibold">{patient.ecg_result || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Troponin T</span>
            <span className="text-gray-200 text-sm font-mono">
              {patient.troponin_t_level != null && patient.troponin_t_level !== ''
                ? `${patient.troponin_t_level} ng/L`
                : '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">주호소</span>
            <span className="text-white text-sm">{patient.chief_complaint || '-'}</span>
          </div>
        </div>

        {/* 화면 분할 (Split-View) 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[450px]">
          
          {/* 좌측: 환자 연동 이미지 파일 목록 */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">환자 이미지 파일 목록</h3>
            
            <div className="space-y-1 overflow-y-auto flex-1">
              {selectedImage && (
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer bg-blue-600/20 border border-blue-500/50 text-white"
                >
                  <span className="text-xl">🖼️</span>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{selectedImage.name}</p>
                    <p className="text-xs text-gray-500">{selectedImage.date}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 선택한 이미지 렌더링 뷰어 */}
          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-semibold text-blue-400 truncate">
                {selectedImage ? selectedImage.name : '이미지를 선택해주세요'}
              </h3>
              <span className="text-xs text-gray-500">Patient Image Viewer</span>
            </div>
            
            <div className="flex-1 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden p-2">
              {isLoadingImage ? (
                <div className="text-center p-6 text-gray-400 space-y-2 flex flex-col items-center justify-center">
                  <p className="text-sm">이미지를 불러오는 중...</p>
                </div>
              ) : selectedImage && selectedImage.url && !imgError ? (
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name}
                  className="w-full h-full object-contain rounded"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center p-6 text-gray-500 space-y-2 flex flex-col items-center justify-center">
                  <span className="text-3xl">🩻</span>
                  <p className="text-sm text-gray-300">연결된 환자 이미지 데이터가 없습니다.</p>
                  <p className="text-xs text-gray-500">환자 데이터 객체의 이미지 경로 속성을 확인해 주세요.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}