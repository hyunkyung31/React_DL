// import React from 'react';

// const TEMPLATES = [
//   { id: '1', label: '정상 소견', text: '관상동맥에 유의미한 협착 소견 보이지 않음 (No significant stenosis).' },
//   { id: '2', label: 'Mid-LAD 중등도 협착', text: 'Mid-LAD 부위에 중등도 석회화 병변 및 약 60-70% 수준의 협착 소견 관찰됨.' },
//   { id: '3', label: 'RCA 근위부 중증 협착 (PCI 권장)', text: 'Proximal RCA 80% 이상의 중증 협착 소견으로 약물 용출성 스텐트(DES) 시술(PCI) 권장됨.' }
// ];

// function ImpressionTemplate({ impression, setImpression }) {
//   const handleSelectTemplate = (e) => {
//     const selected = TEMPLATES.find((t) => t.id === e.target.value);
//     if (selected) {
//       setImpression(selected.text);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-800 text-white rounded-lg mb-4">
//       <h3 className="text-md font-bold mb-2">📝 임상 소견 (Clinical Impression)</h3>
//       <select
//         onChange={handleSelectTemplate}
//         className="w-full p-2 bg-gray-700 text-sm rounded mb-2 border border-gray-600"
//       >
//         <option value="">-- 자동 입력 템플릿 선택 --</option>
//         {TEMPLATES.map((t) => (
//           <option key={t.id} value={t.id}>{t.label}</option>
//         ))}
//       </select>
//       <textarea
//         rows={4}
//         value={impression}
//         onChange={(e) => setImpression(e.target.value)}
//         placeholder="소견을 선택하거나 직접 입력하세요..."
//         className="w-full p-2 bg-gray-900 text-sm rounded border border-gray-700 focus:outline-none focus:border-blue-500"
//       />
//     </div>
//   );
// }

// // 명시적 export default 하단 작성
// export default ImpressionTemplate;

import React, { useState, useEffect } from 'react';
import { FileText, Edit } from 'lucide-react';

export default function ImpressionTemplate({ externalImpression, onImpressionChange }) {
  const [templateOption, setTemplateOption] = useState('custom');
  const [impressionText, setImpressionText] = useState('');

  // 외부에서 Llama-3 XAI 자동 소견이 넘어올 때 텍스트 업데이트
  useEffect(() => {
    if (externalImpression !== undefined && externalImpression !== null) {
      setImpressionText(externalImpression);
      setTemplateOption('custom');
    }
  }, [externalImpression]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setImpressionText(val);
    if (onImpressionChange) onImpressionChange(val);
  };

  const handleTemplateSelect = (e) => {
    const val = e.target.value;
    setTemplateOption(val);
    let selectedText = '';
    if (val === 'normal') {
      selectedText = '[정상 소견]\n관상동맥 조영술 결과 특이할 만한 혈관 협착 소견 보이지 않음.';
    } else if (val === 'lad_stenosis') {
      selectedText = '[LAD 협착 소견]\nLAD(좌전하행지) 유의미한 협착 관찰됨. 경과 관찰 및 필요 시 PCI 고려.';
    } else if (val === 'rca_stenosis') {
      selectedText = '[RCA 협착 소견]\nRCA(우관상동맥) 내 심각한 협착 소견. PCI 시술 권장.';
    }
    setImpressionText(selectedText);
    if (onImpressionChange) onImpressionChange(selectedText);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-blue-800/40 pb-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <h2 className="font-semibold text-sm text-white">임상 소견 (Clinical Impression)</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setImpressionText('');
            setTemplateOption('custom');
          }}
          className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white"
        >
          <Edit size={12} /> 직접 새로 작성
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">자동 입력 템플릿 선택</label>
        <select
          value={templateOption}
          onChange={handleTemplateSelect}
          className="w-full px-2.5 py-1.5 bg-gray-900 border border-blue-800/50 rounded text-xs text-white focus:outline-none focus:border-blue-400"
        >
          <option value="custom">✍️ 직접 작성 (사용자 지정 / AI 자동 연동 소견)</option>
          <option value="normal">정상 (Normal Coro. Angio)</option>
          <option value="lad_stenosis">LAD Stenosis (좌전하행지 협착)</option>
          <option value="rca_stenosis">RCA Stenosis (우관상동맥 협착)</option>
        </select>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">최종 판독 문구 (수정 가능)</label>
          <span className="text-[10px] text-gray-500">{impressionText.length} 자</span>
        </div>
        <textarea
          rows={4}
          value={impressionText}
          onChange={handleTextChange}
          placeholder="템플릿을 선택하거나 체크리스트를 클릭하면 Llama-3-Medical XAI 소견이 자동 생성됩니다..."
          className="w-full p-2.5 bg-gray-950 border border-blue-800/40 rounded text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none font-mono leading-relaxed"
        />
      </div>
    </div>
  );
}