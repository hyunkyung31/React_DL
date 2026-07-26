import { useState } from 'react';
import { Bookmark, Trash2, ExternalLink, Search, X } from 'lucide-react';

export default function BookmarkView({ bookmarks, onSelectBookmark, onDeleteBookmark }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 팝업창을 위한 선택된 북마크 상태 관리 (null이면 팝업 닫힘)
  const [selectedItem, setSelectedItem] = useState(null);

  // 검색 필터링
  const filteredBookmarks = bookmarks.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientId?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-800 relative">
      {/* 헤더 및 검색 바 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-yellow-400" />
          <h2 className="font-semibold text-sm text-white">즐겨찾기 / 북마크</h2>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="북마크 검색 (환자명, ID 등)..."
          className="w-full bg-gray-800 border border-gray-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
        />
      </div>

      {/* 북마크 리스트 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredBookmarks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            저장된 북마크가 없습니다.
          </div>
        ) : (
          filteredBookmarks.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)} // 👈 카드 클릭 시 팝업 열기
              className="p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all flex flex-col gap-1.5 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white text-sm">{item.title}</span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setSelectedItem(item); // 👈 바로가기 버튼 클릭 시 팝업 열기
                      if (onSelectBookmark) onSelectBookmark(item);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                    title="바로가기 (팝업)"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteBookmark(item.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {item.patientId && (
                <span className="text-[11px] text-gray-400 font-mono">환자 ID: {item.patientId}</span>
              )}
              {item.note && (
                <p className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded mt-1">
                  {item.note}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 북마크 상세 팝업 (모달) */}
      {selectedItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 rounded-lg">
          <div className="bg-gray-900 border border-blue-800/60 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            
            {/* 팝업 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/90">
              <h3 className="text-sm font-bold text-white truncate">{selectedItem.title}</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 text-gray-400 hover:text-white rounded bg-gray-800 border border-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* 팝업 본문 (영상 또는 이미지 출력) */}
            <div className="p-4 bg-gray-950 flex justify-center items-center max-h-[60vh] overflow-y-auto">
              {selectedItem.type === 'video' ? (
                <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden">
                  <iframe 
                    src={selectedItem.url} 
                    title={selectedItem.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : selectedItem.url ? (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title} 
                  className="max-h-[50vh] object-contain rounded-lg border border-gray-800"
                />
              ) : (
                <div className="text-xs text-gray-400 py-8">표시할 미디어 파일이 없습니다. (노트: {selectedItem.note || '없음'})</div>
              )}
            </div>

            {/* 팝업 푸터 */}
            <div className="px-4 py-3 border-t border-gray-800 bg-gray-900 flex justify-between items-center text-xs text-gray-400">
              <span>{selectedItem.patientId ? `환자 ID: ${selectedItem.patientId}` : ''}</span>
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 font-medium transition-colors"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}