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

import React, { useState } from 'react';

// 확장된 4개 혈관(LAD, RCA, LCX, LMT) 대응 템플릿 리스트
const TEMPLATES = [
  { 
    id: '1', 
    label: '정상 소견 (No stenosis)', 
    text: '관상동맥 주요 혈관(LAD, RCA, LCX, LMT)에 유의미한 협착 소견 보이지 않음 (No significant stenosis).' 
  },
  { 
    id: '2', 
    label: 'LAD 병변 (좌전하행지 협착)', 
    text: 'LAD 병변 (좌전하행지 협착)' 
  },
  { 
    id: '3', 
    label: 'RCA 병변 (우관상동맥 중증 협착)', 
    text: 'RCA 병변 (우관상동맥 중증 협착)' 
  },
  { 
    id: '4', 
    label: 'LCX 병변 (좌회선지 협착)', 
    text: 'LCX 병변 (좌회선지 협착)' 
  },
  { 
    id: '5', 
    label: 'LMT 병변 (좌관상동맥 협착)', 
    text: 'LMT 병변 (좌관상동맥 협착)' 
  },
  { 
    id: '6', 
    label: '다발성 혈관 협착', 
    text: '다발성 혈관 협착' 
  }
];

export default function ImpressionTemplate({ impression, setImpression }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // 템플릿 선택 시 처리 함수
  const handleSelectTemplate = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (templateId === 'custom') {
      // 직접 작성 선택 시 기존 텍스트 유지하거나 초기화
      return;
    }

    const selected = TEMPLATES.find((t) => t.id === templateId);
    if (selected) {
      // 선택한 템플릿 문구를 텍스트 상자에 채움 (이후 사용자가 자유롭게 수정 가능)
      setImpression(selected.text);
    }
  };

  // 초기화 및 직접 작성 시작 버튼
  const handleClear = () => {
    setSelectedTemplateId('custom');
    setImpression('');
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg mb-4 border border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          📝 임상 소견 (Clinical Impression)
        </h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-blue-400 underline transition-colors"
        >
          ✏️ 직접 새로 작성
        </button>
      </div>

      {/* 소견 자동 입력 템플릿 드롭다운 */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400 block">자동 입력 템플릿 선택</label>
        <select
          value={selectedTemplateId}
          onChange={handleSelectTemplate}
          className="w-full p-2 bg-gray-700 text-xs rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
        >
          <option value="">-- 템플릿을 선택하여 자동 작성 --</option>
          <option value="custom">✍️ 직접 작성 (사용자 지정 소견)</option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 의사 소견 입력 및 수정 텍스트 상자 */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400 flex justify-between">
          <span>최종 판독 문구 (수정 가능)</span>
          <span className="text-gray-500">{impression ? impression.length : 0} 자</span>
        </label>
        <textarea
          rows={4}
          value={impression}
          onChange={(e) => {
            setImpression(e.target.value);
            // 의사가 직접 텍스트를 수정하기 시작하면 드롭다운 상태를 '직접 작성'으로 변경
            if (selectedTemplateId && selectedTemplateId !== 'custom') {
              setSelectedTemplateId('custom');
            }
          }}
          placeholder="템플릿을 선택하거나 의사 본인의 소견을 직접 입력하세요..."
          className="w-full p-2.5 bg-gray-900 text-xs rounded border border-gray-700 focus:outline-none focus:border-blue-500 leading-relaxed text-gray-100 resize-none"
        />
      </div>
    </div>
  );
}