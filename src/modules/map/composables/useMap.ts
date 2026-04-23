import { ref } from 'vue'
import { geocode as geocodeService } from '../services/map.service'
import type { Coordinates } from '../types/map.types'

export function useMap() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastResult = ref<Coordinates | null>(null)

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
      return result

    } catch (e: any) {
      const msg = e?.message || 'Error resolviendo dirección'
      error.value = msg
      throw new Error(msg)

    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    lastResult,
    resolveAddress,
  }
}