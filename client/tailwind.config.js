/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        placeholder: 'var(--color-placeholder)',
        'added-pill': 'var(--color-added-pill)',
        /* picked card / active chip background */
        'chip-active': 'var(--color-chip-active)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        /* ingredient badges (#154): one background + ink pair per shop section */
        'badge-produce': 'var(--color-badge-produce)',
        'badge-produce-ink': 'var(--color-badge-produce-ink)',
        'badge-meat': 'var(--color-badge-meat)',
        'badge-meat-ink': 'var(--color-badge-meat-ink)',
        'badge-dairy': 'var(--color-badge-dairy)',
        'badge-dairy-ink': 'var(--color-badge-dairy-ink)',
        'badge-deli': 'var(--color-badge-deli)',
        'badge-deli-ink': 'var(--color-badge-deli-ink)',
        'badge-bakery': 'var(--color-badge-bakery)',
        'badge-bakery-ink': 'var(--color-badge-bakery-ink)',
        'badge-pantry': 'var(--color-badge-pantry)',
        'badge-pantry-ink': 'var(--color-badge-pantry-ink)',
        'badge-frozen': 'var(--color-badge-frozen)',
        'badge-frozen-ink': 'var(--color-badge-frozen-ink)',
        'badge-neutral': 'var(--color-badge-neutral)',
        'badge-neutral-ink': 'var(--color-badge-neutral-ink)',
        /* Charlie: text mixed ~70% toward green; dimmed bg from #125 */
        'primary-disabled-bg':
          'color-mix(in srgb, var(--color-primary) 45%, var(--color-bg))',
        'primary-disabled-fg':
          'color-mix(in srgb, var(--color-primary) 70%, var(--color-text))'
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)'
      },
      boxShadow: {
        card: 'var(--shadow-card)'
      },
      maxWidth: {
        layout: 'var(--layout-max-width)'
      },
      spacing: {
        gutter: 'var(--layout-gutter)'
      },
      outlineWidth: {
        3: '3px'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          outline: '3px solid var(--color-primary)',
          outlineOffset: '2px'
        }
      })
    }
  ]
}
