<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchPlaces } from '../services/map.service'

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'select', value: { lat: number; lng: number; label: string }): void
}>()

const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const isFocused = ref(false)

let timeout: ReturnType<typeof setTimeout> | null = null

// =====================
// LIVE AUTOCOMPLETE CON DEBOUNCE
// =====================
watch(query, (val) => {
  if (timeout) clearTimeout(timeout)

  if (!val || val.trim().length < 3) {
    results.value = []
    return
  }

  timeout = setTimeout(async () => {
    try {
      loading.value = true
      const data = await searchPlaces(val)
      results.value = Array.isArray(data) ? data.slice(0, 6) : []
    } catch (err) {
      console.error('Search error', err)
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
})

// =====================
// SELECCIONAR RESULTADO
// =====================
function selectPlace(place: any) {
  const coords = {
    lat: Number(place.lat),
    lng: Number(place.lon),
    label: place.display_name,
  }

  query.value = place.display_name
  results.value = []
  isFocused.value = false
  
  emit('select', coords)
}

// =====================
// BÚSQUEDA MANUAL
// =====================
function onSearch() {
  const value = query.value.trim()
  if (!value) return

  emit('search', value)
  results.value = []
  isFocused.value = false
}

// =====================
// MANEJO DE FOCO
// =====================
function handleBlur() {
  // Pequeño delay para permitir clic en resultados
  setTimeout(() => {
    isFocused.value = false
  }, 150)
}
</script>

<template>
  <div class="map-search" role="search">
    
    <!-- INPUT GROUP -->
    <div class="search-group" :class="{ 'focused': isFocused || results.length > 0 }">
      
      <!-- Icono de búsqueda -->
      <div class="search-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>

      <!-- Campo de entrada -->
      <input
        v-model="query"
        class="search-input"
        type="text"
        placeholder="Buscar dirección o lat, lng"
        @keyup.enter="onSearch"
        @focus="isFocused = true"
        @blur="handleBlur"
        aria-label="Buscar ubicación"
        aria-autocomplete="list"
        :aria-expanded="results.length > 0"
        aria-controls="search-results"
      />

      <!-- Botón de búsqueda -->
      <button 
        class="search-btn" 
        @click="onSearch"
        :disabled="!query.trim() || loading"
        aria-label="Ejecutar búsqueda"
        type="button"
      >
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 10 4 15 9 20"/>
          <path d="M20 4v7a4 4 0 0 1-4 4H4"/>
        </svg>
      </button>

      <!-- Indicador de carga -->
      <transition name="fade">
        <div v-if="loading" class="search-loader" aria-hidden="true">
          <div class="loader-dot"></div>
          <div class="loader-dot"></div>
          <div class="loader-dot"></div>
        </div>
      </transition>
    </div>

    <!-- DROPDOWN DE RESULTADOS -->
    <transition name="slide-fade">
      <div 
        v-if="results.length > 0" 
        id="search-results"
        class="results-dropdown"
        role="listbox"
        aria-label="Resultados de búsqueda"
      >
        <div
          v-for="(item, index) in results"
          :key="item.place_id || index"
          class="result-item"
          role="option"
          @click="selectPlace(item)"
          @keydown.enter="selectPlace(item)"
          tabindex="0"
        >
          <!-- Icono de ubicación -->
          <div class="item-icon">
            <svg class="icon-pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>

          <!-- Contenido del resultado -->
          <div class="item-content">
            <div class="item-title">{{ item.display_name }}</div>
            <div class="item-subtitle">
              <span class="coords">{{ item.lat }}, {{ item.lon }}</span>
              <span v-if="item.type" class="type-badge">{{ item.type }}</span>
            </div>
          </div>

          <!-- Indicador de selección -->
          <div class="item-action">
            <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </transition>

    <!-- ESTADO: SIN RESULTADOS -->
    <transition name="fade">
      <div v-if="!loading && query.trim().length >= 3 && results.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="8" y1="8" x2="14" y2="14"/>
          <line x1="14" y1="8" x2="8" y2="14"/>
        </svg>
        <p>No se encontraron resultados</p>
        <small>Intente con términos más específicos</small>
      </div>
    </transition>

  </div>
</template>

<style scoped>
/* =====================
   VARIABLES CSS - THEME
   ===================== */
:root {
  /* Colores */
  --search-bg: #ffffff;
  --search-border: #e5e7eb;
  --search-border-focus: #3b82f6;
  --search-text: #1f2937;
  --search-text-secondary: #6b7280;
  --search-placeholder: #9ca3af;
  --search-hover: #f9fafb;
  --search-active: #eff6ff;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-glow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  
  /* Bordes */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-full: 9999px;
  
  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  
  /* Tipografía */
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
}

/* =====================
   CONTENEDOR PRINCIPAL
   ===================== */
.map-search {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2001;
  width: min(360px, calc(100vw - 32px));
  font-family: var(--font-sans);
}

/* =====================
   GRUPO DE BÚSQUEDA
   ===================== */
.search-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--search-bg);
  border: 2px solid var(--search-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-group.focused,
.search-group:has(.search-input:focus) {
  border-color: var(--search-border-focus);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

/* Icono de búsqueda */
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--search-text-secondary);
  padding-left: 4px;
}

.icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* Input principal */
.search-input {
  flex: 1;
  min-width: 0;
  padding: 10px 4px;
  font-size: 14px;
  font-weight: 400;
  color: var(--search-text);
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--search-placeholder);
}

.search-input:focus {
  outline: none;
}

/* Botón de búsqueda */
.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--search-border-focus);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.search-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.search-btn:active:not(:disabled) {
  transform: translateY(0);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn:focus-visible {
  outline: 2px solid var(--search-border-focus);
  outline-offset: 2px;
}

.icon-sm {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

/* Loader animado */
.search-loader {
  position: absolute;
  right: 50px;
  display: flex;
  gap: 3px;
  padding: 0 4px;
}

.loader-dot {
  width: 6px;
  height: 6px;
  background: var(--search-border-focus);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader-dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* =====================
   DROPDOWN DE RESULTADOS
   ===================== */
.results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--search-bg);
  border: 2px solid var(--search-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1001;
  
  /* Scrollbar personalizado */
  scrollbar-width: thin;
  scrollbar-color: var(--search-border) transparent;
}

.results-dropdown::-webkit-scrollbar {
  width: 6px;
}

.results-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.results-dropdown::-webkit-scrollbar-thumb {
  background: var(--search-border);
  border-radius: 3px;
}

.results-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--search-text-secondary);
}

/* Item de resultado */
.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid var(--search-border);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover,
.result-item:focus {
  background: var(--search-hover);
  outline: none;
}

.result-item:active {
  background: var(--search-active);
}

/* Icono de pin */
.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: var(--search-border-focus);
}

.icon-pin {
  width: 18px;
  height: 18px;
}

/* Contenido del item */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--search-text);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--search-text-secondary);
}

.coords {
  font-family: ui-monospace, SFMono-Regular, monospace;
  opacity: 0.8;
}

.type-badge {
  padding: 2px 6px;
  background: var(--search-hover);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Flecha de acción */
.item-action {
  display: flex;
  align-items: center;
  color: var(--search-text-secondary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.result-item:hover .item-action,
.result-item:focus .item-action {
  opacity: 1;
}

.icon-arrow {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

/* =====================
   ESTADO VACÍO
   ===================== */
.empty-state {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  background: var(--search-bg);
  border: 2px solid var(--search-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  text-align: center;
  z-index: 1001;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--search-text-secondary);
  opacity: 0.6;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--search-text);
}

.empty-state small {
  font-size: 12px;
  color: var(--search-text-secondary);
}

/* =====================
   ANIMACIONES
   ===================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: 
    opacity var(--transition-normal),
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.slide-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
}

/* =====================
   RESPONSIVE
   ===================== */
@media (max-width: 480px) {
  .map-search {
    top: 12px;
    left: 12px;
    width: calc(100vw - 24px);
  }
  
  .search-input {
    font-size: 16px; /* Previene zoom en iOS */
  }
  
  .results-dropdown {
    max-height: 40vh;
  }
  
  .item-title {
    font-size: 13px;
  }
}

/* =====================
   ACCESIBILIDAD
   ===================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible para navegación con teclado */
.result-item:focus-visible {
  outline: 2px solid var(--search-border-focus);
  outline-offset: -2px;
  background: var(--search-active);
}

/* =====================
   MODO OSCURO
   ===================== */
@media (prefers-color-scheme: dark) {
  :root {
    --search-bg: #1f2937;
    --search-border: #374151;
    --search-text: #f9fafb;
    --search-text-secondary: #9ca3af;
    --search-placeholder: #6b7280;
    --search-hover: #374151;
    --search-active: #1e40af;
  }
  
  .search-group {
    background: #111827;
  }
  
  .type-badge {
    background: #374151;
  }
  
  .results-dropdown::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
}
</style>