/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  /* dark mode follows the device (#165); the tokens in theme.css switch, classes stay the same */
  darkMode: 'media',
  theme: {
    extend: {
      /* #192: the one breakpoint. Desktop (two columns, centred modal) from 576px; mobile below */
      screens: {
        desk: '576px'
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        brand: 'var(--color-brand)',
        highlight: 'var(--color-highlight)',
        'inverse-text': 'var(--color-inverse-text)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        placeholder: 'var(--color-placeholder)',
        'added-pill': 'var(--color-added-pill)',
        /* picked card / active chip background */
        'chip-active': 'var(--color-chip-active)',
        border: 'var(--color-border)',
        /* dims the page behind the discovery sheet and modal (#192) */
        scrim: 'var(--color-scrim)',
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
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        pressed: 'var(--shadow-pressed)',
        /* neumorphic hierarchy: raised Recipes section, recessed rows, raised chips */
        section: 'var(--shadow-section)',
        recessed: 'var(--shadow-recessed)',
        chip: 'var(--shadow-chip)',
        'chip-pressed': 'var(--shadow-chip-pressed)'
      },
      maxWidth: {
        layout: 'var(--layout-max-width)'
      },
      spacing: {
        gutter: 'var(--layout-gutter)'
      },
      outlineWidth: {
        3: '3px'
      },
      /* #192: the bottom sheet slides up, the modal and the FAB label fade in */
      keyframes: {
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        'sheet-out': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' }
        },
        'label-in': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'sheet-in': 'sheet-in 200ms ease-out',
        'sheet-out': 'sheet-out 200ms ease-in',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-in',
        'label-in': 'label-in 200ms ease-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/container-queries'),
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
