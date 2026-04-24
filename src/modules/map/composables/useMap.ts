import { ref } from 'vue'
import { geocode as geocodeService } from '../services/map.service'
import type { Coordinates } from '../types/map.types'

// ===================== STATE GLOBAL =====================
const loading = ref(false)
const error = ref<string | null>(null)

const lastResult = ref<Coordinates | null>(null)

// 🧭 estado del mapa (global reutilizable)
const currentCenter = ref<Coordinates | null>(null)
const currentZoom = ref<number>(13)

// ===================== GEOCODE =====================
async function resolveAddress(address: string): Promise<Coordinates> {
  if (!address) {
    const msg = 'Dirección vacía'
    error.value = msg
    throw new Error(msg)
  }

  loading.value = true
  error.value = null

  try {
    const result = await geocodeService(address)

    lastResult.value = result
    currentCenter.value = result

    return result
  } catch (e: any) {
    const msg = e?.message || 'Error resolviendo dirección'
    error.value = msg
    throw new Error(msg)
  } finally {
    loading.value = false
  }
}

// ===================== MAP HELPERS =====================
function setCenter(coords: Coordinates) {
  currentCenter.value = coords
}

function setZoom(zoom: number) {
  currentZoom.value = zoom
}

function resetState() {
  error.value = null
  loading.value = false
}

// ===================== DISTANCE (UTIL FUTURO) =====================
// útil para routing / UX
function distance(a: Coordinates, b: Coordinates) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180

  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * R * Math.asin(Math.sqrt(h))
}

// ===================== EXPORT =====================
export function useMap() {
  return {
    // estado
    loading,
    error,
    lastResult,

    // mapa state
    currentCenter,
    currentZoom,

    // actions
    resolveAddress,
    setCenter,
    setZoom,
    resetState,

    // utils
    distance,
  }
}