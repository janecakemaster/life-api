const winston = require('winston')
const PouchDB = require('pouchdb')
const _logs = new PouchDB('http://localhost:5984/logs')
const _inputs = new PouchDB('http://localhost:5984/inputs')

function getLogs (request, reply) {
  const logName = request.params.name

  if (logName) {
    getLogInputs(logName)
      .then(reply)
      .catch(winston.error)
  } else {
    listLogs()
      .then(reply)
      .catch(winston.error)
  }
}

function getLogInputs (logName) {
  return _inputs.allDocs()
    .then(({rows}) =>
      Promise.all(
        rows
          .filter(({id}) => id.includes(logName))
          .map(({id}) => _inputs.get(id))))
    .then((result) =>
      result.map(({doc}) => {
        delete doc._rev
        delete doc._id
        delete doc.type
        delete doc.logId

        return doc
      })
      .sort(sortByTime)
    )
}

function listLogs () {
  return _logs.allDocs()
    .then(({rows}) =>
      Promise.all(
        rows
          .map(({id}) => _logs.get(id))))
    .then((result) =>
      result.map((item) => {
        item.id = item._id

        delete item._rev
        delete item._id

        return item
      }))
}

function sortByTime (a, b) {
  return a.timestamp < b.timestamp ? -1 : 1
}

module.exports = getLogs
