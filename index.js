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
  // Getting the array of URLs from the api
  const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  const responseURLs = await response.json()
  const variants = responseURLs.variants

  // Generating a random chance of going to either variant
  const random = Math.random()
  let URL = ''
  if (random > 0.5) {
    URL = variants[0]
  }
  else {
    URL = variants[1]
  }

  // Creating redirection to variant
  return Response.redirect(URL)
}
