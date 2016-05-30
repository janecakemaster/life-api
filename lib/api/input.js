const winston = require('winston')
// const PouchDB = require('pouchdb')
// const moment = require('moment')

// const timeInput = require('./collate/time-input')

// const _inputs = new PouchDB('http://localhost:5984/inputs')

function createInput (request, reply) {
  winston.debug(request.payload)
  reply(request.payload)
}

module.exports = createInput
