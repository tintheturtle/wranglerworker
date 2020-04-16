addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request)
  )
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

// Attribute rewriter class using HTMLRewriter API
class AttributeRewriter {
  constructor(attributeName, type) {
    this.attributeName = attributeName,
    this.type = type
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
      switch(this.type) {
        case 'cookie': {
            element.setAttribute(
              this.attributeName,
              attribute.replace('https://cloudflare.com', 'https://github.com/tintheturtle')
            )
            element.setInnerContent('Check out my other github repos here!')
        }
        default: {
            element.setAttribute(
              this.attributeName,
              attribute.replace('https://cloudflare.com', 'https://github.com/tintheturtle/wranglerworker')
            )
            element.setInnerContent('Check out my repo for this take home!')
        }
      }
    }
  }
}

// Setting inner element rewriter
class InnerElementRewriter {
  constructor(content){
    this.content = content
  }
    
  element(element) {
      element.setInnerContent(this.content)
  }
}

// Creating a new instances of HTMLRewriter
const rewriter = new HTMLRewriter()                   // Rewriter for without cookies
  .on('title', new InnerElementRewriter(`Tin's Cloudflare Wrangler Serviceworker`))
  .on('h1#title', new InnerElementRewriter(`Welcome! I'm Tin.`))
  .on('p#description', new InnerElementRewriter(`This was actually a fun take home, I genuinely enjoyed doing it!`))
  .on('a#url', new AttributeRewriter('href', 'normal'))

const cookieRewriter = new HTMLRewriter()              // Rewriter for if cookies are found
  .on('title', new InnerElementRewriter(`Tin's Cloudflare Wrangler Serviceworker`))
  .on('h1#title', new InnerElementRewriter(`Welcome! I'm Tin.`))
  .on('p#description', new InnerElementRewriter(`You have a cookie in your application storage!`))
  .on('a#url', new CookieAttributeRewriter('href'))

// handleRequest function
async function handleRequest(request) {

  // Getting cookies from request headers
  const cookies = request.headers.get('cookie').split(';')
  let cookieURL

  // Looping through cookies to see if there is a URL cookie 
  cookies.forEach(async cookie => {
    
    const trimmedCookie = cookie.trim()
    if (trimmedCookie === 'URL=https://cfw-takehome.developers.workers.dev/variants/1' || trimmedCookie === 'URL=https://cfw-takehome.developers.workers.dev/variants/2'){
      cookieURL = trimmedCookie.split('=')[1]
    }
  })

  // If there is a URL cookie, then respond with the appropriate URL
  if (cookieURL) {
    const cookieResponse = await fetch(cookieURL)
    return cookieRewriter.transform(cookieResponse)
  }


  // Getting the array of URLs from the api
  const variantsFetch = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  const responseURLs = await variantsFetch.json()
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

  // Make fetch request to variant URL
  const response = await fetch(URL)

  // Create a response to return using variant fetched
  const pageResponse = new Response(response.body, response)

  // Set cookies with URL
  pageResponse.headers.set("Set-Cookie", `URL=${URL}; expires=Thu, 18 Dec 2020 12:00:00 UTC`)


  // Using HTMLRewriter API to change elements in page
  return rewriter.transform(pageResponse)
}
