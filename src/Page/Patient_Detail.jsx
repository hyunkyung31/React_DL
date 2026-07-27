import { useState, useEffect } from 'react'
import { fetchAuthBlobUrl } from '../utils/authMedia'

const API_BASE = 'http://34.80.83.7:8000'

function buildMediaItems(detail, fallbackPatient) {
  const exams = detail?.examinations || fallbackPatient?.examinations || []
  const items = []

  exams.forEach((exam, index) => {
    if (exam.key_frame_url) {
      items.push({
        id: `kf-${exam.exam_id || index}`,
        kind: 'image',
        name: `${exam.vessel_type || 'Angio'} key frame`,
        date: exam.exam_id ? `exam ${exam.exam_id}` : '',
        rawUrl: exam.key_frame_url,
      })
    }
    if (exam.video_url) {
      items.push({
        id: `vid-${exam.exam_id || index}`,
        kind: 'video',
        name: `${exam.vessel_type || 'Angio'} video`,
        date: exam.exam_id ? `exam ${exam.exam_id}` : '',
        rawUrl: exam.video_url,
      })
    }
  })

  const fallbackUrl =
    fallbackPatient?.key_frame_url ||
    fallbackPatient?.image_url ||
    fallbackPatient?.imageUrl ||
    fallbackPatient?.file_url ||
    fallbackPatient?.video_url

  if (items.length === 0 && fallbackUrl) {
    const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(fallbackUrl) || Boolean(fallbackPatient?.video_url)
    items.push({
      id: 'fallback-1',
      kind: isVideo ? 'video' : 'image',
      name: fallbackPatient?.image_name || fallbackPatient?.file_name || `${fallbackPatient?.patient_id || 'patient'}_media`,
      date: fallbackPatient?.date || '',
      rawUrl: fallbackUrl,
    })
  }

  return items
}

export default function PatientDetail({ patient, onBack }) {
  const [profile, setProfile] = useState(patient || null)
  const [mediaItems, setMediaItems] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [resolvedUrl, setResolvedUrl] = useState('')
  const [mediaError, setMediaError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isResolving, setIsResolving] = useState(false)
  const [loadError, setLoadError] = useState('')

  // 목록 아이템만 넘어와도 상세 API로 examinations(key_frame/video) 보강
  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      if (!patient?.patient_id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError('')
      setProfile(patient)

      try {
        const access = localStorage.getItem('access')
        const res = await fetch(`${API_BASE}/api/patients/${patient.patient_id}/`, {
          headers: { Authorization: access ? `Bearer ${access}` : '' },
        })
        if (!res.ok) throw new Error(`patient detail failed: ${res.status}`)

        const data = await res.json()
        if (cancelled) return

        const merged = {
          ...(data.patient || {}),
          ...patient,
          ...(data.patient || {}),
          examinations: data.examinations || [],
          ai_results: data.ai_results || [],
        }
        setProfile(merged)

        const items = buildMediaItems(data, merged)
        setMediaItems(items)
        setSelectedMedia(items[0] || null)
      } catch (err) {
        console.error('환자 상세 로드 실패:', err)
        if (cancelled) return
        setLoadError('환자 상세 정보를 불러오지 못했습니다.')
        const items = buildMediaItems(null, patient)
        setMediaItems(items)
        setSelectedMedia(items[0] || null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadDetail()
    return () => {
      cancelled = true
    }
  }, [patient])

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function resolveSelected() {
      if (!selectedMedia?.rawUrl) {
        setResolvedUrl('')
        setMediaError(false)
        return
      }

      setIsResolving(true)
      setMediaError(false)

      try {
        objectUrl = await fetchAuthBlobUrl(selectedMedia.rawUrl)
        if (cancelled) return
        setResolvedUrl(objectUrl || '')
      } catch (err) {
        console.error('환자 미디어 로드 실패:', err)
        if (!cancelled) {
          setMediaError(true)
          setResolvedUrl('')
        }
      } finally {
        if (!cancelled) setIsResolving(false)
      }
    }

    resolveSelected()

    return () => {
      cancelled = true
      if (objectUrl && String(objectUrl).startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [selectedMedia])

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

  const view = profile || patient

  return (
    <div className="flex-1 p-6 bg-gray-950 text-gray-100 overflow-y-auto flex flex-col">
      <div className="max-w-6xl w-full mx-auto space-y-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4 rounded-xl border border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">환자 상세 프로필 및 촬영 영상</h2>
            <p className="text-xs text-gray-400 mt-0.5">기본 정보와 연동된 key frame / 혈관조영 영상을 확인합니다.</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-colors"
          >
            ← 목록으로
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
          <div>
            <span className="text-xs text-gray-400 block mb-1">환자 ID</span>
            <span className="font-mono text-white text-sm">{view.patient_id}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">환자명</span>
            <span className="font-medium text-white text-sm">{view.patient_name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">나이 / 성별</span>
            <span className="text-white text-sm">{view.age}세 / {view.gender}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">ECG 결과</span>
            <span className="text-blue-400 text-sm font-semibold">{view.ecg_result || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Troponin T</span>
            <span className="text-gray-200 text-sm font-mono">
              {view.troponin_t_level != null && view.troponin_t_level !== ''
                ? `${view.troponin_t_level} ng/L`
                : '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">주호소</span>
            <span className="text-white text-sm">{view.chief_complaint || '-'}</span>
          </div>
        </div>

        {loadError && (
          <p className="text-xs text-amber-300">{loadError}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[450px]">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">촬영 영상 / 이미지</h3>

            <div className="space-y-1 overflow-y-auto flex-1">
              {isLoading ? (
                <p className="text-xs text-gray-500 px-2 py-4">미디어 목록을 불러오는 중...</p>
              ) : mediaItems.length === 0 ? (
                <p className="text-xs text-gray-500 px-2 py-4">등록된 촬영 미디어가 없습니다.</p>
              ) : (
                mediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMedia?.id === item.id
                        ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                        : 'hover:bg-gray-800 text-gray-300 border border-transparent'
                    }`}
                  >
                    <span className="text-xl">{item.kind === 'video' ? '🎬' : '🖼️'}</span>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.date || item.kind}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-semibold text-blue-400 truncate">
                {selectedMedia ? selectedMedia.name : '미디어를 선택해주세요'}
              </h3>
              <span className="text-xs text-gray-500">Patient Media Viewer</span>
            </div>

            <div className="flex-1 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden p-2 min-h-[320px]">
              {isLoading || isResolving ? (
                <div className="text-center p-6 text-gray-400">
                  <p className="text-sm">미디어를 불러오는 중...</p>
                </div>
              ) : selectedMedia && resolvedUrl && !mediaError ? (
                selectedMedia.kind === 'video' ? (
                  <video
                    src={resolvedUrl}
                    controls
                    className="w-full h-full object-contain rounded"
                    onError={() => setMediaError(true)}
                  />
                ) : (
                  <img
                    src={resolvedUrl}
                    alt={selectedMedia.name}
                    className="w-full h-full object-contain rounded"
                    onError={() => setMediaError(true)}
                  />
                )
              ) : (
                <div className="text-center p-6 text-gray-500 space-y-2">
                  <span className="text-3xl">🩻</span>
                  <p className="text-sm text-gray-300">연결된 환자 미디어가 없습니다.</p>
                  <p className="text-xs text-gray-500">examinations의 key_frame_url / video_url을 확인해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
