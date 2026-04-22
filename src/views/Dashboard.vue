<script setup lang="ts">
import { ref } from 'vue'
import PersonGraph from '../modules/graph/components/PersonGraph.vue'
import MapView from '../modules/map/components/MapView.vue'
import { persons, links } from '../data/mockData'

const activeTab = ref<'graph' | 'map'>('graph')
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
      <PersonGraph 
        v-if="activeTab === 'graph'" 
        :persons="persons" 
        :links="links" 
      />
      <MapView v-else />
    </main>

  </div>
</template>