import { useState, useEffect, useRef } from 'react'
import { Stethoscope, Plus, Send, Loader2, Search } from 'lucide-react'

export default function ConsultationView({ selectedPatient, currentUserName }) {
  const [consultations, setConsultations] = useState([])
  const [selectedConsult, setSelectedConsult] = useState(null)
  const [isWriting, setIsWriting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // API로 불러올 환자 목록 및 의사 목록 상태
  const [patientList, setPatientList] = useState([])
  const [doctorsList, setDoctorsList] = useState([])

  // 사이드바 검색어 상태
  const [searchTerm, setSearchTerm] = useState('')

  // 환자 이름 검색 드롭다운 노출 여부 상태
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 신규 요청 폼 상태
  const [newForm, setNewForm] = useState({
    patientName: selectedPatient ? selectedPatient.patient_name : '',
    patientId: selectedPatient ? selectedPatient.patient_id : '',
    department: '순환기내과',
    receiver: '',
    requester: currentUserName || '박의사 (영상의학과)',
    priority: '일반 (Routine)',
    reason: '',
    note: ''
  })

  // 외부 클릭 시 환자 드롭다운 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPatientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. 초기 데이터 로드 (환자, 의사, 협진 목록 병렬 API 호출)
  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const [patientRes, doctorRes, consultRes] = await Promise.all([
        fetch('http://34.80.83.7:8000/api/patients', { headers }),
        fetch('http://34.80.83.7:8000/api/doctors', { headers }),
        fetch('http://34.80.83.7:8000/api/consultations', { headers })
      ])

      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatientList(patientData)
      } else {
        console.error('환자 목록 불러오기 실패:', patientRes.status)
      }

      if (doctorRes.ok) {
        const doctorData = await doctorRes.json()
        setDoctorsList(doctorData)
      } else {
        console.error('의사 목록 불러오기 실패:', doctorRes.status)
      }

      if (consultRes.ok) {
        const consultData = await consultRes.json()
        setConsultations(consultData)
      } else {
        console.error('협진 목록 불러오기 실패:', consultRes.status)
      }

    } catch (error) {
      console.error('API 연동 중 오류 발생:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // 상위 컴포넌트에서 선택된 환자가 바뀔 경우 폼 반영
  useEffect(() => {
    if (selectedPatient) {
      setNewForm(prev => ({
        ...prev,
        patientName: selectedPatient.patient_name || '',
        patientId: selectedPatient.patient_id || ''
      }))
    }
  }, [selectedPatient])

  // 사이드바 검색어 필터링
  const filteredConsultations = consultations.filter(item => 
    item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.receiver && item.receiver.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // [수정 포인트] 신규 폼 내 환자 검색 필터링 로직 개선 (대소문자 무시 및 공백 제거 안전 처리)
  const filteredPatients = patientList.filter(p => {
    const query = (newForm.patientName || '').trim().toLowerCase()
    const name = (p.patient_name || '').toLowerCase()
    const id = (p.patient_id || '').toLowerCase()
    // 빈 값이면 전체 목록 표시, 아니면 이름이나 ID에 포함되는지 확인
    return query === '' || name.includes(query) || id.includes(query)
  })

  // 2. 신규 협진 요청 전송 (POST API 연동)
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!newForm.patientName || !newForm.reason) {
      alert('환자 이름과 협진 사유는 필수 입력 항목입니다.')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token') || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const response = await fetch('http://34.80.83.7:8000/api/consultations', {
        method: 'POST',
        headers,
        body: JSON.stringify(newForm)
      })

      if (!response.ok) throw new Error('요청 전송에 실패했습니다.')
      
      // 목록 새로고침
      const consultRes = await fetch('http://34.80.83.7:8000/api/consultations', { headers })
      if (consultRes.ok) {
        const data = await consultRes.json()
        setConsultations(data)
      }

      setIsWriting(false)
      setNewForm({
        patientName: selectedPatient ? selectedPatient.patient_name : '',
        patientId: selectedPatient ? selectedPatient.patient_id : '',
        department: '순환기내과',
        receiver: '',
        requester: currentUserName || '박의사 (영상의학과)',
        priority: '일반 (Routine)',
        reason: '',
        note: ''
      })
      alert('협진 요청이 성공적으로 전송되었습니다.')
    } catch (error) {
      console.error('전송 에러:', error)
      alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 p-4 bg-gray-950 text-gray-100 grid grid-cols-3 gap-4 overflow-hidden">
      
      {/* 1열: 사이드바 (협진 목록 + 검색 연동) */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope size={18} className="text-blue-400" />
              <h2 className="font-semibold text-sm text-white">협진 요청 목록</h2>
            </div>
            <button 
              onClick={() => { setIsWriting(true); setSelectedConsult(null); }}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
            >
              <Plus size={14} /> 새 협진 요청
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="환자명, 진료과, 담당의 검색..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading && consultations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-xs gap-2">
              <Loader2 className="animate-spin" size={16} /> 목록을 불러오는 중...
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredConsultations.map((item) => {
              const isSelected = selectedConsult?.id === item.id
              return (
                <div 
                  key={item.id}
                  onClick={() => { setSelectedConsult(item); setIsWriting(false); }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-blue-950/40 border-blue-600' : 'bg-gray-800/40 border-gray-800 hover:bg-gray-800'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-white text-sm">{item.patientName} <span className="text-xs text-gray-400 font-mono">({item.patientId})</span></span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.status === '완료' ? 'bg-green-950 text-green-400 border border-green-800' :
                      item.status === '진행중' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 flex justify-between">
                    <span>대상: {item.department} ({item.receiver || '미정'})</span>
                    <span className="text-gray-400">{item.date ? item.date.slice(5, 16) : ''}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 2열 & 3열: 상세 내용 또는 작성 폼 */}
      <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden p-6">
        {isWriting ? (
          /* 신규 협진 요청 작성 폼 */
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
              <h2 className="font-semibold text-base text-white">신규 협진 요청서 작성</h2>
              <button onClick={() => setIsWriting(false)} className="text-xs text-gray-400 hover:text-white">취소</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                
                {/* 환자 성명 드롭다운 검색 및 자동 연동 필드 */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-gray-400 mb-1">환자 성명 * (검색 및 자동 연동)</label>
                  <input 
                    type="text" 
                    value={newForm.patientName} 
                    onChange={e => {
                      setNewForm({...newForm, patientName: e.target.value, patientId: ''})
                      setIsPatientDropdownOpen(true)
                    }}
                    onFocus={() => setIsPatientDropdownOpen(true)}
                    placeholder="환자 이름을 입력하거나 검색하세요"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                    required
                  />

                  {/* 환자 API 리스트 드롭다운 */}
                  {isPatientDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                      {filteredPatients.length === 0 ? (
                        <div className="p-2.5 text-gray-400 text-center">검색된 환자가 없습니다.</div>
                      ) : (
                        filteredPatients.map(patient => (
                          <div 
                            key={patient.patient_id}
                            onClick={() => {
                              setNewForm(prev => ({
                                ...prev,
                                patientName: patient.patient_name,
                                patientId: patient.patient_id
                              }))
                              setIsPatientDropdownOpen(false)
                            }}
                            className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex justify-between items-center text-white"
                          >
                            <span className="font-semibold">{patient.patient_name}</span>
                            <span className="text-gray-400 font-mono text-[11px]">{patient.patient_id}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">환자 ID / 등록번호 (자동 연동)</label>
                  <input 
                    type="text" 
                    value={newForm.patientId} 
                    readOnly
                    placeholder="환자를 선택하면 자동 입력됩니다"
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-400 outline-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">요청 진료과</label>
                  <select 
                    value={newForm.department}
                    onChange={e => {
                      const selectedDept = e.target.value;
                      setNewForm(prev => ({ ...prev, department: selectedDept, receiver: '' }));
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                  >
                    <option value="순환기내과">순환기내과</option>
                    <option value="심장혈관흉부외과">심장혈관흉부외과</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">담당 전문의 (의사 API 연동)</label>
                  <select 
                    value={newForm.receiver} 
                    onChange={e => setNewForm({...newForm, receiver: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                    required
                  >
                    <option value="">전문의 선택</option>
                    {doctorsList
                      .filter(doc => doc.department === newForm.department)
                      .map(doc => (
                        <option key={doc.doctor_id} value={doc.doctor_name}>
                          {doc.doctor_name} ({doc.hospital_name})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">우선순위</label>
                  <select 
                    value={newForm.priority}
                    onChange={e => setNewForm({...newForm, priority: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                  >
                    <option value="일반 (Routine)">일반 (Routine)</option>
                    <option value="응급 (Urgent)">응급 (Urgent)</option>
                    <option value="긴급 (STAT)">긴급 (STAT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">협진 요청 사유 *</label>
                <textarea 
                  rows={4}
                  value={newForm.reason}
                  onChange={e => setNewForm({...newForm, reason: e.target.value})}
                  placeholder="협진이 필요한 구체적인 임상적 배경 및 목적을 적어주세요."
                  className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">추가 전달 사항 / 첨부메모</label>
                <input 
                  type="text"
                  value={newForm.note}
                  onChange={e => setNewForm({...newForm, note: e.target.value})}
                  placeholder="특이사항이나 참고할 검사 결과 등을 입력"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsWriting(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-semibold"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  {submitting ? '전송 중...' : '협진 요청 전송'}
                </button>
              </div>
            </form>
          </div>
        ) : selectedConsult ? (
          /* 선택된 협진 상세 내용 보기 */
          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-white">{selectedConsult.patientName}</span>
                  <span className="text-xs text-gray-400 font-mono">ID: {selectedConsult.patientId}</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 text-xs rounded font-medium">
                    {selectedConsult.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400">요청일시: {selectedConsult.date}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block mb-1">진행 상태</span>
                <span className="px-3 py-1 bg-gray-800 text-white border border-gray-700 text-xs font-bold rounded-full">
                  {selectedConsult.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-800/40 border border-gray-800 p-3 rounded">
                <span className="text-gray-400 block mb-1">수신 진료과 / 전문의</span>
                <p className="font-semibold text-white">{selectedConsult.department} ({selectedConsult.receiver || '미정'} 교수님)</p>
              </div>
              <div className="bg-gray-800/40 border border-gray-800 p-3 rounded">
                <span className="text-gray-400 block mb-1">요청 의료진</span>
                <p className="font-semibold text-white">{selectedConsult.requester}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-semibold text-gray-300">협진 요청 사유</h3>
              <div className="bg-gray-800/30 border border-gray-800 p-4 rounded text-gray-200 leading-relaxed">
                {selectedConsult.reason}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-semibold text-gray-300">첨부 메모 및 회신 사항</h3>
              <div className="bg-gray-800/30 border border-gray-800 p-4 rounded text-gray-200 leading-relaxed">
                {selectedConsult.note || '등록된 추가 메모가 없습니다.'}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
              <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded font-medium">
                메시지 추가
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-semibold shadow">
                회신 작성 / 수정
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            목록에서 협진 요청을 선택하거나 새로 작성해 주세요.
          </div>
        )}
      </div>

    </div>
  )
}