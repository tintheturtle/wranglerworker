addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request)
  )
})

let URL = ''

/**
 * Respond with hello worker text
 * @param {Request} request
 */
 
async function handleRequest(request) {
  const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  const responseURLs = await response.json()
  const variants = responseURLs.variants
  console.log(variants)


  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
