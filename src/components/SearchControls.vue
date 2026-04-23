<script setup lang="ts">
import { ref, watch } from 'vue'

interface SearchControlsProps {
  searchTerm?: string
  filterOptions?: string[]
  selectedFilter?: string
  showAdvanced?: boolean
}

const props = withDefaults(defineProps<SearchControlsProps>(), {
  searchTerm: '',
  filterOptions: () => ['Todos', 'Nombre', 'Cargo', 'Departamento', 'Ubicación'],
  selectedFilter: 'Todos',
  showAdvanced: false,
})

const emit = defineEmits<{
  'update:searchTerm': [value: string]
  'update:selectedFilter': [value: string]
  'update:showAdvanced': [value: boolean]
  search: [value: { term: string; filter: string }]
  clear: []
}>()

const localSearchTerm = ref(props.searchTerm)
const localSelectedFilter = ref(props.selectedFilter)
const localShowAdvanced = ref(props.showAdvanced)
const isExpanded = ref(false)

watch(() => props.searchTerm, (val) => {
  localSearchTerm.value = val
})

watch(() => props.selectedFilter, (val) => {
  localSelectedFilter.value = val
})

watch(() => props.showAdvanced, (val) => {
  localShowAdvanced.value = val
})

const handleSearch = () => {
  emit('update:searchTerm', localSearchTerm.value)
  emit('update:selectedFilter', localSelectedFilter.value)
  emit('search', { term: localSearchTerm.value, filter: localSelectedFilter.value })
}

const handleClear = () => {
  localSearchTerm.value = ''
  localSelectedFilter.value = 'Todos'
  emit('update:searchTerm', '')
  emit('update:selectedFilter', 'Todos')
  emit('clear')
}

const toggleAdvanced = () => {
  isExpanded.value = !isExpanded.value
  localShowAdvanced.value = isExpanded.value
  emit('update:showAdvanced', isExpanded.value)
}
</script>

<template>
  <div class="search-controls">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          v-model="localSearchTerm"
          type="text"
          class="search-input"
          placeholder="Buscar por nombre, cargo, departamento..."
          @keyup.enter="handleSearch"
        />
        <button
          v-if="localSearchTerm"
          class="clear-btn"
          @click="handleClear"
          title="Limpiar búsqueda"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="filter-select-wrapper">
        <select
          v-model="localSelectedFilter"
          class="filter-select"
          @change="handleSearch"
        >
          <option
            v-for="option in filterOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
        <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <button class="search-btn" @click="handleSearch">
        <span>Buscar</span>
      </button>

      <button
        :class="['advanced-toggle', { active: isExpanded }]"
        @click="toggleAdvanced"
        title="Opciones avanzadas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>
    </div>

    <!-- Panel Avanzado -->
    <transition name="expand">
      <div v-if="isExpanded" class="advanced-panel">
        <div class="advanced-section">
          <h4 class="advanced-title">Filtros Rápidos</h4>
          <div class="quick-filters">
            <button
              v-for="opt in filterOptions.filter(o => o !== 'Todos')"
              :key="opt"
              :class="['quick-filter', { active: localSelectedFilter === opt }]"
              @click="localSelectedFilter = opt; handleSearch()"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="advanced-divider" />

        <div class="advanced-section">
          <h4 class="advanced-title">Ordenar por</h4>
          <div class="sort-options">
            <button class="sort-btn active">Relevancia</button>
            <button class="sort-btn">A-Z</button>
            <button class="sort-btn">Z-A</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.search-controls {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e2e8f0;
}

.clear-btn svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.filter-select-wrapper {
  position: relative;
  min-width: 160px;
}

.filter-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  cursor: pointer;
  outline: none;
  appearance: none;
  transition: all 0.2s ease;
}

.filter-select:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748b;
  pointer-events: none;
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.advanced-toggle {
  width: 44px;
  height: 44px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.advanced-toggle.active {
  border-color: #3b82f6;
  background: #3b82f6;
}

.advanced-toggle.active svg {
  color: #fff;
}

.advanced-toggle svg {
  width: 22px;
  height: 22px;
  color: #64748b;
  transition: all 0.2s;
}

/* Panel Avanzado */
.advanced-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.advanced-section {
  flex: 1;
  min-width: 200px;
}

.advanced-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-filter {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-filter:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.quick-filter.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.advanced-divider {
  width: 1px;
  background: #e2e8f0;
  align-self: stretch;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.sort-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

/* Transiciones */
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  border-top-width: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    min-width: 100%;
  }

  .filter-select-wrapper {
    min-width: 100%;
  }

  .search-btn {
    width: 100%;
  }

  .advanced-toggle {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .advanced-panel {
    flex-direction: column;
  }

  .advanced-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
