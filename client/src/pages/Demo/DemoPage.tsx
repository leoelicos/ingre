import { type FC, useMemo, useState } from 'react'

type Ingredient = {
  id: string
  name: string
  aliases: string[]
}

type Suggestion = {
  id: string
  title: string
  missing: string[]
  cost: string
}

const INGREDIENTS: Ingredient[] = [
  { id: 'carrot', name: 'carrot', aliases: ['carrots'] },
  { id: 'flour', name: 'flour', aliases: ['plain flour'] },
  { id: 'sugar', name: 'sugar', aliases: ['caster sugar'] },
  { id: 'butter', name: 'butter', aliases: [] },
  { id: 'egg', name: 'egg', aliases: ['eggs'] },
  { id: 'chicken', name: 'chicken breast', aliases: ['chicken'] },
  { id: 'rice', name: 'rice', aliases: [] },
  { id: 'onion', name: 'onion', aliases: ['onions'] }
]

const SUGGESTIONS: Record<string, Suggestion[]> = {
  carrot: [
    {
      id: 'carrot-cake',
      title: 'Carrot cake',
      missing: ['sugar', 'raisins'],
      cost: '$2'
    }
  ],
  'carrot+flour': [
    {
      id: 'carrot-cake',
      title: 'Carrot cake',
      missing: ['sugar', 'raisins'],
      cost: '$2'
    }
  ]
}

function matchIngredients(query: string): Ingredient[] {
  const q = query.trim().toLowerCase()
  if (!q) return INGREDIENTS
  return INGREDIENTS.filter(
    (i) =>
      i.name.includes(q) || i.aliases.some((a) => a.includes(q))
  )
}

function getSuggestions(selected: string[]): Suggestion[] {
  const key = selected.slice().sort().join('+')
  if (SUGGESTIONS[key]) return SUGGESTIONS[key]
  if (selected.includes('carrot')) return SUGGESTIONS.carrot ?? []
  return []
}

export const DemoPage: FC = () => {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [tickets, setTickets] = useState<string[]>([])
  const [ack, setAck] = useState('')

  const matches = useMemo(() => matchIngredients(query), [query])
  const suggestions = useMemo(() => getSuggestions(selected), [selected])

  function addIngredient(name: string) {
    if (!selected.includes(name)) {
      setSelected((s) => [...s, name])
      setAck(`${name} added`)
      setTimeout(() => setAck(''), 1200)
    }
    setQuery('')
  }

  function addTicket(title: string) {
    setTickets((t) => [...t, title])
    setAck(`${title} added`)
    setTimeout(() => setAck(''), 1200)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-24">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-medium tracking-tight">ingre</h1>
        <p className="mt-2 text-sm text-[#555]">
          Start from the ingredients you have. Get a suggestion. Add a ticket.
        </p>
      </header>

      <div className="px-4">
        <label className="block text-sm font-medium" htmlFor="search">
          Search ingredients
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="carrot, flour…"
          className="mt-1 w-full rounded-lg border border-[#ddd] bg-white px-3 py-3 text-base outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/20"
          autoComplete="off"
        />
      </div>

      {ack && (
        <p className="mx-4 mt-3 text-sm text-[#0a7a3e]" role="status">
          {ack}
        </p>
      )}

      <ul className="mt-4 divide-y divide-[#eee] px-4">
        {matches.map((ing) => (
          <li key={ing.id} className="flex items-center justify-between py-3">
            <span className="capitalize">{ing.name}</span>
            <button
              type="button"
              onClick={() => addIngredient(ing.name)}
              className="rounded-full border border-[#1a1a1a] px-3 py-1 text-sm"
              aria-label={`Add ${ing.name}`}
            >
              Add
            </button>
          </li>
        ))}
      </ul>

      {selected.length > 0 && (
        <section className="mx-4 mt-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#666]">
            Selected
          </h2>
          <p className="mt-1 text-sm">{selected.join(', ')}</p>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="mx-4 mt-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#666]">
            Suggestion
          </h2>
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="mt-2 rounded-lg border border-[#eee] bg-white p-4"
            >
              <p className="font-medium">{s.title}</p>
              <p className="mt-1 text-sm text-[#555]">
                Add {s.missing.join(', ')} · {s.cost}
              </p>
              <button
                type="button"
                onClick={() => addTicket(s.title)}
                className="mt-3 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm text-white"
              >
                Add ticket
              </button>
            </div>
          ))}
        </section>
      )}

      {tickets.length > 0 && (
        <section className="mx-4 mt-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#666]">
            Tickets
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {tickets.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {/* BRA — primary action fixed bottom-right */}
      <div className="fixed bottom-6 right-4">
        <button
          type="button"
          onClick={() => {
            if (suggestions[0]) addTicket(suggestions[0].title)
          }}
          disabled={suggestions.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-2xl text-white shadow-lg disabled:opacity-40"
          aria-label="Add ticket"
        >
          +
        </button>
      </div>
    </div>
  )
}
