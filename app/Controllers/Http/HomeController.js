const axios = use('axios')
const cheerio = use('cheerio')
const Logger = use('Logger')
const url = require('url');


class HomeController {
  async index ({ view }) {

    /*await axios('https://fabelio.com/ip/kasur-fabelio-plush.html')
      .then(response => {
        console.log(response.data);
      })
      .catch(err => {
        const $ = cheerio.load(err.response.data)
        let notFoundText = $('#maincontent .notfound-content').text()
        console.log(notFoundText);
        // console.log($.html());


        // console.log(err.response.data);
        // console.log(err.message);
        // console.log(err.toJSON());
      });*/

    return view.render('link-submit-form')
  }

  async postSimpan ({request, response, view, session}) {
    // const todo = new Todo();
    let inputLink = request.input('link')
    let validURL = 'fabelio.com'

    let hostName = url.parse(inputLink).hostname

    if ( hostName == validURL ) {
      // Must be a valid domain name
      await axios(inputLink)
        .then(response => {
          const $ = cheerio.load(response.data)
          let notFoundText = $('#maincontent .notfound-content').text()
          let productName = $('div[data-ui-id="page-title-wrapper"]').text()

          session.flash({ success: 'URL already saved to database' })
          response.redirect('back')
        })
        .catch(err => {
          const $ = cheerio.load(err.response.data)
          let notFoundText = $('#maincontent .notfound-content').text()
          console.log(notFoundText);
        });

    } else {
      session.flash({ error: 'You entered an invalid domain' })
      response.redirect('back')
    }


    // Logger.info('request url is %s', request.url())

    // todo.title = request.input('title');
    // todo.description = request.input('description');
    // await todo.save();

    session.flash({ notification: 'Successfully create!' });
    return view.render('link-submit-form', { link: inputLink })
    // return response.route('welcomePage')
  }
}

module.exports = HomeController
