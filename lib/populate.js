const winston = require('winston')
const PouchDB = require('pouchdb')
const moment = require('moment')

const logType = require('./collate/log-type')
const timeInput = require('./collate/time-input')
const textInput = require('./collate/text-input')
// const scaleInput = require('./collate/scale-input')

const _inputs = new PouchDB('http://localhost:5984/inputs')
const _logs = new PouchDB('http://localhost:5984/logs')

// const allEmoji = ['😪', '😭', '😴', '😡', '😊', '😊', '🙃', '😑', '😡', '😔', '😥', '😭', '😷', '🤒', '🤕', '😴', '💩', '💀']

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
        populateMoodDrop(),
        populateSleepTimes(),
        populateEmoji()
      ])
    })
    .catch(winston.error)
}

function populateMorningMeds ({
  startTime = moment('2016-03-01 09:30'),
  badTime = moment('2016-03-01 12:30')
} = {}) {
  const id = 'morning-meds'
  const name = 'Morning Meds'
  const type = 'time'
  const logId = `${type}-${id}`
  const badLog = logType({id, name, type})
  const docs = [timeInput({
    date: badTime,
    logId
  })]

  _logs.put(badLog).catch(winston.error)

  for (let i = 0; i <= 14; i++) {
    const minuteDiff = Math.floor(Math.random() * 60) + 1

    startTime.add(1, 'day').add(i % 2 === 0
      ? minuteDiff
      : minuteDiff * -1, 'minutes')

    const doc = timeInput({
      date: startTime,
      logId
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
  const id = 'mood-drop'
  const name = 'Drop in Mood'
  const type = 'time'
  const logId = `${type}-${id}`
  const log = logType({id, name, type})
  const docs = [
    moment('2016-03-01 15:30'),
    moment('2016-03-03 18:30'),
    moment('2016-03-08 21:00')
  ].map((date) =>
    timeInput({
      date,
      logId
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

function populateSleepTimes () {
  const sleepTimes = [
    '2016-03-02 00:30',
    '2016-03-03 01:30',
    '2016-03-04 01:30',
    '2016-03-05 01:00',
    '2016-03-06 03:00',
    '2016-03-07 04:30',
    '2016-03-07 21:00',
    '2016-03-08 23:45'
  ]
  const id = 'bedtime'
  const name = 'Bedtime'
  const type = 'time'
  const logId = `${type}-${id}`
  const log = logType({id, name, type})
  const docs = []

  for (let i = 0; i <= sleepTimes.length; i++) {
    const date = moment(sleepTimes[i])

    docs.push(timeInput({
      logId,
      date
    }))
  }

  _logs.put(log).catch(winston.error)

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

function populateEmoji () {
  const emojis = [
    {
      time: '2016-03-02 08:30',
      emoji: '😴'
    }, {
      time: '2016-03-03 09:05',
      emoji: '😴'
    }, {
      time: '2016-03-04 08:30',
      emoji: '😴'
    }, {
      time: '2016-03-05 08:30',
      emoji: '😴'
    }, {
      time: '2016-03-06 12:30',
      emoji: '😪'
    }, {
      time: '2016-03-07 13:30',
      emoji: '😑'
    }, {
      time: '2016-03-08 08:30',
      emoji: '😭'
    }, {
      time: '2016-03-09 01:30',
      emoji: '😷'
    }
  ]
  const id = 'emoji'
  const name = 'Emoji feelz'
  const type = 'text'
  const logId = `${type}-${id}`

  const log = logType({id, type, name})
  const docs = []

  for (let i = 0; i < emojis.length; i++) {
    docs.push(textInput({
      logId,
      value: emojis[i].emoji,
      date: moment(emojis[i].time)
    }))
  }

  _logs.put(log).catch(winston.error)

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

module.exports = populate
