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

    switch(this.attributeName) {
      case 'title': {
        element.setInnerContent(`Tin`)
        break
      }
      case 'h1': {
        element.setInnerContent(`Welcome! I'm Tin`)
        break
      }
      case 'description': {        
        element.setInnerContent(`This was actually a fun take home, I genuinely enjoyed doing it.`)
        break
      }
      case 'href': {
        const attribute = element.getAttribute(this.attributeName)
        if (attribute) {
              element.setAttribute(
                this.attributeName,
                attribute.replace('https://cloudflare.com', 'https://github.com/tintheturtle/wranglerworker')
              )
              element.setInnerContent('Check out my repo for this take home!')
        } 
        break
      }
    }
      
  }
}


const rewriter = new HTMLRewriter()
  .on('title', new AttributeRewriter('title'))
  .on('h1#title', new AttributeRewriter('h1'))
  .on('p#description', new AttributeRewriter('description'))
  .on('a#url', new AttributeRewriter('href'))

 
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
