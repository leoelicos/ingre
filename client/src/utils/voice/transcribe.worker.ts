/* The on-device speech model's worker (#207): see model.ts. transformers.js loads on first use. */
import type { Request } from './model'
import { modelLoader, serve } from './model'

const handle = serve(
  (reply) => postMessage(reply),
  modelLoader(() => import('@huggingface/transformers'))
)

addEventListener('message', (event: MessageEvent<Request>) => {
  void handle(event.data)
})
