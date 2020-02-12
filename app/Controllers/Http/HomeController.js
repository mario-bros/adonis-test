const axios = use('axios')
const cheerio = use('cheerio')
const Logger = use('Logger')
const url = use('url')
const {firebase, linksCollection} = use('App/Helpers')


class HomeController {
  async index ({ view }) {
    return view.render('link-submit-form')
  }

  async postSimpan ({request, response, view, session}) {
    // const todo = new Todo();
    let inputLink = request.input('link')
    let validURL = 'fabelio.com'
    let productPrices = []

    let hostName = url.parse(inputLink).hostname
    // let firebaseTS = firebase.firestore.FieldValue.serverTimestamp()
    let firebaseTS = new Date().getTime()

    try {
      if ( hostName == validURL ) {
        // Must be a valid domain name
        await axios(inputLink)
          .then(resp => {
            // console.log(resp);
            
            const $ = cheerio.load(resp.data)
            let productName = $('span[data-ui-id="page-title-wrapper"]').text()
            let price = $('span[id^="product-price-"]').text()
            price = price.trim()
            let currentPriceTime = firebaseTS
            productPrices.push({ price: price, currentPrice: currentPriceTime })
  
            linksCollection.add({
              link: inputLink,
              productName: productName,
              productPrices: productPrices,
              created_time: firebaseTS
            })
  
            session.flash({ success: 'URL already saved to database' })
            // response.redirect('back')
            response.redirect('/list')
          })
          .catch(err => {
            console.log(err);

            const $ = cheerio.load(err.response.data)
            let notFoundText = $('#maincontent .notfound-content').text()
            // let notFoundText = 'Hello'
  
            session.flash({ error: notFoundText })
            response.redirect('back')
          });
  
      } else {
        session.flash({ error: 'You entered an invalid domain' })
        response.redirect('back')
      }
    } catch (e) {
      console.log("ada error apa pas submit ? => ", e);
    }
    
  }

  async listLink ({ view }) {
    let linksArray = []

    await linksCollection.get().then( docs => {
      console.log("docs length => ", docs.size)

      if (docs) {
        docs.forEach(doc => {
          let fbData = doc.data()
          fbData.id = doc.id
          linksArray.push(fbData)
        })        
      }

    })

    console.log("usersArray => ", linksArray)
    return view.render('list-link', {links: linksArray})
  }
}

module.exports = HomeController
