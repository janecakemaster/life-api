const pouchCollate = require('pouchdb-collate')

function timeInput (a, b) {
  if (b) {
    return compare(a, b)
  }

  if (typeof a === 'string') {
    return parseID(a)
  }

  return createID(a)
}

function createID ({log, date}) {
  const doc = {
    timestamp: date.format(),
    date: date.format('YYYY-MM-DD'),
    day: date.format('ddd'),
    time: date.format('HH:mm'),
    log
  }

  doc._id = pouchCollate.toIndexableString([doc.log, doc.timestamp])

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = timeInput
