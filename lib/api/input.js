const winston = require('winston')
const PouchDB = require('pouchdb')
const moment = require('moment')

const timeInput = require('../collate/time-input')

const _inputs = new PouchDB('http://localhost:5984/inputs')

function createInput (request, reply) {
  const {logId, type, time} = request.payload
  let result

  switch (type) {
    case 'time':
      result = createTimeInput({logId, time})
  }

  result.then((doc) => {
    reply(doc)
  }).catch((err) => {
    winston.error('input put failed', err)
    reply(err)
  })
}

function createTimeInput ({logId, time}) {
  const date = moment(new Date(time))
  const doc = timeInput({logId, date})

  return _inputs.put(doc)
}

module.exports = createInput
