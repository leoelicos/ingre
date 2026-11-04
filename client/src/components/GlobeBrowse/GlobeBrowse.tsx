import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import createGlobe from 'cobe'

export interface CountryPin {
  id: string
  name: string
  location: [number, number] // [lat, lng]
  recipes?: number
}

export interface GlobeBrowseProps {
  pins?: CountryPin[]
  onSelect?: (pin: CountryPin) => void
}

const DEFAULT_PINS: CountryPin[] = [
  { id: 'usa', name: 'USA', location: [39.8, -98.5], recipes: 12 },
  { id: 'colombia', name: 'Colombia', location: [4.6, -74.1], recipes: 5 },
  { id: 'argentina', name: 'Argentina', location: [-38.4, -63.6], recipes: 4 },
  { id: 'senegal', name: 'Senegal', location: [14.5, -14.5], recipes: 3 },
  { id: 'czechia', name: 'Czechia', location: [49.8, 15.5], recipes: 2 }
]

/** Interactive globe for browsing recipes by country. Uses lightweight cobe (~5KB). */
export const GlobeBrowse: FC<GlobeBrowseProps> = ({
  pins = DEFAULT_PINS,
  onSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<CountryPin | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let phi = 0
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 12000,
      mapBrightness: 6,
      baseColor: [0.7, 0.8, 0.95],
      markerColor: [0.1, 0.1, 0.1],
      glowColor: [0.9, 0.9, 1],
      markers: pins.map((p) => ({
        location: p.location,
        size: 0.04
      })),
      onRender: (state) => {
        state.phi = phi
        phi += 0.003
      }
    })

    return () => globe.destroy()
  }, [pins])

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="h-72 w-72 rounded-full"
          aria-label="Interactive globe of recipes by country"
        />
        {/* Overlay card like the mockup */}
        <div className="absolute left-2 top-2 w-44 rounded-control bg-bg/90 p-3 text-sm shadow-raised">
          <div className="font-semibold">Recently explored</div>
          <div className="text-xs text-text-secondary">Your latest countries</div>
          <ul className="mt-2 list-none p-0">
            {pins.slice(0, 5).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(p)
                    onSelect?.(p)
                  }}
                  className="text-left hover:underline"
                >
                  ■ {p.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-1 text-xs">See all →</div>
        </div>
      </div>
      {selected && (
        <p className="m-0 text-sm">
          Selected: <strong>{selected.name}</strong>
          {selected.recipes ? ` (${selected.recipes} recipes)` : ''}
        </p>
      )}
    </div>
  )
}
