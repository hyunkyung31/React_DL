import React, { useState } from 'react';

export default function EmrConfirmPanel({ checklist, impression }) {
  // 1. 상태 변수 및 이벤트 핸들러 선언 (return 문 위에 배치)
  const [isSignedOff, setIsSignedOff] = useState(false);

  const handleConfirm = () => {
    if (!impression || !impression.trim()) {
      alert('임상 소견을 입력해주세요!');
      return;
    }
    const confirmed = window.confirm('최종 판독을 확정하고 EMR로 전송하시겠습니까?');
    if (confirmed) {
      setIsSignedOff(true);
      alert('EMR 전송 및 최종 판독 확정이 완료되었습니다.');
    }
  };

  // 2. 실제 화면 렌더링 JSX
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold">EMR Sign-off 상태</span>
        <span className={`px-2 py-1 text-xs font-bold rounded ${isSignedOff ? 'bg-green-600' : 'bg-yellow-600'}`}>
          {isSignedOff ? '확정 완료 (Signed-off)' : '미확정 (Draft)'}
        </span>
      </div>
      <button
        onClick={handleConfirm}
        disabled={isSignedOff}
        className={`w-full py-2 rounded text-sm font-bold transition-colors ${
          isSignedOff
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {isSignedOff ? '💾 EMR 저장 완료됨' : '💾 최종 진단 확정 및 EMR 전송'}
      </button>
    </div>
  );
}

