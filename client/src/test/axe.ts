import { axe as jestAxe } from 'jest-axe'

/**
 * jest-axe for a page with a sheet open (#192). React Aria's Modal locks scrolling with
 * `overflow: hidden` on <html>; jsdom has no layout, so axe then reads every element as
 * clipped and reports visible labels (the Guidance dial's) as missing. The browser e2e axe
 * checks still run with the lock in place.
 */
export const axe = (...args: Parameters<typeof jestAxe>) => {
  document.documentElement.style.removeProperty('overflow')
  return jestAxe(...args)
}
