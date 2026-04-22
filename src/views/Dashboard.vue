<script setup lang="ts">
import { ref } from 'vue'

// IMPORT CORRECTO (asegúrate que ambos exporten default Vue component)
import GraphModule from '../modules/graph/index'
import MapModule from '../modules/map/index'

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
      <component :is="activeTab === 'graph' ? GraphModule : MapModule" />
    </main>

  </div>
</template>