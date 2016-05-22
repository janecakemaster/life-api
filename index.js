const PouchDB = require('pouchdb')

const db = new PouchDB('http://localhost:5984/kittens')

db.info().then(function (info) {
  console.log(info)
})
