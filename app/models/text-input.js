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

function createDoc ({logId, text, date}) {
  const doc = {
    timestamp: date.format(),
    date: date.format('YYYY-MM-DD'),
    day: date.format('ddd').toLowerCase(),
    time: date.format('HH:mm'),
    type: 'text',
    text,
    logId
  }

  doc._id = pouchCollate.toIndexableString([doc.timestamp, doc.logId, doc.type, doc.text]).replace(/\u0000/g, '\u0001')

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = textInput
