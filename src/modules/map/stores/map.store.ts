import { defineStore } from 'pinia'

export interface Coordinates {
  lat: number
  lng: number
}

export const useMapStore = defineStore('map', {
  state: () => ({
    points: [] as Coordinates[],
    segments: [] as any[],
  }),

  actions: {
    addPoint(p: Coordinates) {
      this.points.push(p)
    },

    addSegment(geojson: any) {
      this.segments.push(geojson)
    },

    clearRoute() {
      this.points = []
      this.segments = []
    },
  },
})