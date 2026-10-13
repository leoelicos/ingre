/* this file is currently not being used */
type IdbPromiseType = {
  storeName: string
  method: string
  object: unknown
}

function objectId(object: unknown): string {
  if (typeof object !== 'object' || object === null) return ''
  if (!('_id' in object)) return ''
  const id = object._id
  if (typeof id !== 'string') return ''
  return id
}

const idbPromise: (params: IdbPromiseType) => Promise<unknown> = (params) => {
  const { storeName, method, object } = params

  return new Promise((resolve, _reject) => {
    const request = window.indexedDB.open('ingre', 1)

    request.onupgradeneeded = function (_e) {
      const db = request.result
      db.createObjectStore('recipes', { keyPath: '_id' })
      db.createObjectStore('ingredients', { keyPath: '_id' })
      db.createObjectStore('categories', { keyPath: '_id' })
    }

    request.onerror = function (_e) {
      console.error('There was an error')
    }

    request.onsuccess = function (_e) {
      const db = request.result
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)

      db.onerror = function (_e) {
        console.error('error')
      }

      switch (method) {
        case 'put':
          store.put(object)
          resolve(object)
          break
        case 'get':
          const all = store.getAll()
          all.onsuccess = function () {
            resolve(all.result)
          }
          break
        case 'delete':
          store.delete(objectId(object))
          break
        default:
          console.error('No valid method')
          break
      }

      tx.oncomplete = function () {
        db.close()
      }
    }
  })
}
export default idbPromise
