// services/radio.service.ts

const API =
  import.meta.env.VITE_API_URL ||
  'http://192.168.83.128:3000'

// =======================
// 📡 COVERAGE (GeoJSON)
// =======================
export async function getCoverage(
  lat: number,
  lon: number,
  radius = 8000,
  signal?: AbortSignal
) {
  const url = new URL(`${API}/api/radio/coverage`)

  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('radius', String(radius))

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`coverage error ${res.status}`)
  }

  return res.json()
}

// =======================
// 📍 NEAREST CELLS
// =======================
export async function getNearestCells(
  lat: number,
  lon: number,
  limit = 10,
  signal?: AbortSignal
) {
  const url = new URL(`${API}/api/radio/nearest`)

  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString(), { signal })

  if (!res.ok) {
    throw new Error(`nearest error ${res.status}`)
  }

  return res.json()
}

// =======================
// 🧠 MVT TILES (RECOMENDADO 🔥)
// =======================
export function getRadioTileUrl() {
  return `${API}/tiles/radio/{z}/{x}/{y}.pbf`
}