const pouchCollate = require('pouchdb-collate')
const constants = require('../constants')

function timeInput (a, b) {
  if (b) {
    return compare(a, b)
  }

  if (typeof a === 'string') {
    return parseID(a)
  }

  return createDoc(a)
}

function createDoc ({logId, date}) {
  const doc = {
    timestamp: date.format(),
    date: date.format(constants.formatDate),
    day: date.format(constants.formatDay).toLowerCase(),
    time: date.format(constants.formatTime),
    type: 'time',
    logId
  }

  doc._id = pouchCollate.toIndexableString([doc.timestamp, doc.logId, doc.type]).replace(/\u0000/g, '\u0001')

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = timeInput
