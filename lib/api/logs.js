const winston = require('winston')
const PouchDB = require('pouchdb')
const _logs = new PouchDB('http://localhost:5984/logs')
const _inputs = new PouchDB('http://localhost:5984/inputs')

function handleLogRequest (request, reply) {
  const logName = request.params.name

  if (!logName) {
    listLogs()
      .then(reply)
      .catch(winston.error)
    return
  }

  _inputs.allDocs({include_docs: true})
    .then(({rows}) => {
      const data = rows
        .filter((row) => row.id.includes(logName))
        .map(({doc}) => {
          delete doc._rev
          delete doc._id
          delete doc.type
          delete doc.logId

          return doc
        })
        .sort(sortByTime)
      reply(data)
    })
    .catch(() => {
      winston.error('no results found')
      reply([])
    })
}

function sortByTime (a, b) {
  return a.timestamp < b.timestamp ? -1 : 1
}

function listLogs (field) {
  return _logs.allDocs()
    .then(({rows}) => Promise.all(rows.map(({id}) =>
        _logs.get(id)
      )))
    .then((result) => result.map((item) => {
      item.id = item._id

      delete item._rev
      delete item._id

      return item
    }))
    .catch(winston.error)
}

module.exports = handleLogRequest
