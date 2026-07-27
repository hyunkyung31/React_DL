const API_BASE = 'http://34.80.83.7:8000'

function authHeaders() {
  const access = localStorage.getItem('access')
  return {
    'Content-Type': 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  }
}

/** API 응답 → UI에서 쓰던 형태 */
export function toUiBookmark(b) {
  return {
    id: b.id,
    title: b.title,
    patientId: b.patient_id || '',
    note: b.note || '',
    examId: b.exam_id,
    frameNumber: b.frame_number,
    bboxData: b.bbox_data || [],
    snapshotPath: b.snapshot_path,
    snapshotUrl: b.snapshot_url,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  }
}

export async function fetchBookmarks(patientId) {
  const qs = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : ''
  const res = await fetch(`${API_BASE}/api/bookmarks/${qs}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`bookmarks list failed: ${res.status}`)
  const data = await res.json()
  return (data.results || []).map(toUiBookmark)
}

export async function createBookmark(payload) {
  // payload: { title, patient_id?, exam_id?, note?, frame_number?, bbox_data?, snapshot_path? }
  const body = {
    title: payload.title,
    patient_id: payload.patient_id ?? payload.patientId ?? null,
    exam_id: payload.exam_id ?? payload.examId ?? null,
    note: payload.note ?? null,
    frame_number: payload.frame_number ?? payload.frameNumber ?? null,
    bbox_data: payload.bbox_data ?? payload.bboxData ?? [],
    snapshot_path: payload.snapshot_path ?? payload.snapshotPath ?? null,
  }
  const res = await fetch(`${API_BASE}/api/bookmarks/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`bookmark create failed: ${res.status} ${err}`)
  }
  return toUiBookmark(await res.json())
}

export async function updateBookmark(id, payload) {
  const body = {}
  if (payload.title !== undefined) body.title = payload.title
  if (payload.note !== undefined) body.note = payload.note
  if (payload.patient_id !== undefined || payload.patientId !== undefined) {
    body.patient_id = payload.patient_id ?? payload.patientId
  }
  if (payload.exam_id !== undefined || payload.examId !== undefined) {
    body.exam_id = payload.exam_id ?? payload.examId
  }
  if (payload.frame_number !== undefined || payload.frameNumber !== undefined) {
    body.frame_number = payload.frame_number ?? payload.frameNumber
  }
  if (payload.bbox_data !== undefined || payload.bboxData !== undefined) {
    body.bbox_data = payload.bbox_data ?? payload.bboxData
  }
  if (payload.snapshot_path !== undefined || payload.snapshotPath !== undefined) {
    body.snapshot_path = payload.snapshot_path ?? payload.snapshotPath
  }

  const res = await fetch(`${API_BASE}/api/bookmarks/${id}/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`bookmark update failed: ${res.status}`)
  return toUiBookmark(await res.json())
}

export async function deleteBookmark(id) {
  const res = await fetch(`${API_BASE}/api/bookmarks/${id}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok && res.status !== 204) {
    throw new Error(`bookmark delete failed: ${res.status}`)
  }
}
