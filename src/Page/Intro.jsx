export default function Intro({ onStartLogin, healthStatus }) {
  return (
    <div className="relative flex items-center justify-center h-screen bg-[#010308] text-gray-100 p-6 select-none font-sans overflow-hidden">
      
      {/* 배경 오로라 및 앰비언트 글로우 애니메이션 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/25 rounded-full blur-[130px] pointer-events-none animate-glow-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/25 rounded-full blur-[130px] pointer-events-none animate-glow-slow" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-1000" />

      {/* 격자(Grid) 패턴 배경 */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      {/* 메인 콘텐츠 컨테이너 */}
      <div className="relative w-full max-w-5xl bg-[#060a17]/85 backdrop-blur-2xl border border-blue-500/40 rounded-3xl shadow-[0_0_90px_rgba(37,99,235,0.25)] overflow-hidden flex flex-col md:flex-row z-10">
        
        {/* 좌측 패널 */}
        <div className="w-full md:w-3/5 bg-gradient-to-br from-blue-950/60 via-indigo-950/70 to-transparent p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-r border-blue-500/20">
          
          <div className="space-y-4 z-10">
            {/* [변경됨] 색상이 유기적으로 살아 움직이는 동적 메디컬 뱃지 */}
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 animate-color-flow border border-blue-300/60 text-white font-mono text-xs rounded-full inline-block backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              ANGIO CDSS v1.0 • Clinical Intelligence
            </span>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-lg">
              혈관조영술 AI 진단 및 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300">
                임상 의사결정 지원 시스템
              </span>
            </h1>
            <p className="text-sm text-blue-100/85 leading-relaxed font-light">
              혈관조영 영상 및 핵심 임상 지표를 정밀 분석하여, 협착 및 질환 위험도를 예측하고 의료진의 최적 진단을 보조합니다.
            </p>
          </div>

          <div className="space-y-3 z-10 my-6">
            <div className="p-4 bg-blue-950/60 border border-blue-400/30 rounded-2xl flex items-center space-x-4 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-900/70 hover:border-blue-300 hover:shadow-blue-500/30 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-blue-500/30 text-blue-200 flex items-center justify-center text-xs font-bold font-mono border border-blue-300/40 group-hover:bg-blue-400 group-hover:text-gray-950 transition-colors">01</div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">AI 기반 혈관 영상 자동 분석</div>
                <div className="text-[11px] text-blue-200/80">협착 및 이상 병변 실시간 감지 알고리즘</div>
              </div>
            </div>

            <div className="p-4 bg-blue-950/60 border border-blue-400/30 rounded-2xl flex items-center space-x-4 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-900/70 hover:border-blue-300 hover:shadow-blue-500/30 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center text-xs font-bold font-mono border border-indigo-300/40 group-hover:bg-indigo-400 group-hover:text-gray-950 transition-colors">02</div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">임상 지표 연계 환자 관리</div>
                <div className="text-[11px] text-blue-200/80">환자 고유 지표를 통한 맞춤형 위험도 분류</div>
              </div>
            </div>
          </div>

          <div className="z-10 pt-4 border-t border-blue-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-blue-200/70">System Status</span>
            <span className="text-emerald-300 flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
              <span>{healthStatus}</span>
            </span>
          </div>
        </div>

        {/* 우측 패널 */}
        <div className="w-full md:w-2/5 p-10 lg:p-12 flex flex-col justify-center items-center text-center space-y-6 bg-[#060a17]/70 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-xl mb-2 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:bg-blue-500/30 hover:border-blue-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">의료진 인증 포털</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              안전한 의료 데이터 조회를 위해 <br></br>인가된 의료진 계정으로 로그인을 진행해 주세요.
            </p>
          </div>

          <button 
            onClick={onStartLogin}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <span>의료진 로그인하기</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <div className="text-xs text-gray-500 pt-4">
            Secure Medical AI Platform &copy; 2026
          </div>
        </div>

      </div>
    </div>
  )
}