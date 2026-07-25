import React,{ useState } from 'react'

export default function PatientManagement({ patients, errorMessage, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')

  const filteredPatients = patients.filter((patient) => {
    if (!patient) return false
    const name = patient.patient_name || ''
    const id = patient.patient_id || ''

    if (searchCategory === 'name') {
      return name.includes(searchTerm)
    } else if (searchCategory === 'id') {
      return String(id).includes(searchTerm)
    }
    return name.includes(searchTerm) || String(id).includes(searchTerm)
  })

  return (
    <div className="flex-1 p-6 bg-gray-950 text-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 페이지 타이틀 및 검색 바 영역 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">담당 환자 목록 관리</h2>
            <p className="text-xs text-gray-400 mt-1">등록된 환자를 검색하고 임상 상태를 확인하세요.</p>
          </div>
          
          {/* 검색 컨트롤 */}
          <div className="flex items-center space-x-2">
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="name">환자명</option>
              <option value="id">환자 ID</option>
            </select>

            <input 
              type="text" 
              placeholder="검색어를 입력하세요" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {errorMessage && <p className="text-red-400 font-semibold">{errorMessage}</p>}

        {/* 환자 목록 테이블 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-3 font-semibold">환자 ID</th>
                <th className="px-6 py-3 font-semibold">환자명</th>
                <th className="px-6 py-3 font-semibold">나이/성별</th>
                <th className="px-6 py-3 font-semibold">주호소</th>
                <th className="px-6 py-3 font-semibold">ECG 결과</th>
                <th className="px-6 py-3 font-semibold text-center">관리 메뉴</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-300">{patient.patient_id}</td>
                    <td className="px-6 py-4 font-medium text-white">{patient.patient_name}</td>
                    <td className="px-6 py-4 text-gray-300">{patient.age}세 / {patient.gender}</td>
                    <td className="px-6 py-4 text-gray-300">{patient.chief_complaint || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                        {patient.ecg_result || '정상'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onSelectPatient && onSelectPatient(patient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors shadow"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}