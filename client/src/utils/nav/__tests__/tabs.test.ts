import { activeTabs, tabs } from '../tabs'

describe('tabs (#227)', () => {
  it('are Explore, Inventory, Cook and Profile, in that order', () => {
    expect(tabs().map((tab) => tab.label)).toEqual([
      'Explore',
      'Inventory',
      'Cook',
      'Profile'
    ])
    expect(tabs().map((tab) => tab.to)).toEqual([
      '/#explore',
      '/#inventory',
      '/#cook',
      '/profile'
    ])
  })

  it('knows the tab the page is on', () => {
    expect(activeTabs('/', '')).toEqual(['explore'])
    expect(activeTabs('/', '#explore')).toEqual(['explore'])
    expect(activeTabs('/', '#inventory')).toEqual(['inventory'])
    expect(activeTabs('/', '#cook')).toEqual(['cook'])
    expect(activeTabs('/', '#anything')).toEqual(['explore'])
    expect(activeTabs('/profile', '')).toEqual(['profile'])
  })

  it('has no tab on the sign-in pages', () => {
    expect(activeTabs('/login', '')).toEqual([])
    expect(activeTabs('/upgrade', '#cook')).toEqual([])
  })
})
