/*
 * #207: the worker answers each message on its own thread. transformers.js cannot load in jsdom,
 * so a load here comes back as an error reply, which is what the button shows as "failed".
 */

it('answers a message with a reply, posted back to the page', async () => {
  const posted = jest
    .spyOn(window, 'postMessage')
    .mockImplementation(() => undefined)
  await import('../transcribe.worker')
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { id: 1, type: 'load', lang: 'en-AU' }
    })
  )
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(posted).toHaveBeenCalledWith(
    expect.objectContaining({ id: 1, type: 'error' })
  )
})
