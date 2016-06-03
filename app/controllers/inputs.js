const winston = require('winston')
const PouchDB = require('pouchdb')

const _db = new PouchDB('http://localhost:5984/inputs')

const supportedTypes = ['time', 'text']


function getInputs (request, reply) {
  const query = interpretQuery(request.query)

  if (query) {
    listInputsByQuery(query)
      .then(sanitize)
      .then(reply)
      .catch(winston.error)
  } else {
    listInputs()
      .then(sanitize)
      .then(reply)
      .catch(winston.error)
  }
}

function listInputsByQuery (query) {
  if (query.type) {
    return filterByField('type', query.type)
  }
  if (query.day) {
    return filterByField('day', query.day)
  }
  if (query.text) {
    return filterByField('text', query.text)
  }
}

function listInputs () {
  return _db.allDocs()
    .then(({rows}) => Promise.all(
      rows.map(({id}) => _db.get(id))))
}

function filterByField (field, val) {
  return _db.query(`inputs/by_${field}`)
    .then(({rows}) =>
      Promise.all(rows.filter((row) => row.key === val)))
    .then((result) =>
      Promise.all(result.map(({id}) => _db.get(id))))
}

function sanitize (result) {
  return Promise.all(
    result.map((item) => {
      item.id = item._id

      delete item._rev
      delete item._id

      return item
    }))
}

function interpretQuery (query) {
  if (!supportedTypes.includes(query.type)) {
    delete query.type
  }

  return Object.keys(query).length === 0 ? false : query
}

module.exports = getInputs
