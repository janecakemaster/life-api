const winston = require('winston')
// const PouchDB = require('pouchdb')
// const logs = new PouchDB('http://localhost:5984/logs')
// const inputs = new PouchDB('http://localhost:5984/inputs')

function handleLogRequest (request, reply) {
  winston.debug(request.params)

  // db.allDocs({include_docs: true})
  //   .then((result) => {
  //     winston.info(result)
  //     reply(result)
  //   })
}

module.exports = handleLogRequest
