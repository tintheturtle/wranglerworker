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
            break
        }
        default: {
            element.setAttribute(
              this.attributeName,
              attribute.replace('https://cloudflare.com', 'https://www.linkedin.com/in/tin-nguyen-9604b4191/')
            )
            element.setInnerContent('Click here to see my LinkedIn!')
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

// handleRequest function
async function handleRequest(request) {

  // Getting cookies from request headers
  const cookiesHeaders = request.headers.get('cookie')
  
  let cookies
  let cookieURL
  let variant

  if (cookiesHeaders) {
    cookies = cookiesHeaders.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const trimmedCookie = cookies[i].trim()
      if (trimmedCookie === 'URL=https://cfw-takehome.developers.workers.dev/variants/1' || trimmedCookie === 'URL=https://cfw-takehome.developers.workers.dev/variants/2'){
        cookieURL = trimmedCookie.split('=')[1]
        variant = cookieURL[cookieURL.length-1]
      }
    }
  }

  // If there is a URL cookie, then respond with the appropriate URL
  if (cookieURL) {
    // Create an instance of the HTMLRewriter
    const cookieRewriter = new HTMLRewriter()              // Rewriter for if cookies are found
      .on('title', new InnerElementRewriter(`Tin's Cloudflare Wrangler Serviceworker`))
      .on('h1#title', new InnerElementRewriter(`Welcome! I'm Tin.`))
      .on('p#description', new InnerElementRewriter(`You have a cookie in your application storage! You have variant ${variant}.`))
      .on('a#url', new AttributeRewriter('href', 'cookie'))

    // Fetch URL, check for errors and then rewrite response
    const cookieResponse = await fetch(cookieURL)
      .then((response) => {
        if(response.ok) {
          return response
        } else {
          throw new Error('An error has occurred while fetching the variant. Please try again.')
        }
      })
      .catch(err => {
        return new Response('A network error has occurred. Please try again.', {
          headers: { 'content-type': 'text/plain' },
        })
      })
    return cookieRewriter.transform(cookieResponse)
  }

  // Getting the array of URLs from the api
  const variantsFetch = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
    .then((response) => {
      if(response.ok) {
        return response
      } else {
        throw new Error('An error has occurred while fetching API. Please try again.')
      }
    })
    .catch(err => {
    return new Response('A network error has occurred. Please try again.', {
      headers: { 'content-type': 'text/plain'},
    })
  })
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
    .then((response) => {
      if(response.ok) {
        return response
      } else {
        throw new Error('An error has occurred while fetching the variant. Please try again.')
      }
    })
    .catch(err => {
      return new Response('A network error has occurred. Please try again.', {
        headers: { 'content-type': 'text/plain' },
      })
    })

  // Create a response to return using variant fetched
  const pageResponse = new Response(response.body, response)

  // Set cookies with URL
  pageResponse.headers.set("Set-Cookie", `URL=${URL}; expires=Thu, 18 Dec 2020 12:00:00 UTC`)

  // Creating a new instance of HTMLRewriter
  const rewriter = new HTMLRewriter()                   // Rewriter for without cookies
    .on('title', new InnerElementRewriter(`Tin's Cloudflare Wrangler Serviceworker`))
    .on('h1#title', new InnerElementRewriter(`Welcome! I'm Tin.`))
    .on('p#description', new InnerElementRewriter(`This was actually a fun take home to do. I genuinely enjoyed doing it!`))
    .on('a#url', new AttributeRewriter('href', 'normal'))

  // Using HTMLRewriter API to change elements in page
  return rewriter.transform(pageResponse)
}
