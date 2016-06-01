const winston = require('winston')
const PouchDB = require('pouchdb')
const moment = require('moment')

const logType = require('../collate/log-type')

const _logs = new PouchDB('http://localhost:5984/logs')

function createLog (request, reply) {
  const {name, type} = request.payload
  const id = name.replace(/\s+/, '-').toLowerCase()
  const doc = logType({name, type, id})

  return _logs.put(doc)

  result.then((doc) => {
    reply(doc)
  }).catch((err) => {
    winston.error('input put failed', err)
    reply(err)
  })
}

function createTimeInput({logId, time}) {
  const date = moment(new Date(time))
  const doc = timeInput({logId, date})

  return _logs.put(doc)
}

module.exports = createLog
