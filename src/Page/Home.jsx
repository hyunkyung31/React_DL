import React from 'react'
import { LayoutDashboard, Users, Stethoscope, Cpu, Bookmark, ArrowRight, Activity, ShieldCheck, HeartPulse, Bell, CheckCircle2 } from 'lucide-react'

// ==========================================
// 홈 컴포넌트 (대시보드 홈 화면 - UI 채움 버전)
// ==========================================
export default function Home({ displayName, patients = [], onNavigate, onSelectPatient }) {
  const recentPatients = patients.slice(0, 5)
  const totalPatientsCount = patients.length

  // AI CAD 기준: No CAD = 정상, Obstructive/lesion = 주의 (ECG와 분리)
  const isNormalAi = (p) => {
    const s = String(p.latest_severity_class || '').toLowerCase()
    if (!s) return false
    return s.includes('no cad') || s === 'normal'
  }
  const isAlertAi = (p) => {
    const s = String(p.latest_severity_class || '').toLowerCase()
    return s.includes('obstructive') || p.has_lesion === true
  }

  const normalCount = patients.filter(isNormalAi).length
  const alertCount = patients.filter(isAlertAi).length

  // 퍼센트 계산 (데이터가 0일 경우 레이아웃 유지를 위해 기본 가상 비율 적용 가능)
  const normalPercent = totalPatientsCount > 0 ? Math.round((normalCount / totalPatientsCount) * 100) : 0
  const alertPercent = totalPatientsCount > 0 ? Math.round((alertCount / totalPatientsCount) * 100) : 0

  return (
    <div className="flex-1 p-6 text-gray-100 overflow-y-auto space-y-6" style={{ backgroundColor: '#060B18' }}>
      
      {/* 상단 환영 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 mb-1">
            <ShieldCheck size={14} /> 혈관조영술 AI 진단 시스템 v1.0
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            환영합니다, <span className="text-blue-400">{displayName}</span> 의료진님 👋
          </h2>
          <p className="text-xs text-gray-300">
            오늘도 환자의 임상 데이터를 안전하게 분석하고 최적의 진단을 지원합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate && onNavigate('ai-diag')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Cpu size={16} /> AI 분석 시작하기 <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 주요 통계 지표 카드 영역 (진행 바 추가로 허전함 해소) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 전체 관리 환자 */}
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">전체 관리 환자</p>
              <p className="text-2xl font-bold text-white mt-1">{totalPatientsCount}명</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
              <Users size={20} />
            </div>
          </div>
          <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* 정상 소견 */}
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">정상 소견 (AI No CAD)</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{normalCount}명</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Activity size={20} />
            </div>
          </div>
          <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${normalPercent}%` }}></div>
          </div>
        </div>

        {/* 정밀 진단/주의 */}
        <div className="p-4 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">정밀 진단/주의 (AI)</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{alertCount}명</p>
            </div>
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-400">
              <HeartPulse size={20} />
            </div>
          </div>
          <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${alertPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* 중간 그리드: 빠른 메뉴 이동 및 최근 환자 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 빠른 메뉴 바로가기 */}
        <div className="p-5 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <LayoutDashboard size={16} className="text-blue-400" /> 빠른 메뉴 이동
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => onNavigate && onNavigate('patients')}
              className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20 shadow-inner"
            >
              <Users size={18} className="text-blue-400" />
              <span className="font-semibold">환자 목록 관리</span>
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('consultation')}
              className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20 shadow-inner"
            >
              <Stethoscope size={18} className="text-indigo-400" />
              <span className="font-semibold">협진요청</span>
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('ai-diag')}
              className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20 shadow-inner"
            >
              <Cpu size={18} className="text-cyan-400" />
              <span className="font-semibold">AI 진단 분석</span>
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('bookmarks')}
              className="p-3 rounded-lg border border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40 text-gray-200 hover:text-white transition-all text-left flex flex-col justify-between h-20 shadow-inner"
            >
              <Bookmark size={18} className="text-amber-400" />
              <span className="font-semibold">북마크 관리</span>
            </button>
          </div>
        </div>

        {/* 최근 환자 요약 리스트 */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-blue-800/40 bg-gray-900/60 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Users size={16} className="text-blue-400" /> 최근 등록 환자 요약
            </h3>
            <button 
              onClick={() => onNavigate && onNavigate('patients')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              전체보기 <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-950/50 text-gray-300 border-b border-blue-800/40">
                  <th className="px-3 py-2.5 font-semibold">환자 ID</th>
                  <th className="px-3 py-2.5 font-semibold">환자명</th>
                  <th className="px-3 py-2.5 font-semibold">나이/성별</th>
                  <th className="px-3 py-2.5 font-semibold">주호소</th>
                  <th className="px-3 py-2.5 font-semibold">Troponin T</th>
                  <th className="px-3 py-2.5 font-semibold text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient) => (
                    <tr key={patient.patient_id} className="hover:bg-blue-900/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-gray-300">{patient.patient_id}</td>
                      <td className="px-3 py-2.5 font-medium text-white">{patient.patient_name}</td>
                      <td className="px-3 py-2.5 text-gray-300">{patient.age}세 / {patient.gender}</td>
                      <td className="px-3 py-2.5 text-gray-300 truncate max-w-[120px]">{patient.chief_complaint || '-'}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-300">
                        {patient.troponin_t_level != null && patient.troponin_t_level !== ''
                          ? `${patient.troponin_t_level} ng/L`
                          : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button 
                          onClick={() => onSelectPatient && onSelectPatient(patient)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors shadow"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                      등록된 환자 데이터가 없습니다. 상단 메뉴에서 환자를 등록하거나 검색해 주세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}