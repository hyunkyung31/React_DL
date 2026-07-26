// import React from 'react';

// export default function FindingChecklist({ checklist = { vessels: {}, pciRecommended: null }, setChecklist }) {
//   const handleVesselChange = (vessel) => {
//     setChecklist((prev) => ({
//       ...prev,
//       vessels: {
//         ...(prev?.vessels || {}),
//         [vessel]: !prev?.vessels?.[vessel],
//       },
//     }));
//   };

//   const handlePciChange = (val) => {
//     setChecklist((prev) => ({ ...prev, pciRecommended: val }));
//   };

//   return (
//     <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
//       <h3 className="text-sm font-semibold text-white mb-3">📋 판독 체크리스트</h3>
      
//       {/* 협착 의심 혈관 선택 */}
//       <div className="mb-4">
//         <label className="text-xs text-gray-400 block mb-2">협착 의심 혈관 (복수 선택 가능)</label>
//         <div className="grid grid-cols-2 gap-2 text-xs text-gray-200">
//           {['LAD', 'RCA', 'LCX', 'LMT'].map((vessel) => (
//             <label key={vessel} className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded border border-gray-700/50 hover:bg-gray-750">
//               <input
//                 type="checkbox"
//                 checked={!!checklist?.vessels?.[vessel]}
//                 onChange={() => handleVesselChange(vessel)}
//                 className="rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-0"
//               />
//               <span>{vessel}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* PCI 권장 여부 */}
//       <div>
//         <label className="text-xs text-gray-400 block mb-2">PCI 시술 권장 여부</label>
//         <div className="flex space-x-3 text-xs text-gray-200">
//           <label className="flex items-center space-x-1.5 cursor-pointer">
//             <input
//               type="radio"
//               name="pci"
//               value="needed"
//               checked={checklist?.pciRecommended === 'needed'}
//               onChange={() => handlePciChange('needed')}
//               className="text-blue-600 bg-gray-900 border-gray-600 focus:ring-0"
//             />
//             <span>시술 필요 (PCI Needed)</span>
//           </label>
//           <label className="flex items-center space-x-1.5 cursor-pointer">
//             <input
//               type="radio"
//               name="pci"
//               value="observation"
//               checked={checklist?.pciRecommended === 'observation'}
//               onChange={() => handlePciChange('observation')}
//               className="text-blue-600 bg-gray-900 border-gray-600 focus:ring-0"
//             />
//             <span>경과 관찰 (Medical Tx)</span>
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';

export default function FindingChecklist({ 
  checklist = { vessels: {}, pciRecommended: null }, 
  setChecklist,
  aiBBoxes = [],                  // 🤖 Canvas 위에 존재하는 BBox 리스트
  selectedBBoxId,                // 현재 Canvas 상에서 선택/수정 중인 BBox ID
  onSelectBBox,                  // BBox 선택 핸들러
  isDrawingMode: externalDrawingMode,   // ✏️ 외부에서 전달된 그리기 모드
  setIsDrawingMode: externalSetIsDrawingMode, // ✏️ 외부 그리기 모드 전환 함수
  onDeleteBBox                   // 🗑️ 선택된 BBox 삭제 핸들러
}) {
  // 💡 상위 컴포넌트에서 props를 넘기지 않더라도 자체 작동할 수 있도록 내부 폴백 상태 마련
  const [internalDrawingMode, setInternalDrawingMode] = useState(false);

  // 외부 props가 있으면 외부 상태를 쓰고, 없으면 internal 상태 사용
  const isDrawingMode = externalDrawingMode !== undefined ? externalDrawingMode : internalDrawingMode;
  
  const handleToggleDrawMode = () => {
    const nextState = !isDrawingMode;
    if (externalSetIsDrawingMode) {
      externalSetIsDrawingMode(nextState);
    } else {
      setInternalDrawingMode(nextState);
    }
  };

  const handleVesselChange = (vessel) => {
    setChecklist((prev) => ({
      ...prev,
      vessels: {
        ...(prev?.vessels || {}),
        [vessel]: !prev?.vessels?.[vessel],
      },
    }));
  };

  const handlePciChange = (val) => {
    setChecklist((prev) => ({ ...prev, pciRecommended: val }));
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-4 text-white">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <h3 className="text-sm font-semibold text-white">📋 판독 체크리스트</h3>
        <span className="text-[11px] text-blue-400 font-medium">
          {aiBBoxes.length > 0 ? `BBox 탐지/수정 ${aiBBoxes.length}건` : '수동 검증 모드'}
        </span>
      </div>

      {/* ✏️ 의사 수동 BBox 그리기(Canvas Drawing) & 수정 툴바 */}
      <div className="p-3 bg-gray-950 border border-gray-800 rounded-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">🎨 Canvas BBox 수동 편집</span>
          {/* 수동 BBox 삭제 버튼 */}
          {selectedBBoxId && onDeleteBBox && (
            <button
              type="button"
              onClick={() => onDeleteBBox(selectedBBoxId)}
              className="text-[11px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
            >
              🗑️ 선택 BBox 삭제
            </button>
          )}
        </div>

        {/* BBox 직접 그리기 토글 버튼 */}
        <button
          type="button"
          onClick={handleToggleDrawMode}
          className={`w-full py-2.5 px-3 rounded text-xs font-bold transition-all cursor-pointer border ${
            isDrawingMode
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse shadow-lg'
              : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
          }`}
        >
          {isDrawingMode ? '✏️ Canvas에 BBox 드래그 중... (클릭 시 종료)' : '➕ Canvas에 신규 BBox 직접 그리기'}
        </button>

        {/* 🎯 BBox 목록 & 선택 박스 */}
        {aiBBoxes.length > 0 ? (
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 block">현재 생성된 BBox 목록 (클릭하여 위치 수정):</span>
            <div className="flex flex-wrap gap-1.5">
              {aiBBoxes.map((box, idx) => (
                <button
                  key={box.id || idx}
                  type="button"
                  onClick={() => onSelectBBox && onSelectBBox(box.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedBBoxId === box.id
                      ? 'bg-blue-600 text-white border-blue-300 shadow-md ring-1 ring-blue-400'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  🎯 {box.vessel || `Box #${idx + 1}`} {box.confidence ? `(${box.confidence}%)` : '(수동)'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-500 text-center py-1">
            위 버튼을 눌러 영상 Canvas 위에 직접 BBox를 그려보세요.
          </p>
        )}
      </div>

      {/* 협착 의심 혈관 선택 */}
      <div>
        <label className="text-xs text-gray-400 block mb-2">협착 의심 혈관 (복수 선택 가능)</label>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-200">
          {['LAD', 'RCA', 'LCX', 'LMT'].map((vessel) => (
            <label 
              key={vessel} 
              className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                checklist?.vessels?.[vessel]
                  ? 'bg-blue-950/60 border-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700/50 text-gray-300 hover:bg-gray-750'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checklist?.vessels?.[vessel]}
                onChange={() => handleVesselChange(vessel)}
                className="rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">{vessel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* PCI 권장 여부 */}
      <div>
        <label className="text-xs text-gray-400 block mb-2">PCI 시술 권장 여부</label>
        <div className="flex space-x-3 text-xs text-gray-200">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="pci"
              value="needed"
              checked={checklist?.pciRecommended === 'needed'}
              onChange={() => handlePciChange('needed')}
              className="text-blue-600 bg-gray-900 border-gray-600 focus:ring-0 cursor-pointer"
            />
            <span>시술 필요 (PCI Needed)</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="pci"
              value="observation"
              checked={checklist?.pciRecommended === 'observation'}
              onChange={() => handlePciChange('observation')}
              className="text-blue-600 bg-gray-900 border-gray-600 focus:ring-0 cursor-pointer"
            />
            <span>경과 관찰 (Medical Tx)</span>
          </label>
        </div>
      </div>
    </div>
  );
}