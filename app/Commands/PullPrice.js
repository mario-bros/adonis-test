'use strict'

const { Command } = require('@adonisjs/ace')
const cron = require("node-cron")
const {firebase, linksCollection} = use('App/Helpers')

class PullPrice extends Command {
  static get signature () {
    return 'quote'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    this.info('Dummy implementation for quote command')
    let self = this

    cron.schedule("* * * * *", () => {
      self.info('Running Cron Job every minutes')
      // console.log("---------------------");
      console.log("Running Cron Job");
      self.pull()
      // fs.unlink("./error.log", err => {
      //   if (err) throw err;
      //   console.log("Error file succesfully deleted");
      // });
    });
  }

  async pull () {
    await linksCollection.get().then( docs => {
      console.log("docs length => ", docs.size)

      if (docs) {
        docs.forEach(foundDocument => {
          let fbData = foundDocument.data()
          fbData.id = foundDocument.id
          let linkDocRef = linksCollection.doc(foundDocument.id)

          // get latest price 
          let latestPriceTimestamp = fbData.productPrices[fbData.productPrices.length-1].timestamp

          let nowTimestampInSecond = Math.floor(Date.now() / 1000)
          let latestPriceTimestampInSecond = Math.floor(latestPriceTimestamp / 1000)
          let currentTimestamp = new Date().getTime()

          console.log("nowTimestampInSecond => ", nowTimestampInSecond);
          console.log("latestPriceTimestampInSecond => ", latestPriceTimestampInSecond);

          if ( (nowTimestampInSecond - latestPriceTimestampInSecond) >= 3600 ) {

            firebase.firestore().runTransaction(transaction => {
              // This code may get re-run multiple times if there are conflicts.
              return transaction.get(linkDocRef).then(doc => {
                  if (!doc.data().productPrices) {
                      transaction.set({
                        productPrices: [ { timestamp: currentTimestamp, currentPrice: 'Rp 2.999' } ]
                      });
                  } else {
                      // const productPrices = fbData.productPrices
                      // productPrices.push({ currentPrice: 0, price: 'Rp 2.999' })
                      // transaction.update(fbData, { productPrices: productPrices })

                      const productPrices = foundDocument.data().productPrices
                      productPrices.push({ timestamp: currentTimestamp, currentPrice: 'Rp 2.999' })
                      transaction.update(linkDocRef, { productPrices: productPrices })
                  }
              });
            }).then(function () {
                console.log("Transaction successfully committed!");
            }).catch(function (error) {
                console.log("Transaction failed: ", error);
            });

            // doc.update({
            //   productPrices: firebase.firestore.FieldValue.arrayUnion({ currentPrice: 0, price: 'Rp 2.999' })
            // })
            console.log("diff more than 1 hour");
          }
          // fbData.productPrices.forEach( priceObj => {
          //   priceObj.current
          // })
          // linksArray.push(fbData)
        })
      }

    })
  }
}

module.exports = PullPrice
