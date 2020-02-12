'use strict'

const firebase = use('firebase')

const settings = {timestampsInSnapshots: true}

var firebaseConfig = {
    apiKey: "AIzaSyCB5PgQR6c42OddwtpRjVA8kwBtxbLQ3dg",
    authDomain: "fabelio-link.firebaseapp.com",
    databaseURL: "https://fabelio-link.firebaseio.com",
    projectId: "fabelio-link",
    storageBucket: "fabelio-link.appspot.com",
    messagingSenderId: "980258607858",
    appId: "1:980258607858:web:0bda66248ecbcdcc4cf66b"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.firestore().settings(settings)

// firebase collections
const linksCollection = firebase.firestore().collection('links')

module.exports = {
  firebase,
  linksCollection
}