const reactAria = require('tailwindcss-react-aria-components')

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
        border: 'var(--color-border)',
        success: 'var(--color-success)',
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
    reactAria,
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
