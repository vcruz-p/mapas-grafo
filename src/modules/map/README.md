# Módulo MAP - División de Responsabilidades

Este documento describe la arquitectura y las responsabilidades de cada capa dentro del módulo de mapa (`/src/modules/map/`).

## 📁 Estructura del Módulo

```
map/
├── components/        # Componentes Vue UI
├── composables/       # Lógica reutilizable y estado global
├── services/          # Comunicación con APIs externas
├── stores/            # Estado persistente de la aplicación
├── types/             # Definiciones de tipos TypeScript
├── index.ts           # Punto de entrada y exports públicos
└── README.md          # Este documento
```

---

## 🧩 Capas y Responsabilidades

### 1. **Components** (`/components`)
**Responsabilidad:** Renderizado UI, interacción con el usuario y coordinación visual.

| Componente | Responsabilidad |
|------------|-----------------|
| `MapView.vue` | Componente principal del mapa. Inicializa MapLibre, gestiona el ciclo de vida, coordina marcadores, rutas, capas de radio y eventos del mapa. Expone controles y búsqueda. |
| `MapControls.vue` | Barra de controles UI: zoom, centrar, resetear, limpiar ruta, toggles de routing y radio. Solo emite eventos, no contiene lógica de negocio. |
| `MapLayers.vue` | Gestión de capas visuales (street, satélite, radiobases). Configura sources y layers en MapLibre, maneja visibilidad y popups de torres. |
| `MapSearch.vue` | Input de búsqueda con autocomplete. Debounce de consultas, muestra resultados y emite selección de coordenadas. |

**Principios:**
- Solo se encargan de la vista y eventos UI.
- La lógica de negocio se delega a composables o services.
- Los componentes hijos emiten eventos; el padre (`MapView`) coordina.

---

### 2. **Composables** (`/composables`)
**Responsabilidad:** Lógica de estado global, acciones reutilizables y orquestación entre servicios y componentes.

| Composable | Responsabilidad |
|------------|-----------------|
| `useMap.ts` | Estado global del mapa: `loading`, `error`, `currentCenter`, `currentZoom`, `lastResult`. Acciones: `resolveAddress` (geocoding), `setCenter`, `setZoom`, `resetState`, `distance` (utilidad). |

**Principios:**
- Contienen estado reactivo compartido (`ref`, `computed`).
- Encapsulan lógica que puede ser reutilizada en múltiples componentes.
- Llaman a los **services** para operaciones asíncronas (API).
- No acceden directamente al DOM ni a la instancia del mapa.

---

### 3. **Services** (`/services`)
**Responsabilidad:** Comunicación con APIs externas (HTTP requests). Transformación de respuestas.

| Service | Responsabilidad |
|---------|-----------------|
| `map.service.ts` | Geocoding (`geocode`), reverse geocoding (`reverse`), cálculo de rutas (`getRoute`), nearest (`nearest`), health check (`health`), búsqueda de lugares (`searchPlaces`). Todos los endpoints de `/api/*`. |
| `radio.service.ts` | Cobertura de radio (`getCoverage`), celdas cercanas (`getNearestCells`), URL de tiles MVT (`getRadioTileUrl`). Endpoints de `/api/radio/*` y `/tiles/radio/*`. |

**Principios:**
- Solo hacen fetch/HTTP.
- No contienen estado reactivo.
- Retornan datos crudos o ligeramente transformados.
- Centralizan URLs base y manejo de errores de red.

---

### 4. **Stores** (`/stores`)
**Responsabilidad:** Estado persistente de la aplicación (Pinia). Datos que deben sobrevivir entre navegaciones o compartirse globalmente.

| Store | Responsabilidad |
|-------|-----------------|
| `map.store.ts` | Almacena puntos y segmentos de ruta (`points`, `segments`). Acciones: `addPoint`, `addSegment`, `clearRoute`. |

**Principios:**
- Usar Pinia para estado que necesita persistencia o sharing global.
- Diferenciar de `composables`: los stores son para estado de la app, los composables para lógica de feature.
- Ideal para integrar con devtools y persistencia.

---

### 5. **Types** (`/types`)
**Responsabilidad:** Definiciones de tipos TypeScript para consistencia y type-safety.

| Tipo | Responsabilidad |
|------|-----------------|
| `Coordinates` | Coordenadas geográficas `{ lat: number, lng: number }`. |
| `MapLocation` | Ubicación con etiqueta `{ label: string, coordinates: Coordinates }`. |

**Principios:**
- Centralizar interfaces usadas en múltiples archivos.
- Exportar desde `index.ts` para uso externo.

---

### 6. **Index** (`index.ts`)
**Responsabilidad:** Punto de entrada público del módulo.

```ts
import MapView from './components/MapView.vue'

export default MapView

export type { Coordinates, MapLocation } from './types/map.types'
```

**Principios:**
- Exportar solo lo necesario para consumo externo.
- Ocultar implementación interna (services, stores, composables).

---

## 🔄 Flujo de Datos Típico

### Ejemplo: Búsqueda de Dirección

```
[MapSearch.vue] 
    → (evento 'select') 
        → [MapView.vue] 
            → llama a `moveTo(coords)` 
                → actualiza marcador y centro del mapa

[MapView.vue] 
    → usa `useMap().resolveAddress(address)` 
        → llama a `map.service.geocode()` 
            → retorna { lat, lng } 
                → actualiza estado en `useMap` 
                    → notifica a componentes
```

### Ejemplo: Activar Capa de Radio

```
[MapLayers.vue] 
    → toggle "Radiobases" 
        → `setRadio(map, true)` 
            → añade source y layer de PMTiles 
                → escucha clicks en torres 
                    → muestra popup con datos
```

---

## 📋 Reglas de Arquitectura

1. **Components** no llaman directamente a **services**. Usan **composables** como intermediarios.
2. **Composables** encapsulan lógica y estado, pero no manipulan el DOM.
3. **Services** son stateless y solo hacen HTTP.
4. **Stores** son para estado global persistente (Pinia).
5. **Types** definen contratos de datos compartidos.
6. **MapView** es el único que conoce la instancia de `maplibregl.Map`.

---

## 🚀 Buenas Prácticas

- ✅ Un componente = una responsabilidad clara.
- ✅ Lógica compleja → composables.
- ✅ API calls → services.
- ✅ Estado compartido → stores o composables (según contexto).
- ✅ Tipos explícitos → evita `any`.
- ✅ Errores manejados en composables/services, UI solo muestra estados.

---

## 🛠️ Mantenimiento

Al agregar nueva funcionalidad:
1. ¿Es UI? → `/components`
2. ¿Es lógica reutilizable/estado? → `/composables`
3. ¿Es llamada HTTP? → `/services`
4. ¿Es estado global persistente? → `/stores`
5. ¿Son tipos nuevos? → `/types`

---

*Documento generado para clarificar la arquitectura del módulo MAP.*
