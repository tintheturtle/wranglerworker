addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request)
  )
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace('https://cloudflare.com', 'https://github.com/tintheturtle/wranglerworker')
      )
    }
  }

}

const rewriter = new HTMLRewriter()
  .on('a', new AttributeRewriter('href'))
 
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

  const page = await fetch(URL)

  // Creating redirection to variant
  return rewriter.transform(page)
}
