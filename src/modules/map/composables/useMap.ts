import { ref } from 'vue'
import { geocode } from '../services/map.service'

export function useMap() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function resolveAddress(address: string) {
    loading.value = true
    try {
      return await geocode(address)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    resolveAddress
  }
}