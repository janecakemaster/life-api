const winston = require('winston')
const PouchDB = require('pouchdb')
const logs = new PouchDB('http://localhost:5984/logs')

function handleLogRequest (request, reply) {
  const logName = request.params.name

  if (!logName) {
    listLogs('name')
      .then(reply)
      .catch(winston.error)
  }
}

function listLogs (field) {
  return logs.allDocs()
    .then((result) => {
      return Promise.all(result.rows.map((row) =>
        logs.get(row.id)
      ))
    })
    .then((result) => result.map((item) => item[field]))
    .catch(winston.error)
}

module.exports = handleLogRequest
