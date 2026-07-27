const API_BASE = 'http://34.80.83.7:8000'

function toAbsoluteMediaUrl(url) {
  if (!url) return null
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url
  }
  if (url.startsWith('/')) {
    return `${API_BASE}${url}`
  }
  return url
}

/** data/blob URL은 그대로, 그 외는 Authorization 헤더로 blob URL 생성 */
export async function fetchAuthBlobUrl(url) {
  if (!url) return null

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const access = localStorage.getItem('access')
  if (!access) {
    throw new Error('로그인 토큰이 없습니다.')
  }

  const absolute = toAbsoluteMediaUrl(url)
  const res = await fetch(absolute, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  })

  if (!res.ok) {
    throw new Error(`media fetch failed: ${res.status}`)
  }

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
