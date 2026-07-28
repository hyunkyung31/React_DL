import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink, Search, X } from 'lucide-react';
import { fetchAuthBlobUrl } from '../utils/authMedia';

const API_BASE = 'http://34.80.83.7:8000';

function resolveBookmarkRawUrl(item) {
  if (!item) return '';
  return (
    item.snapshotUrl ||
    item.snapshot_url ||
    item.snapshotPath ||
    item.snapshot_path ||
    item.url ||
    item.image_url ||
    item.imageUrl ||
    item.file_url ||
    item.key_frame_url ||
    ''
  );
}

export default function BookmarkView({ bookmarks = [], onSelectBookmark, onDeleteBookmark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [modalMediaUrl, setModalMediaUrl] = useState('');
  const [baseMediaUrl, setBaseMediaUrl] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalImgError, setModalImgError] = useState(false);

  useEffect(() => {
    let overlayObjectUrl = null;
    let baseObjectUrl = null;
    let cancelled = false;

    async function loadPatientKeyFrame(patientId) {
      if (!patientId) return '';
      const access = localStorage.getItem('access');
      const res = await fetch(`${API_BASE}/api/patients/${patientId}/`, {
        headers: { Authorization: access ? `Bearer ${access}` : '' },
      });
      if (!res.ok) return '';
      const data = await res.json();
      const raw =
        data.examinations?.[0]?.key_frame_url ||
        data.patient?.key_frame_url ||
        '';
      if (!raw) return '';
      return fetchAuthBlobUrl(raw);
    }

    async function loadBookmarkMedia() {
      if (!selectedItem) {
        setModalMediaUrl('');
        setBaseMediaUrl('');
        return;
      }

      setIsModalLoading(true);
      setModalImgError(false);

      try {
        let rawUrl = resolveBookmarkRawUrl(selectedItem);

        if (!rawUrl && selectedItem.id) {
          try {
            const cache = JSON.parse(localStorage.getItem('bookmark_snapshots') || '{}');
            rawUrl = cache[String(selectedItem.id)] || '';
          } catch (_) {
            rawUrl = '';
          }
        }

        const patientId = selectedItem.patientId || selectedItem.patient_id;
        // 예전 북마크는 오버레이(캔버스)만 저장된 경우가 있어 key frame을 아래에 깔아 합성 표시
        try {
          baseObjectUrl = await loadPatientKeyFrame(patientId);
        } catch (err) {
          console.error('북마크 base key_frame 로드 실패:', err);
        }

        if (!rawUrl) {
          if (cancelled) return;
          setModalMediaUrl('');
          setBaseMediaUrl(baseObjectUrl || '');
          return;
        }

        overlayObjectUrl = await fetchAuthBlobUrl(rawUrl);
        if (cancelled) return;
        setModalMediaUrl(overlayObjectUrl || '');
        setBaseMediaUrl(baseObjectUrl || '');
      } catch (err) {
        console.error('북마크 미디어 로드 실패:', err);
        if (!cancelled) {
          setModalImgError(true);
          setModalMediaUrl('');
        }
      } finally {
        if (!cancelled) setIsModalLoading(false);
      }
    }

    loadBookmarkMedia();

    return () => {
      cancelled = true;
      if (overlayObjectUrl && String(overlayObjectUrl).startsWith('blob:')) {
        URL.revokeObjectURL(overlayObjectUrl);
      }
      if (baseObjectUrl && String(baseObjectUrl).startsWith('blob:')) {
        URL.revokeObjectURL(baseObjectUrl);
      }
    };
  }, [selectedItem]);

  const filteredBookmarks = bookmarks.filter(item =>
    (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.patientId || item.patient_id || '').includes(searchTerm)
  );

  const handleDelete = async (event, item) => {
    event.stopPropagation();
    if (!onDeleteBookmark || item?.id == null) return;
    await onDeleteBookmark(item.id);
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  const hasVisual = Boolean((baseMediaUrl || modalMediaUrl) && !modalImgError);

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
                    onClick={(e) => handleDelete(e, item)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {(item.patientId || item.patient_id) && (
                <span className="text-[11px] text-gray-400 font-mono">
                  환자 ID: {item.patientId || item.patient_id}
                </span>
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
              ) : hasVisual ? (
                <div className="relative max-h-[50vh] w-full flex items-center justify-center">
                  {baseMediaUrl && (
                    <img
                      src={baseMediaUrl}
                      alt="base"
                      className="max-h-[50vh] object-contain rounded-lg border border-gray-800"
                      onError={() => setModalImgError(true)}
                    />
                  )}
                  {modalMediaUrl && (
                    <img
                      src={modalMediaUrl}
                      alt={selectedItem.title}
                      className={`${baseMediaUrl ? 'absolute inset-0 m-auto' : ''} max-h-[50vh] object-contain rounded-lg ${baseMediaUrl ? '' : 'border border-gray-800'}`}
                      onError={() => {
                        // 오버레이만 실패해도 base가 있으면 유지
                        if (!baseMediaUrl) setModalImgError(true);
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-8 text-center space-y-1">
                  <p className="text-sm text-gray-300">표시할 미디어 파일이 없습니다.</p>
                  <p className="text-xs text-gray-500">북마크에 저장된 스냅샷이 없습니다. AI 진단 화면에서 다시 북마크를 추가해 주세요.</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-800 bg-gray-900 flex justify-between items-center text-xs text-gray-400">
              <span>
                {(selectedItem.patientId || selectedItem.patient_id)
                  ? `환자 ID: ${selectedItem.patientId || selectedItem.patient_id}`
                  : ''}
              </span>
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
