import { useState } from 'react'

export default function PatientDetail({ patient, onBack }) {
  const sampleVideos = patient?.videos || [
    { id: 1, name: 'angiography_01_LAD.mp4', date: '2026-07-24 14:30', url: patient?.video_url || '' },
    { id: 2, name: 'angiography_02_RCA.mp4', date: '2026-07-24 14:32', url: '' },
  ]

  // 기본적으로 첫 번째 영상을 선택된 상태로 지정
  const [selectedVideo, setSelectedVideo] = useState(sampleVideos[0] || null)

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
            <h2 className="text-lg font-bold text-white">환자 상세 프로필 및 영상 분석</h2>
            <p className="text-xs text-gray-400 mt-0.5">환자의 기본 정보와 촬영 영상 분할 뷰어입니다.</p>
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

        {/* 화면 분할 (Split-View) 영역: 좌측 파일 목록 / 우측 실시간 뷰어 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[450px]">
          
          {/* 좌측: 폴더형 파일 목록 */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">촬영 영상 파일 목록</h3>
            
            <div className="space-y-1 overflow-y-auto flex-1">
              {sampleVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedVideo?.id === video.id ? 'bg-blue-600/20 border border-blue-500/50 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
                >
                  <span className="text-xl">🎬</span>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{video.name}</p>
                    <p className="text-xs text-gray-500">{video.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 선택한 영상 재생 뷰어 (2칸 차지) */}
          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-semibold text-blue-400 truncate">
                {selectedVideo ? selectedVideo.name : '영상을 선택해주세요'}
              </h3>
              <span className="text-xs text-gray-500">DICOM / MP4 Viewer</span>
            </div>
            
            <div className="flex-1 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden">
              {selectedVideo && selectedVideo.url ? (
                <video 
                  src={selectedVideo.url} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-gray-500 space-y-2">
                  <span className="text-3xl">🎞️</span>
                  <p className="text-sm">선택한 영상의 소스 파일이 존재하지 않습니다.</p>
                  <p className="text-xs text-gray-600">좌측 목록에서 다른 영상 파일을 클릭해 보세요.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}