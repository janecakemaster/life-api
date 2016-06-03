const winston = require('winston')
const PouchDB = require('pouchdb')
const pouchCollate = require('pouchdb-collate')
const moment = require('moment')

const constants = require('../constants')

const db = require('config').get('db')
const _db = new PouchDB(`${db}inputs`)

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
  if (query.start && query.end) {
    return filterByRange(query.start, query.end)
  }
  if (query.type) {
    return filterByField('type', query.type)
  }
  if (query.date) {
    return filterByField('date', query.date)
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
  // @todo multiple filters
  return _db.query(`inputs/by_${field}`)
    .then(({rows}) =>
      Promise.all(rows.filter((row) => row.key === val)))
    .then((result) =>
      Promise.all(result.map(({id}) => _db.get(id))))
}

function filterByRange (start, end) {
  const startMoment = moment(start, constants.formatDate)
  const endMoment = moment(end, constants.formatDate) || moment().format(constants.formatDate)
  const validStartDate = startMoment.isValid()
  const validRange = endMoment.isAfter(startMoment)
  const opts = {}

  if (validStartDate) {
    opts.startkey = pouchCollate.toIndexableString([startMoment.format(constants.formatDate)]).replace(/\u0000/g, '')
  }
  if (validRange) {
    opts.endkey = pouchCollate.toIndexableString([endMoment.format(constants.formatDate)]).replace(/\u0000/g, '')
  }

  return _db.allDocs(opts)
    .then(({rows}) =>
      Promise.all(rows.map(({id}) => _db.get(id))))
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
  if (!constants.supportedTypes.includes(query.type)) {
    delete query.type
  }

  return Object.keys(query).length === 0 ? false : query
}

module.exports = getInputs
