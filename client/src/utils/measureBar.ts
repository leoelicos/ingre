/**
 * Callback ref that writes an element's rendered height into a CSS custom property on <html>,
 * so lists can pad (and scroll-pad) by the real height of a sticky or pinned bar. React calls a
 * new callback ref on every render, so the value follows any change in the bar's height.
 */
export const measureBar =
  (property: string) =>
  (element: HTMLElement | null): void => {
    if (element !== null)
      document.documentElement.style.setProperty(
        property,
        `${element.offsetHeight}px`
      )
  }

export const STEPS_BAR = '--flow-steps-height'
export const BOTTOM_BAR = '--list-bar-height'
