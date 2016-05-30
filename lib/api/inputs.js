const winston = require('winston')
const PouchDB = require('pouchdb')
const db = new PouchDB('http://localhost:5984/inputs')

function listInputs (request, reply) {
  db.allDocs({include_docs: true})
    .then((result) => {
      winston.info(result)
      reply(result)
    })
}

module.exports = listInputs
