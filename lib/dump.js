const winston = require('winston')
const PouchDB = require('pouchdb')
const db = new PouchDB('http://localhost:5984/kittens')

module.exports = function getDBInfo (request, reply) {
  db.info()
    .then((data) => {
      winston.info(data)
      reply(data)
    })
}
