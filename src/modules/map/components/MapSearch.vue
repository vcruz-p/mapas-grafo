<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { searchPlaces } from '../services/map.service'

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'select', value: { lat: number; lng: number; label: string }): void
}>()

const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)

const isOpen = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

// =====================
// AUTOCOMPLETE SEARCH
// =====================
watch(query, (val) => {
  if (timeout) clearTimeout(timeout)

  const q = val?.trim()

  if (!q || q.length < 2) {
    results.value = []
    return
  }

  isOpen.value = true

  timeout = setTimeout(async () => {
    loading.value = true
    try {
      const data = await searchPlaces(q)

      results.value = Array.isArray(data)
        ? data.slice(0, 6)
        : []
    } catch (e) {
      console.error('search error:', e)
      results.value = []
    } finally {
      loading.value = false
    }
  }, 250)
})

// =====================
// OPEN / CLOSE
// =====================
function openSearch() {
  isOpen.value = true
}

function closeSearch() {
  setTimeout(() => {
    if (!query.value) {
      isOpen.value = false
      results.value = []
    }
  }, 150)
}

// =====================
// SELECT PLACE
// =====================
async function selectPlace(place: any) {
  emit('select', {
    lat: Number(place.lat),
    lng: Number(place.lon),
    label: place.display_name,
  })

  query.value = place.display_name
  results.value = []

  await nextTick()
  isOpen.value = false
}

// =====================
// ENTER SEARCH
// =====================
async function onSearch() {
  const q = query.value.trim()
  if (!q) return

  if (results.value.length > 0) {
    selectPlace(results.value[0])
    return
  }

  try {
    const data = await searchPlaces(q)

    if (Array.isArray(data) && data.length > 0) {
      selectPlace(data[0])
      return
    }
  } catch (e) {
    console.error(e)
  }

  emit('search', q)

  isOpen.value = false
  results.value = []
}
</script>

<template>
  <div class="map-search">

    <!-- ===================== -->
    <!-- FAB (LUPA BOOTSTRAP) -->
    <!-- ===================== -->
    <button
      v-if="!isOpen"
      class="fab"
      @click="openSearch"
      aria-label="Abrir búsqueda"
    >
      <i class="bi bi-search"></i>
    </button>

    <!-- ===================== -->
    <!-- SEARCH EXPANDIDO -->
    <!-- ===================== -->
    <div v-else class="search-container">

      <div class="search-box">

        <!-- ICONO -->
        <i class="bi bi-search icon-left"></i>

        <!-- INPUT -->
        <input
          v-model="query"
          class="input"
          placeholder="Buscar lugar..."
          @keyup.enter="onSearch"
          @blur="closeSearch"
          autofocus
        />

        <!-- CLOSE -->
        <button class="close" @click="isOpen = false">
          ✕
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading">
        Buscando...
      </div>

      <!-- RESULTADOS -->
      <div v-if="results.length" class="dropdown">
        <div
          v-for="(item, i) in results"
          :key="i"
          class="item"
          @mousedown.prevent="selectPlace(item)"
        >
          <i class="bi bi-geo-alt-fill me-2"></i>
          {{ item.display_name }}
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.map-search {
  position: relative;
}

/* ===================== */
/* FAB */
/* ===================== */
.fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform .2s ease;
}

.fab:hover {
  transform: scale(1.05);
}

.fab i {
  font-size: 18px;
}

/* ===================== */
/* SEARCH BOX */
/* ===================== */
.search-container {
  position: absolute;
  right: 0;
  top: 0;
  animation: expand .2s ease;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  padding: 10px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,.15);
}

/* ICON */
.icon-left {
  font-size: 16px;
  opacity: .6;
}

/* INPUT */
.input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

/* CLOSE */
.close {
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: .6;
  font-size: 14px;
}

/* LOADING */
.loading {
  font-size: 12px;
  padding: 6px 10px;
  opacity: .6;
}

/* DROPDOWN */
.dropdown {
  margin-top: 6px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,.12);
}

.item {
  padding: 10px;
  cursor: pointer;
  color: #111827;
  display: flex;
  align-items: center;
}

.item:hover {
  background: #f3f4f6;
}

/* ANIMATION */
@keyframes expand {
  from {
    transform: scaleX(0.3);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}
</style>