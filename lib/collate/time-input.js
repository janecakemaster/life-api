const pouchCollate = require('pouchdb-collate')

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
    date: date.format('YYYY-MM-DD'),
    day: date.format('ddd'),
    time: date.format('HH:mm'),
    type: 'time',
    logId
  }

  doc._id = pouchCollate.toIndexableString([doc.logId, doc.timestamp]).replace(/\u0000/g, '\u0001')

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = timeInput
