const winston = require('winston')
const PouchDB = require('pouchdb')
const moment = require('moment')

const timeInput = require('../models/time-input')
const textInput = require('../models/text-input')

const _inputs = new PouchDB('http://localhost:5984/inputs')

function createInput (request, reply) {
  const type = request.payload.type
  let result

  switch (type) {
    case 'time':
      result = createTimeInput(request.payload)
      break
    case 'text':
      result = createTextInput(request.payload)
      break
  }

  result.then((doc) => {
    reply(doc)
  }).catch((err) => {
    winston.error('input put failed', err)
    reply(err)
  })
}

function createTimeInput ({logId, time, value}) {
  const date = moment(new Date(time))
  const doc = textInput({logId, date, value})

  return _inputs.put(doc)
}

function createTextInput ({logId, time, value}) {
  const date = moment(new Date(time))
  const doc = timeInput({logId, date})

  return _inputs.put(doc)
}

module.exports = createInput
