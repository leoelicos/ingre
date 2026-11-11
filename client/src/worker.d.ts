/* Vite's `?worker` imports (#207): the default export constructs the bundled worker. */
declare module '*?worker' {
  const WorkerConstructor: new () => Worker
  export default WorkerConstructor
}
