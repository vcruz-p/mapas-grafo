<script setup lang="ts">
import { ref } from 'vue'
import PersonGraph from '../modules/graph/components/PersonGraph.vue'
import MapView from '../modules/map/components/MapView.vue'
import { persons, links } from '../data/mockData'

const activeTab = ref<'graph' | 'map'>('graph')

</script>

<template>
    <div class="app">

        <!-- HEADER -->
        <header class="header">
            <div class="brand">GraphMap</div>

            <nav class="tabs">
                <button class="tab" :class="{ active: activeTab === 'graph' }" @click="activeTab = 'graph'">
                    Grafo
                </button>

                <button class="tab" :class="{ active: activeTab === 'map' }" @click="activeTab = 'map'">
                    Mapa
                </button>
            </nav>
        </header>

        <!-- MAIN -->
        <main class="main">
            <Transition name="fade" mode="out-in">

                <section v-if="activeTab === 'graph'" key="graph" class="view">
                    <PersonGraph :persons="persons" :links="links" />
                </section>

                <section v-else key="map" class="view">
                    <MapView :coordinates="{ lat: 23.1136, lng: -82.3666 }" label="La Habana" />
                </section>

            </Transition>
        </main>

    </div>
</template>

<style scoped>
.app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0b1220;
    color: #e5e7eb;
    font-family: system-ui, sans-serif;
}

/* HEADER */
.header {
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    background: #0f172a;
    border-bottom: 1px solid #1f2937;
}

.brand {
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #60a5fa;
}

.tabs {
    display: flex;
    gap: 8px;
}

.tab {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: 0.2s;
}

.tab:hover {
    background: #111827;
    color: #e5e7eb;
}

.tab.active {
    background: #1d4ed8;
    color: white;
}

/* MAIN */
.main {
    flex: 1;
    overflow: hidden;
}

.view {
    height: 100%;
    width: 100%;
}

/* TRANSITION */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>