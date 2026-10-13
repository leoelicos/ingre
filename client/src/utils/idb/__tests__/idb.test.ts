import idbPromise from '../idb'

type Handler = (() => void) | null

function installIndexedDb() {
  const calls: string[] = []
  const allRequest: { result: unknown[]; onsuccess: Handler } = {
    result: [{ _id: '1' }],
    onsuccess: null
  }
  const store = {
    put: (object: unknown) => {
      calls.push(`put:${JSON.stringify(object)}`)
    },
    getAll: () => allRequest,
    delete: (id: string) => {
      calls.push(`delete:${id}`)
    }
  }
  const tx: { objectStore: () => typeof store; oncomplete: Handler } = {
    objectStore: () => store,
    oncomplete: null
  }
  const db: {
    createObjectStore: (name: string) => void
    transaction: (name: string, mode: string) => typeof tx
    close: () => void
    onerror: Handler
  } = {
    createObjectStore: (name) => {
      calls.push(`store:${name}`)
    },
    transaction: (name, mode) => {
      calls.push(`tx:${name}:${mode}`)
      return tx
    },
    close: () => {
      calls.push('close')
    },
    onerror: null
  }
  const request: {
    result: typeof db
    onupgradeneeded: Handler
    onerror: Handler
    onsuccess: Handler
  } = {
    result: db,
    onupgradeneeded: null,
    onerror: null,
    onsuccess: null
  }

  Object.defineProperty(window, 'indexedDB', {
    configurable: true,
    value: {
      open: () => request
    }
  })

  return { request, allRequest, db, tx, calls }
}

describe('idbPromise', () => {
  it('creates stores, puts an object, and closes the database', async () => {
    const fake = installIndexedDb()
    const pending = idbPromise({
      storeName: 'recipes',
      method: 'put',
      object: { _id: '1' }
    })
    fake.request.onupgradeneeded?.()
    fake.request.onsuccess?.()
    fake.db.onerror?.()
    fake.tx.oncomplete?.()
    await expect(pending).resolves.toEqual({ _id: '1' })
    expect(fake.calls).toEqual([
      'store:recipes',
      'store:ingredients',
      'store:categories',
      'tx:recipes:readwrite',
      'put:{"_id":"1"}',
      'close'
    ])
  })

  it('reads every record', async () => {
    const fake = installIndexedDb()
    const pending = idbPromise({
      storeName: 'recipes',
      method: 'get',
      object: null
    })
    fake.request.onsuccess?.()
    fake.allRequest.onsuccess?.()
    await expect(pending).resolves.toEqual([{ _id: '1' }])
  })

  it('deletes by id when the object has one', () => {
    const fake = installIndexedDb()
    void idbPromise({
      storeName: 'recipes',
      method: 'delete',
      object: { _id: 'abc' }
    })
    fake.request.onsuccess?.()
    expect(fake.calls).toContain('delete:abc')

    void idbPromise({ storeName: 'recipes', method: 'delete', object: 'nope' })
    fake.request.onsuccess?.()
    void idbPromise({ storeName: 'recipes', method: 'delete', object: null })
    fake.request.onsuccess?.()
    void idbPromise({
      storeName: 'recipes',
      method: 'delete',
      object: { name: 'x' }
    })
    fake.request.onsuccess?.()
    void idbPromise({
      storeName: 'recipes',
      method: 'delete',
      object: { _id: 4 }
    })
    fake.request.onsuccess?.()
    expect(fake.calls.filter((call) => call.startsWith('delete:'))).toEqual([
      'delete:abc',
      'delete:',
      'delete:',
      'delete:',
      'delete:'
    ])
  })

  it('logs an error for an unknown method or a failed open', () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const fake = installIndexedDb()
    void idbPromise({ storeName: 'recipes', method: 'nope', object: {} })
    fake.request.onsuccess?.()
    fake.request.onerror?.()
    expect(error).toHaveBeenCalledWith('No valid method')
    expect(error).toHaveBeenCalledWith('There was an error')
    error.mockRestore()
  })
})
