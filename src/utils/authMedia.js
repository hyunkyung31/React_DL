export async function fetchAuthBlobUrl(url) {
  if (!url) return null

  const access = localStorage.getItem('access')
  if (!access) {
    throw new Error('로그인 토큰이 없습니다.')
  }

  const res = await fetch(url, {
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
