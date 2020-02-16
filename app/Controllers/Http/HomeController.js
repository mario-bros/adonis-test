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
          .then( async resp => {
            // console.log(resp);
            
            const $ = cheerio.load(resp.data)
            let productName = $('span[data-ui-id="page-title-wrapper"]').text()
            let price = $('span[id^="product-price-"]').text()
            price = price.trim()
            let currentPriceTime = firebaseTS
            productPrices.push({ currentPrice: price, timestamp: currentPriceTime })
  
            linksCollection.add({
              link: inputLink,
              productName: productName,
              productPrices: productPrices,
              created_time: firebaseTS
            })

            let createdData = linksCollection.where('created_time', '==', firebaseTS)
            let lastDocId = ''
            await createdData.get().then( querySnapshot => {
              querySnapshot.forEach( doc => {
                lastDocId = doc.id
                // console.log( doc.id, ' => ', doc.data());
              })
            })
  
            session.flash({ success: 'URL already saved to database' })
            // response.redirect('back')
            // response.redirect('/list')
            response.redirect('/link-detail/' + lastDocId)
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

  async linkDetail ({ params, view }) {
    const docID = params.docID
    let linkRef = linksCollection.doc(docID);
    let detailLink = {}

    await linkRef.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          detailLink = doc.data()
          console.log('Document data:', doc.data());
        }
      })
      .catch(err => {
        console.log('Error getting document', err);
      })

    return view.render('detail-link', {detailLink: detailLink})
  }
}

module.exports = HomeController
