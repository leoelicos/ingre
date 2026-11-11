/**
 * Thin adapter for the cobe globe library.
 * Feature components import from here, not from 'cobe' directly.
 */
import createGlobe from 'cobe'

export type GlobeMarker = {
  location: [number, number]
  size: number
}

export type GlobeOptions = {
  devicePixelRatio: number
  width: number
  height: number
  phi: number
  theta: number
  dark: number
  diffuse: number
  mapSamples: number
  mapBrightness: number
  baseColor: [number, number, number]
  markerColor: [number, number, number]
  glowColor: [number, number, number]
  markers: GlobeMarker[]
  onRender: (state: { phi: number }) => void
}

export type GlobeInstance = {
  destroy: () => void
}

export const createGlobeAdapter = (
  canvas: HTMLCanvasElement,
  options: GlobeOptions
): GlobeInstance => createGlobe(canvas, options)
