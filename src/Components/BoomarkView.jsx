import { useState } from 'react';
import { Bookmark, Trash2, ExternalLink, Search } from 'lucide-react';

export default function BookmarkView({ bookmarks, onSelectBookmark, onDeleteBookmark }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 필터링
  const filteredBookmarks = bookmarks.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientId?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-800">
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
              className="p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white text-sm">{item.title}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onSelectBookmark(item)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="바로가기"
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
    </div>
  );
}