const winston = require('winston')
const PouchDB = require('pouchdb')
const moment = require('moment')

const timeInput = require('./collate/time-input')
const logType = require('./collate/log-type')

const _inputs = new PouchDB('http://localhost:5984/inputs')
const _logs = new PouchDB('http://localhost:5984/logs')

function populate () {
  _logs.allDocs({include_docs: true})
    .then(({rows}) =>
      // clear logs
      Promise.all(rows.map((row) =>
        _logs.remove(row.doc))))
    .then(() =>
      _inputs.allDocs({include_docs: true}))
    .then(({rows}) =>
      // clear inputs
      Promise.all(rows.map((row) =>
        _inputs.remove(row.doc)
    )))
    .then(() => {
      // populate dummy data
      Promise.all([
        populateMorningMeds(),
        populateMoodDrop()
      ])
    })
    .catch(winston.error)
}

function populateMorningMeds ({
  startDate = moment('2016-03-01 09:30'),
  badDate = moment('2016-03-01 12:30')
} = {}) {
  const logId = 'morning-meds'
  const logName = 'Morning Meds'
  const log = logType({
    id: logId,
    name: logName,
    type: 'time'
  })
  const docs = [timeInput({
    date: badDate,
    logId,
    logName
  })]

  _logs.put(log).catch(winston.error)

  for (let i = 0; i <= 14; i++) {
    const minuteDiff = Math.floor(Math.random() * 60) + 1

    startDate.add(1, 'day').add(i % 2 === 0
      ? minuteDiff
      : minuteDiff * -1, 'minutes')

    const doc = timeInput({
      date: startDate,
      logId,
      logName
    })

    docs.push(doc)
  }

  _inputs.bulkDocs(docs)
    .then((result) =>
      Promise.all(result.map(({id}) =>
        _inputs.get(id)
    )))
    .then((result) =>
      Promise.all(result.map(({_id}) =>
        winston.debug(_id)
    )))
    .catch(winston.error)
}

function populateMoodDrop () {
  const logId = 'mood-drop'
  const logName = 'Drop in Mood'
  const log = logType({
    id: logId,
    name: logName,
    type: 'time'
  })
  const docs = [
    moment('2016-03-01 15:30'),
    moment('2016-03-03 18:30'),
    moment('2016-03-08 21:00')
  ].map((date) =>
    timeInput({
      date,
      logId,
      logName
    }))

  _logs.put(log).catch(winston.error)

  _inputs.bulkDocs(docs)
    .then((result) =>
      Promise.all(result.map((row) =>
        _inputs.get(row.id)
    )))
    .then((result) =>
      Promise.all(result.map((doc) =>
        winston.debug(doc._id)
    )))
    .catch(winston.error)
}

module.exports = populate
