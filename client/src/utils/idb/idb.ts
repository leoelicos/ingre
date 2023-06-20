/* this file is currently not being used */
type IdbPromiseType = {
  storeName: string
  method: string
  object: any
}

const idbPromise: (params: IdbPromiseType) => Promise<any> = (params) => {
  const { storeName, method, object } = params

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('ingre', 1)

    request.onupgradeneeded = function (e) {
      const db = request.result
      db.createObjectStore('recipes', { keyPath: '_id' })
      db.createObjectStore('ingredients', { keyPath: '_id' })
      db.createObjectStore('categories', { keyPath: '_id' })
    }

    request.onerror = function (e) {
      console.log('There was an error')
    }

    request.onsuccess = function (e) {
      const db = request.result
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)

      db.onerror = function (e) {
        console.log('error', e)
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
          store.delete(object._id)
          break
        default:
          console.log('No valid method')
          break
      }

      tx.oncomplete = function () {
        db.close()
      }
    }
  })
}
export default idbPromise
