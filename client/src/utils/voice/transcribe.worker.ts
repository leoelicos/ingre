/* The on-device speech model's worker (#207): see model.ts. */
import type { Request } from './model'
import { serve } from './model'

const handle = serve((reply) => postMessage(reply))

addEventListener('message', (event: MessageEvent<Request>) => {
  void handle(event.data)
})
