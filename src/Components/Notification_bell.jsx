import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Loader2, RefreshCw, X } from 'lucide-react'

const API_BASE_URL = 'http://34.80.83.7:8000'

export default function NotificationBell({onConsultationOpen,}) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length

  const fetchNotifications = useCallback(async () => {
    const access = localStorage.getItem('access')

    if (!access) {
      setNotifications([])
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      )

      if (response.status === 401) {
        console.error(
          '알림 조회 실패: 로그인 정보가 만료되었습니다.'
        )
        return
      }

      if (!response.ok) {
        throw new Error(
          `알림 조회 실패 (${response.status})`
        )
      }

      const data = await response.json()

      setNotifications(
        Array.isArray(data)
          ? data
          : data.results || []
      )
    } catch (error) {
      console.error('알림 조회 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleNotificationClick = async (notification) => {
    const access = localStorage.getItem('access')

    if (!access) return

    try {
      if (!notification.is_read) {
        const response = await fetch(
          `${API_BASE_URL}/api/notifications/${notification.id}/read/`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${access}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `알림 읽음 처리 실패 (${response.status})`
          )
        }

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
        )
      }

      console.log(
        '협진 ID:',
        notification.consultation_id
      )

      if (notification.type === 'consultation' && notification.consultation_id) {
        onConsultationOpen?.(notification.consultation_id)}
    } catch (error) {
      console.error(
        '알림 읽음 처리 중 오류:',
        error
      )
    }
  }

  useEffect(() => {
    fetchNotifications()

    const intervalId = window.setInterval(
      fetchNotifications,
      30000
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fetchNotifications])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-200 transition-colors hover:bg-gray-800 hover:text-white"
        aria-label="알림 보기"
        aria-expanded={isOpen}
      >
        <Bell size={18} />

        <span className="hidden sm:inline">
          알림
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-blue-800/50 bg-gray-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-blue-800/40 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                알림
              </h3>

              <p className="mt-0.5 text-[11px] text-gray-400">
                읽지 않은 알림 {unreadCount}건
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsOpen(false)
              }
              className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              aria-label="알림 닫기"
            >
              <X size={15} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading &&
            notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-gray-400">
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                알림을 불러오는 중...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-500">
                새로운 알림이 없습니다.
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className={`block w-full border-b border-gray-800 px-4 py-3 text-left transition-colors last:border-b-0 ${
                    notification.is_read
                      ? 'bg-gray-900 hover:bg-gray-800/70'
                      : 'bg-blue-950/25 hover:bg-blue-950/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.is_read
                          ? 'bg-gray-600'
                          : 'bg-blue-400'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            notification.is_read
                              ? 'font-medium text-gray-300'
                              : 'font-semibold text-white'
                          }`}
                        >
                          {notification.title}
                        </p>

                        {!notification.is_read && (
                          <span className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-[10px] text-gray-600">
                        {notification.created_at
                          ? new Date(
                              notification.created_at
                            ).toLocaleString(
                              'ko-KR'
                            )
                          : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-blue-800/40 p-2">
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-950/40 hover:text-blue-200 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={
                  isLoading
                    ? 'animate-spin' : ''
                }
              />

              {isLoading ? '새로고침 중...' : '알림 새로고침'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}