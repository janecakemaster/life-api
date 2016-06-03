const pouchCollate = require('pouchdb-collate')

function textInput (a, b) {
  if (b) {
    return compare(a, b)
  }

  if (typeof a === 'string') {
    return parseID(a)
  }

  return createDoc(a)
}

function createDoc ({logId, value, date}) {
  const doc = {
    timestamp: date.format(),
    date: date.format('YYYY-MM-DD'),
    day: date.format('ddd').toLowerCase(),
    time: date.format('HH:mm'),
    type: 'text',
    value,
    logId
  }

  doc._id = pouchCollate.toIndexableString([doc.logId, doc.type, doc.timestamp, doc.value]).replace(/\u0000/g, '\u0001')

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = textInput
