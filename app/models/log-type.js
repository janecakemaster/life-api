function logType (a, b) {
  return createDoc(a)
}

function createDoc ({id, name, type}) {
  const doc = {
    name,
    type
  }

  doc._id = `${type}-${id || name.replace(/\s+/, '-')}`.toLowerCase()

  return doc
}

module.exports = logType
