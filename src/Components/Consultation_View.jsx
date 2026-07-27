import { useEffect, useRef, useState } from 'react'
import {
  Stethoscope,
  Plus,
  Send,
  Loader2,
  Search,
  CheckCircle2,
  CircleAlert,
  X,
} from 'lucide-react'

const API_BASE_URL = 'http://34.80.83.7:8000'

export default function ConsultationView({
  selectedPatient,
  currentUserName,
  targetConsultationId,
}) {
  const [consultations, setConsultations] = useState([])
  const [selectedConsult, setSelectedConsult] = useState(null)
  const [isWriting, setIsWriting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const notificationTimerRef = useRef(null)

  // API로 불러올 환자 및 의사 목록
  const [patientList, setPatientList] = useState([])
  const [doctorsList, setDoctorsList] = useState([])

  // 협진 목록 검색어
  const [searchTerm, setSearchTerm] = useState('')

  // 신규 협진 요청의 환자 검색 드롭다운
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] =
    useState(false)

  const dropdownRef = useRef(null)

  // 신규 협진 요청 폼
  const [newForm, setNewForm] = useState({
    patientName: selectedPatient?.patient_name || '',
    patientId: selectedPatient?.patient_id || '',
    department: '순환기내과',
    receiverId: '',
    receiver: '',
    requester:
      currentUserName || '박의사 (영상의학과)',
    priority: '일반 (Routine)',
    reason: '',
    note: '',
  })

  /*
   * 협진 API 응답은 환자·의사 ID만 포함하므로
   * 환자 목록과 의사 목록을 이용해 화면 표시용 이름을 연결합니다.
   */
  const normalizeConsultation = (
    item,
    patients = [],
    doctors = []
  ) => {
    const patient = patients.find(
      (person) =>
        String(person.patient_id) ===
        String(item.patient_id ?? item.patientId)
    )

    const receiverDoctor = doctors.find(
      (doctor) =>
        String(doctor.doctor_id) ===
        String(item.receiver_id ?? item.receiverId)
    )

    const requesterDoctor = doctors.find(
      (doctor) =>
        String(doctor.doctor_id) ===
        String(item.requester_id ?? item.requesterId)
    )

    return {
      ...item,

      id:
        item.id ??
        item.consultation_id,

      patientName:
        item.patientName ??
        item.patient_name ??
        patient?.patient_name ??
        '',

      patientId:
        item.patientId ??
        item.patient_id ??
        patient?.patient_id ??
        '',

      department:
        item.department ??
        item.receiver_department ??
        receiverDoctor?.department ??
        '',

      receiver:
        item.receiver ??
        item.receiver_name ??
        item.receiver_doctor_name ??
        receiverDoctor?.doctor_name ??
        item.receiver_id ??
        '',

      receiverId:
        item.receiverId ??
        item.receiver_id ??
        receiverDoctor?.doctor_id ??
        '',

      requester:
        item.requester ??
        item.requester_name ??
        item.requester_doctor_name ??
        requesterDoctor?.doctor_name ??
        item.requester_id ??
        '',

      requesterId:
        item.requesterId ??
        item.requester_id ??
        requesterDoctor?.doctor_id ??
        '',

      priority:
        item.priority ??
        '일반 (Routine)',

      reason:
        item.reason ??
        '',

      note:
        item.note ??
        '',

      date:
        item.date ??
        item.created_at ??
        '',

      status:
        item.status ??
        '대기',
    }
  }

  // 외부 클릭 시 환자 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsPatientDropdownOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  // 컴포넌트가 사라질 때 알림 타이머 제거
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(
          notificationTimerRef.current
        )
      }
    }
  }, [])

  // 환자·의사·협진 목록 초기 조회
  const fetchInitialData = async () => {
    setLoading(true)

    try {
      const access =
        localStorage.getItem('access') || ''

      if (!access) {
        throw new Error(
          '로그인 정보가 없습니다. 다시 로그인해주세요.'
        )
      }

      const headers = {
        Authorization: `Bearer ${access}`,
      }

      const [
        patientRes,
        doctorRes,
        consultationRes,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/patients/`,
          { headers }
        ),
        fetch(
          `${API_BASE_URL}/api/doctors/`,
          { headers }
        ),
        fetch(
          `${API_BASE_URL}/api/consultations/`,
          { headers }
        ),
      ])

      if (!patientRes.ok) {
        throw new Error(
          `환자 목록 불러오기 실패 (${patientRes.status})`
        )
      }

      if (!doctorRes.ok) {
        throw new Error(
          `의사 목록 불러오기 실패 (${doctorRes.status})`
        )
      }

      if (!consultationRes.ok) {
        throw new Error(
          `협진 목록 불러오기 실패 (${consultationRes.status})`
        )
      }

      /*
       * 세 API 응답을 먼저 모두 배열로 변환합니다.
       * 같은 함수 범위에 선언하므로 협진 목록 정규화에서도
       * normalizedPatients와 normalizedDoctors를 사용할 수 있습니다.
       */
      const patientData =
        await patientRes.json()

      const doctorData =
        await doctorRes.json()

      const consultationData =
        await consultationRes.json()

      const normalizedPatients =
        Array.isArray(patientData)
          ? patientData
          : patientData.results || []

      const normalizedDoctors =
        Array.isArray(doctorData)
          ? doctorData
          : doctorData.results || []

      const rawConsultations =
        Array.isArray(consultationData)
          ? consultationData
          : consultationData.results || []

      const normalizedConsultations =
        rawConsultations.map((item) =>
          normalizeConsultation(
            item,
            normalizedPatients,
            normalizedDoctors
          )
        )

      setPatientList(normalizedPatients)
      setDoctorsList(normalizedDoctors)
      setConsultations(normalizedConsultations)
    } catch (error) {
      console.error(
        '초기 데이터 로드 중 오류 발생:',
        error
      )

      setPatientList([])
      setDoctorsList([])
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // 알림에서 전달된 협진 ID와 일치하는 항목 자동 선택
  useEffect(() => {
    if (
      !targetConsultationId ||
      consultations.length === 0
    ) {
      return
    }

    const targetConsultation =
      consultations.find(
        (consultation) =>
          Number(consultation.id) ===
          Number(targetConsultationId)
      )

    if (targetConsultation) {
      setSelectedConsult(targetConsultation)
      setIsWriting(false)
    } else {
      console.warn(
        '알림에 해당하는 협진을 찾지 못했습니다.',
        targetConsultationId
      )
    }
  }, [
    targetConsultationId,
    consultations,
  ])

  // Dashboard에서 선택한 환자가 바뀌면 신규 폼에 반영
  useEffect(() => {
    if (!selectedPatient) return

    setNewForm((prev) => ({
      ...prev,
      patientName:
        selectedPatient.patient_name || '',
      patientId:
        selectedPatient.patient_id || '',
    }))
  }, [selectedPatient])

  // 협진 목록 검색
  const normalizedSearchTerm =
    searchTerm.trim().toLowerCase()

  const filteredConsultations =
    consultations.filter((item) => {
      const patientName =
        String(item.patientName || '')
          .toLowerCase()

      const patientId =
        String(item.patientId || '')
          .toLowerCase()

      const department =
        String(item.department || '')
          .toLowerCase()

      const receiver =
        String(item.receiver || '')
          .toLowerCase()

      return (
        patientName.includes(
          normalizedSearchTerm
        ) ||
        patientId.includes(
          normalizedSearchTerm
        ) ||
        department.includes(
          normalizedSearchTerm
        ) ||
        receiver.includes(
          normalizedSearchTerm
        )
      )
    })

  // 신규 폼 환자 검색
  const filteredPatients =
    patientList.filter((patient) => {
      const query =
        String(newForm.patientName || '')
          .trim()
          .toLowerCase()

      const name =
        String(patient.patient_name || '')
          .toLowerCase()

      const id =
        String(patient.patient_id || '')
          .toLowerCase()

      return (
        query === '' ||
        name.includes(query) ||
        id.includes(query)
      )
    })

  // 화면 우측 상단 알림 표시
  const showNotification = (
    type,
    message
  ) => {
    if (notificationTimerRef.current) {
      window.clearTimeout(
        notificationTimerRef.current
      )
    }

    setNotification({
      type,
      message,
    })

    notificationTimerRef.current =
      window.setTimeout(() => {
        setNotification(null)
      }, 3000)
  }

  // 신규 협진 요청 저장
  const handleCreateSubmit = async (event) => {
    event.preventDefault()

    if (!newForm.patientId) {
      showNotification(
        'error',
        '환자 목록에서 환자를 선택해주세요.'
      )
      return
    }

    if (!newForm.receiverId) {
      showNotification(
        'error',
        '담당 전문의를 선택해주세요.'
      )
      return
    }

    if (!newForm.reason.trim()) {
      showNotification(
        'error',
        '협진 요청 사유를 입력해주세요.'
      )
      return
    }

    const access =
      localStorage.getItem('access')

    if (!access) {
      showNotification(
        'error',
        '로그인 정보가 없습니다. 다시 로그인해주세요.'
      )
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/consultations/`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            patientId:
              newForm.patientId,
            receiverId:
              newForm.receiverId,
            reason:
              newForm.reason.trim(),
            department:
              newForm.department,
            priority:
              newForm.priority,
            note:
              newForm.note.trim(),
          }),
        }
      )

      const responseData =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {
        const fieldErrors =
          responseData &&
          typeof responseData === 'object'
            ? Object.values(responseData)
                .flat()
                .join(' ')
            : ''

        const errorMessage =
          responseData?.detail ||
          responseData?.message ||
          fieldErrors ||
          `협진 요청 저장 실패 (${response.status})`

        throw new Error(errorMessage)
      }

      /*
       * POST 응답에도 ID만 있을 수 있으므로 현재 환자·의사 목록으로
       * 이름과 진료과를 다시 연결합니다.
       */
      const createdConsultation =
        normalizeConsultation(
          {
            ...responseData,

            patient_id:
              responseData?.patient_id ??
              newForm.patientId,

            receiver_id:
              responseData?.receiver_id ??
              newForm.receiverId,

            patientName:
              newForm.patientName,

            receiver:
              newForm.receiver,

            department:
              newForm.department,

            priority:
              newForm.priority,

            reason:
              responseData?.reason ??
              newForm.reason.trim(),

            note:
              responseData?.note ??
              newForm.note.trim(),

            status:
              responseData?.status ??
              '대기',

            created_at:
              responseData?.created_at ??
              new Date().toISOString(),
          },
          patientList,
          doctorsList
        )

      setConsultations((prev) => [
        createdConsultation,
        ...prev.filter(
          (item) =>
            Number(item.id) !==
            Number(createdConsultation.id)
        ),
      ])

      setSelectedConsult(
        createdConsultation
      )

      setIsWriting(false)

      showNotification(
        'success',
        `${newForm.receiver} 전문의에게 협진 요청을 전송했습니다.`
      )

      setNewForm({
        patientName:
          selectedPatient?.patient_name || '',
        patientId:
          selectedPatient?.patient_id || '',
        department: '순환기내과',
        receiverId: '',
        receiver: '',
        requester:
          currentUserName ||
          '박의사 (영상의학과)',
        priority: '일반 (Routine)',
        reason: '',
        note: '',
      })
    } catch (error) {
      console.error(
        '협진 요청 저장 오류:',
        error
      )

      showNotification(
        'error',
        error?.message ||
          '협진 요청 저장 중 오류가 발생했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {notification && (
        <div
          className={`fixed right-5 top-5 z-[100] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-md ${
            notification.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/95 text-emerald-100'
              : 'border-red-500/40 bg-red-950/95 text-red-100'
          }`}
          role="alert"
        >
          {notification.type ===
          'success' ? (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
            />
          ) : (
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {notification.type ===
              'success'
                ? '저장 완료'
                : '저장 실패'}
            </p>

            <p className="mt-0.5 text-xs opacity-80">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotification(null)
            }
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="알림 닫기"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid flex-1 grid-cols-3 gap-4 overflow-hidden bg-gray-950 p-4 text-gray-100">
        {/* 1열: 협진 목록 */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          <div className="space-y-3 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope
                  size={18}
                  className="text-blue-400"
                />

                <h2 className="text-sm font-semibold text-white">
                  협진 요청 목록
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsWriting(true)
                  setSelectedConsult(null)
                }}
                className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
              >
                <Plus size={14} />
                새 협진 요청
              </button>
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="환자명, 환자 ID, 진료과, 담당의 검색..."
                className="w-full rounded-md border border-gray-700 bg-gray-800 py-1.5 pl-9 pr-3 text-xs text-white outline-none placeholder-gray-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {loading &&
            consultations.length === 0 ? (
              <div className="flex h-32 items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2
                  className="animate-spin"
                  size={16}
                />
                목록을 불러오는 중...
              </div>
            ) : filteredConsultations.length ===
              0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-gray-500">
                협진 요청이 없습니다.
              </div>
            ) : (
              filteredConsultations.map(
                (item) => {
                  const isSelected =
                    Number(
                      selectedConsult?.id
                    ) === Number(item.id)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedConsult(item)
                        setIsWriting(false)
                      }}
                      className={`block w-full rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-950/40'
                          : 'border-gray-800 bg-gray-800/40 hover:bg-gray-800'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-white">
                          {item.patientName ||
                            '환자 이름 미등록'}

                          <span className="ml-1 text-xs font-normal text-gray-400">
                            ({item.patientId})
                          </span>
                        </span>

                        <span
                          className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${
                            item.status ===
                              '완료' ||
                            item.status ===
                              'completed'
                              ? 'border-green-800 bg-green-950 text-green-400'
                              : item.status ===
                                  '진행중' ||
                                item.status ===
                                  'in_progress'
                                ? 'border-blue-800 bg-blue-950 text-blue-400'
                                : 'border-amber-800 bg-amber-950 text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 text-xs text-gray-300">
                        <span className="min-w-0 truncate">
                          대상:{' '}
                          {item.department ||
                            '진료과 미정'}{' '}
                          (
                          {item.receiver ||
                            '담당의 미정'}
                          )
                        </span>

                        <span className="shrink-0 text-gray-400">
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleString(
                                'ko-KR',
                                {
                                  month:
                                    '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute:
                                    '2-digit',
                                }
                              )
                            : ''}
                        </span>
                      </div>
                    </button>
                  )
                }
              )
            )}
          </div>
        </div>

        {/* 2열·3열: 상세 또는 신규 작성 */}
        <div className="col-span-2 flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-6">
          {isWriting ? (
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-base font-semibold text-white">
                  신규 협진 요청서 작성
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setIsWriting(false)
                  }
                  className="text-xs text-gray-400 hover:text-white"
                >
                  취소
                </button>
              </div>

              <form
                onSubmit={handleCreateSubmit}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* 환자 검색 */}
                  <div
                    className="relative"
                    ref={dropdownRef}
                  >
                    <label className="mb-1 block text-gray-400">
                      환자 성명 * (검색 및 자동
                      연동)
                    </label>

                    <input
                      type="text"
                      value={newForm.patientName}
                      onChange={(event) => {
                        setNewForm((prev) => ({
                          ...prev,
                          patientName:
                            event.target.value,
                          patientId: '',
                        }))

                        setIsPatientDropdownOpen(
                          true
                        )
                      }}
                      onFocus={() =>
                        setIsPatientDropdownOpen(
                          true
                        )
                      }
                      placeholder="환자 이름 또는 ID를 입력하세요"
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-blue-500"
                      required
                    />

                    {isPatientDropdownOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-700 bg-gray-800 shadow-lg">
                        {filteredPatients.length ===
                        0 ? (
                          <div className="p-2.5 text-center text-gray-400">
                            검색된 환자가
                            없습니다.
                          </div>
                        ) : (
                          filteredPatients.map(
                            (patient) => (
                              <button
                                key={
                                  patient.patient_id
                                }
                                type="button"
                                onClick={() => {
                                  setNewForm(
                                    (prev) => ({
                                      ...prev,
                                      patientName:
                                        patient.patient_name,
                                      patientId:
                                        patient.patient_id,
                                    })
                                  )

                                  setIsPatientDropdownOpen(
                                    false
                                  )
                                }}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-white hover:bg-gray-700"
                              >
                                <span className="font-semibold">
                                  {
                                    patient.patient_name
                                  }
                                </span>

                                <span className="font-mono text-[11px] text-gray-400">
                                  {
                                    patient.patient_id
                                  }
                                </span>
                              </button>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-gray-400">
                      환자 ID / 등록번호
                    </label>

                    <input
                      type="text"
                      value={newForm.patientId}
                      readOnly
                      placeholder="환자를 선택하면 자동 입력됩니다"
                      className="w-full cursor-not-allowed rounded border border-gray-800 bg-gray-900 px-3 py-2 font-mono text-gray-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-gray-400">
                      요청 진료과
                    </label>

                    <select
                      value={
                        newForm.department
                      }
                      onChange={(event) => {
                        const selectedDept =
                          event.target.value

                        setNewForm(
                          (prev) => ({
                            ...prev,
                            department:
                              selectedDept,
                            receiverId: '',
                            receiver: '',
                          })
                        )
                      }}
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                    >
                      <option value="순환기내과">
                        순환기내과
                      </option>

                      <option value="심장혈관흉부외과">
                        심장혈관흉부외과
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-gray-400">
                      담당 전문의
                    </label>

                    <select
                      value={
                        newForm.receiverId
                      }
                      onChange={(event) => {
                        const selectedDoctor =
                          doctorsList.find(
                            (doctor) =>
                              String(
                                doctor.doctor_id
                              ) ===
                              String(
                                event.target
                                  .value
                              )
                          )

                        setNewForm(
                          (prev) => ({
                            ...prev,
                            receiverId:
                              selectedDoctor?.doctor_id ||
                              '',
                            receiver:
                              selectedDoctor?.doctor_name ||
                              '',
                          })
                        )
                      }}
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                      required
                    >
                      <option value="">
                        전문의 선택
                      </option>

                      {doctorsList
                        .filter(
                          (doctor) =>
                            String(
                              doctor.department ||
                                ''
                            ).trim() ===
                            String(
                              newForm.department ||
                                ''
                            ).trim()
                        )
                        .map((doctor) => (
                          <option
                            key={
                              doctor.doctor_id
                            }
                            value={
                              doctor.doctor_id
                            }
                          >
                            {
                              doctor.doctor_name
                            }{' '}
                            ·{' '}
                            {
                              doctor.hospital_name
                            }
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-gray-400">
                      우선순위
                    </label>

                    <select
                      value={newForm.priority}
                      onChange={(event) =>
                        setNewForm(
                          (prev) => ({
                            ...prev,
                            priority:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                    >
                      <option value="일반 (Routine)">
                        일반 (Routine)
                      </option>

                      <option value="응급 (Urgent)">
                        응급 (Urgent)
                      </option>

                      <option value="긴급 (STAT)">
                        긴급 (STAT)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-gray-400">
                    협진 요청 사유 *
                  </label>

                  <textarea
                    rows={4}
                    value={newForm.reason}
                    onChange={(event) =>
                      setNewForm((prev) => ({
                        ...prev,
                        reason:
                          event.target.value,
                      }))
                    }
                    placeholder="협진이 필요한 구체적인 임상적 배경 및 목적을 적어주세요."
                    className="w-full resize-none rounded border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-gray-400">
                    추가 전달 사항 / 첨부 메모
                  </label>

                  <input
                    type="text"
                    value={newForm.note}
                    onChange={(event) =>
                      setNewForm((prev) => ({
                        ...prev,
                        note:
                          event.target.value,
                      }))
                    }
                    placeholder="특이사항이나 참고할 검사 결과 등을 입력"
                    className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setIsWriting(false)
                    }
                    className="rounded bg-gray-800 px-4 py-2 font-semibold text-gray-300 hover:bg-gray-700"
                  >
                    취소
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2
                        className="animate-spin"
                        size={14}
                      />
                    ) : (
                      <Send size={14} />
                    )}

                    {submitting
                      ? '저장 중...'
                      : '협진 요청 전송'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedConsult ? (
            <div className="flex-1 space-y-6 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {selectedConsult.patientName ||
                        '환자 이름 미등록'}
                    </span>

                    <span className="font-mono text-xs text-gray-400">
                      ID:{' '}
                      {
                        selectedConsult.patientId
                      }
                    </span>

                    <span className="rounded border border-blue-800 bg-blue-950 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {
                        selectedConsult.priority
                      }
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    요청일시:{' '}
                    {selectedConsult.date
                      ? new Date(
                          selectedConsult.date
                        ).toLocaleString(
                          'ko-KR'
                        )
                      : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="mb-1 block text-xs text-gray-400">
                    진행 상태
                  </span>

                  <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-bold text-white">
                    {
                      selectedConsult.status
                    }
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded border border-gray-800 bg-gray-800/40 p-3">
                  <span className="mb-1 block text-gray-400">
                    수신 진료과 / 전문의
                  </span>

                  <p className="font-semibold text-white">
                    {selectedConsult.department ||
                      '진료과 미정'}{' '}
                    (
                    {selectedConsult.receiver ||
                      '담당의 미정'}
                    )
                  </p>
                </div>

                <div className="rounded border border-gray-800 bg-gray-800/40 p-3">
                  <span className="mb-1 block text-gray-400">
                    요청 의료진
                  </span>

                  <p className="font-semibold text-white">
                    {selectedConsult.requester ||
                      '요청자 정보 없음'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-semibold text-gray-300">
                  협진 요청 사유
                </h3>

                <div className="rounded border border-gray-800 bg-gray-800/30 p-4 leading-relaxed text-gray-200">
                  {selectedConsult.reason}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-semibold text-gray-300">
                  첨부 메모 및 회신 사항
                </h3>

                <div className="rounded border border-gray-800 bg-gray-800/30 p-4 leading-relaxed text-gray-200">
                  {selectedConsult.note ||
                    '등록된 추가 메모가 없습니다.'}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-800 pt-4">
                <button
                  type="button"
                  disabled
                  className="rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700"
                >
                  메시지 추가
                </button>

                <button
                  type="button"
                  disabled
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500"
                >
                  회신 작성 / 수정
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              목록에서 협진 요청을 선택하거나
              새로 작성해 주세요.
            </div>
          )}
        </div>
      </div>
    </>
  )
}