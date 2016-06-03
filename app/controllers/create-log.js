const winston = require('winston')
const PouchDB = require('pouchdb')

const logType = require('../models/log-type')

const _logs = new PouchDB('http://localhost:5984/logs')

function createLog (request, reply) {
  const {name, type} = request.payload
  const id = name.replace(/\s+/, '-').toLowerCase()
  const doc = logType({name, type, id})

  _logs.put(doc)
    .catch((err) => {
      winston.error('log put failed', err)
      reply(err)
    })
}

module.exports = createLog
