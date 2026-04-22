import { ref } from 'vue'

export function useGraph() {
  const loading = ref(false)

  return {
    loading
  }
}