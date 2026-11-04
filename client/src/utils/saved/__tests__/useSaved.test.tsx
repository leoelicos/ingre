import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  removeMock,
  saveFails,
  saveMock,
  savedQuery,
  savedRecipe
} from '../../../test/savedMocks'
import { recipeById } from '../../../test/library'
import { newCopy, saveInput } from '../../balance/copies'
import { catalogue } from '../../library/recipeLibrary'
import type { RecipeInput } from '../../../types/payloads'
import {
  SAVE_FAILED,
  savedLibraryIds,
  updateSaved,
  useSaved
} from '../useSaved'

const dahl = recipeById('dahl')
const input = saveInput(dahl, newCopy('dahl'), catalogue)

const wrapper =
  (mocks: readonly MockedResponse[]) =>
  ({ children }: { children: ReactNode }) =>
    <MockedProvider mocks={mocks}>{children}</MockedProvider>

describe('Feature: Saving (#182, F4)', () => {
  it('reads library ids, ignoring recipes from elsewhere', () => {
    expect([
      ...savedLibraryIds([{ libraryId: 'dahl' }, { libraryId: null }])
    ]).toEqual(['dahl'])
    const cache = new InMemoryCache()
    updateSaved(cache, () => [savedRecipe('x')])
    expect(cache.extract()).toEqual({})
  })

  it('Scenario: Save needs sign-in: signed out nothing is read', () => {
    const { result } = renderHook(() => useSaved(false), {
      wrapper: wrapper([])
    })
    expect(result.current.ids.size).toBe(0)
  })

  it('Scenario: Saving sends the copy to the server and the heart fills', async () => {
    const seen: RecipeInput[] = []
    const { result } = renderHook(() => useSaved(true), {
      wrapper: wrapper([savedQuery(), saveMock('dahl', seen)])
    })
    await waitFor(() => expect(result.current.ids.size).toBe(0))
    act(() => result.current.toggle('dahl', input))
    await waitFor(() => expect(result.current.ids.has('dahl')).toBe(true))
    expect(seen[0]?.libraryId).toBe('dahl')
  })

  it('unsaves every server copy of a recipe', async () => {
    const { result } = renderHook(() => useSaved(true), {
      wrapper: wrapper([
        savedQuery([savedRecipe('dahl', 'a'), savedRecipe('dahl', 'b')]),
        removeMock('a'),
        removeMock('b')
      ])
    })
    await waitFor(() => expect(result.current.ids.has('dahl')).toBe(true))
    act(() => result.current.toggle('dahl', input))
    await waitFor(() => expect(result.current.ids.has('dahl')).toBe(false))
  })

  it('says when saving or unsaving fails', async () => {
    const saving = renderHook(() => useSaved(true), {
      wrapper: wrapper([savedQuery(), saveFails()])
    })
    await waitFor(() => expect(saving.result.current.ids.size).toBe(0))
    act(() => saving.result.current.toggle('dahl', input))
    await waitFor(() => expect(saving.result.current.error).toBe(SAVE_FAILED))
    const removing = renderHook(() => useSaved(true), {
      wrapper: wrapper([
        savedQuery([savedRecipe('dahl', 'a')]),
        removeMock('a', true)
      ])
    })
    await waitFor(() =>
      expect(removing.result.current.ids.has('dahl')).toBe(true)
    )
    act(() => removing.result.current.toggle('dahl', input))
    await waitFor(() => expect(removing.result.current.error).toBe(SAVE_FAILED))
  })
})
