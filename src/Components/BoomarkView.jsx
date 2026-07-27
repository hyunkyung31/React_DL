import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink, Search, X } from 'lucide-react';
import { fetchAuthBlobUrl } from '../utils/authMedia';

export default function BookmarkView({ bookmarks = [], onSelectBookmark, onDeleteBookmark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [modalMediaUrl, setModalMediaUrl] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalImgError, setModalImgError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    async function loadBookmarkMedia() {
      if (!selectedItem) {
        setModalMediaUrl('');
        return;
      }

      console.log('현재 선택된 북마크 상세 데이터:', selectedItem);

      // 1. 기존 스냅샷 경로 탐색
      let rawUrl = 
        selectedItem.snapshotUrl || 
        selectedItem.snapshotPath || 
        selectedItem.url || 
        selectedItem.image_url || 
        selectedItem.imageUrl || 
        selectedItem.file_url || 
        selectedItem.key_frame_url;

      // 2. 💡 스냅샷 경로가 없을 경우 환자 ID와 프레임 번호를 조합하여 대체 API 경로 생성 (백엔드 엔드포인트 형식에 맞게 조절 가능)
      if (!rawUrl && selectedItem.patientId) {
        const frame = selectedItem.frameNumber || 1;
        rawUrl = `/api/patients/${selectedItem.patientId}/snapshot?frame=${frame}`;
      }

      if (!rawUrl) {
        setModalMediaUrl('');
        setIsModalLoading(false);
        return;
      }

      setIsModalLoading(true);
      setModalImgError(false);

      try {
        objectUrl = await fetchAuthBlobUrl(rawUrl);
        if (cancelled) return;
        setModalMediaUrl(objectUrl);
      } catch (err) {
        console.error('북마크 미디어 로드 실패:', err);
        setModalImgError(true);
        setModalMediaUrl('');
      } finally {
        if (!cancelled) setIsModalLoading(false);
      }
    }

    loadBookmarkMedia();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedItem]);

  const filteredBookmarks = bookmarks.filter(item => 
    (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.patientId || '').includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-800 relative">
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

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredBookmarks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            저장된 북마크가 없습니다.
          </div>
        ) : (
          filteredBookmarks.map((item) => (
            <div 
              key={item.id || item.patientId}
              onClick={() => setSelectedItem(item)}
              className="p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all flex flex-col gap-1.5 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white text-sm">{item.title || '제목 없음'}</span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setSelectedItem(item);
                      if (onSelectBookmark) onSelectBookmark(item);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                    title="바로가기 (팝업)"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteBookmark && onDeleteBookmark(item.id)}
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

      {selectedItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 rounded-lg">
          <div className="bg-gray-900 border border-blue-800/60 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/90">
              <h3 className="text-sm font-bold text-white truncate">{selectedItem.title}</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 text-gray-400 hover:text-white rounded bg-gray-800 border border-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-gray-950 flex justify-center items-center max-h-[60vh] overflow-y-auto">
              {isModalLoading ? (
                <div className="text-xs text-gray-400 py-8">미디어를 불러오는 중...</div>
              ) : modalMediaUrl && !modalImgError ? (
                <img 
                  src={modalMediaUrl} 
                  alt={selectedItem.title} 
                  className="max-h-[50vh] object-contain rounded-lg border border-gray-800"
                  onError={() => setModalImgError(true)}
                />
              ) : (
                <div className="text-xs text-gray-400 py-8 text-center space-y-1">
                  <p className="text-sm text-gray-300">표시할 미디어 파일이 없습니다.</p>
                  <p className="text-xs text-gray-500">(서버에 스냅샷 데이터(snapshotUrl)가 존재하지 않습니다.)</p>
                </div>
              )}
            </div>

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