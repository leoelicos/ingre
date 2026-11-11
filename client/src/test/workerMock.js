/* Stands in for Vite's `?worker` imports (#207): a worker that never answers. */
class WorkerMock {
  addEventListener() {}
  postMessage() {}
}
module.exports = { __esModule: true, default: WorkerMock }
