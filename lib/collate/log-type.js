const pouchCollate = require('pouchdb-collate')

function logType (a, b) {
  if (b) {
    return compare(a, b)
  }

  if (typeof a === 'string') {
    return parseID(a)
  }

  return createDoc(a)
}

function createDoc ({id, name, type}) {
  const doc = {
    name,
    type
  }

  doc._id = `${type}-${id || name.replace(/\s+/, '-').toLowerCase()}`

  return doc
}

function parseID (id) {
  return pouchCollate.parseIndexableString(id)
}

function compare (a, b) {
  return pouchCollate.collate(a, b)
}

module.exports = logType
