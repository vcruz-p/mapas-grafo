<script setup lang="ts">
import { ref, computed } from 'vue'
import PersonGraph from '../modules/graph/components/PersonGraph.vue'
import MapView from '../modules/map/components/MapView.vue'
import SearchControls from '../components/SearchControls.vue'
import { persons, links } from '../data/mockData'

const activeTab = ref<'graph' | 'map'>('graph')
const searchTerm = ref('')
const selectedFilter = ref('Todos')
const showAdvanced = ref(false)

const filteredPersons = computed(() => {
  if (!searchTerm.value) return persons
  
  const term = searchTerm.value.toLowerCase()
  
  return persons.filter(person => {
    switch (selectedFilter.value) {
      case 'Nombre':
        return person.name.toLowerCase().includes(term)
      case 'Cargo':
        return String(person.data.cargo ?? '').toLowerCase().includes(term)
      case 'Departamento':
        return String(person.data.departamento ?? '').toLowerCase().includes(term)
      case 'Ubicación':
        return String(person.data.ubicacion ?? '').toLowerCase().includes(term)
      default:
        // Buscar en todos los campos
        return (
          person.name.toLowerCase().includes(term) ||
          Object.values(person.data).some(val => 
            String(val).toLowerCase().includes(term)
          )
        )
    }
  })
})

const handleSearch = ({ term, filter }: { term: string; filter: string }) => {
  console.log('Búsqueda:', { term, filter })
}

const handleClear = () => {
  console.log('Búsqueda limpiada')
}
</script>

<template>
  <div class="app">

    <header class="header">
      <button
        :class="{ active: activeTab === 'graph' }"
        @click="activeTab = 'graph'"
      >
        Grafo
      </button>

      <button
        :class="{ active: activeTab === 'map' }"
        @click="activeTab = 'map'"
      >
        Mapa
      </button>
    </header>

    <main class="main">
      <div v-if="activeTab === 'graph'" class="graph-view">
        <SearchControls
          v-model:search-term="searchTerm"
          v-model:selected-filter="selectedFilter"
          v-model:show-advanced="showAdvanced"
          @search="handleSearch"
          @clear="handleClear"
        />
        
        <div class="results-info" v-if="searchTerm">
          <span class="results-count">
            {{ filteredPersons.length }} resultado{{ filteredPersons.length !== 1 ? 's' : '' }} encontrado{{ filteredPersons.length !== 1 ? 's' : '' }}
          </span>
          <span class="search-term">para "{{ searchTerm }}"</span>
        </div>
        
        <PersonGraph 
          :persons="filteredPersons" 
          :links="links.filter(l => 
            filteredPersons.some(p => p.id === l.source) && 
            filteredPersons.some(p => p.id === l.target)
          )" 
        />
      </div>
      <MapView v-else />
    </main>

  </div>
</template>