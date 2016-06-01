/* global PouchDB qwest */
const $logs = document.querySelector('.logs')
const $inputs = document.querySelector('.inputs')
const $clearButton = document.querySelector('[data-action="clear"]')

const _logs = new PouchDB('http://localhost:5984/logs')
const _inputs = new PouchDB('http://localhost:5984/inputs')

const changeOpts = {
  since: 'now',
  live: true
}
const allDocsOpts = {
  include_docs: true,
  descending: true
}

loadAndDraw()

_inputs.changes(changeOpts)
  .on('change', loadAndDraw)

_logs.changes(changeOpts)
  .on('change', loadAndDraw)

$clearButton.addEventListener('click', () => removeAll([_inputs]))
$logs.addEventListener('click', handleLogsClick)
$inputs.addEventListener('click', handleInputsClick)

function loadAndDraw () {
  _inputs.allDocs(allDocsOpts)
    .then(drawInputs)

  _logs.allDocs(allDocsOpts)
    .then(drawLogs)
}

function drawLogs ({rows}) {
  if (rows.length === 0) {
    $logs.innerHTML = ''
    return
  }

  $logs.innerHTML = rows
    .map(({doc}) =>
      `<div class="log"><button data-log-type="${doc.type}" id="${doc._id}">${doc.name}</button></div>`
    ).join('')
}

function drawInputs ({rows}) {
  if (rows.length === 0) {
    $inputs.innerHTML = ''
    return
  }

  $inputs.innerHTML = rows
    .map(({doc}) => {
      const exclude = ['_rev', '_id', 'timestamp']
      let result = `<tr data-id="${doc._id}" data-rev="${doc._rev}">`

      for (let key in doc) {
        if (!exclude.includes(key)) {
          result += `<td class="${key}">${doc[key]}</td>`
        }
      }

      result += '<td><a href="#" data-action="remove">Delete</a></td></tr>'

      return result
    }).join('')
}

function handleInputsClick (e) {
  e.preventDefault()

  const action = e.target.dataset.action
  if (!action) {
    return
  }

  const row = e.target.parentNode.parentNode
  const id = row.dataset.id
  const rev = row.dataset.rev

  switch (action) {
    case 'remove':
      _inputs.remove(id, rev)
      break
  }
}

function handleLogsClick (e) {
  switch (e.target.getAttribute('data-log-type')) {
    case 'time':
      timeInput(e.target)
      break
  }
}

function timeInput (el) {
  qwest.post('//localhost:8001/inputs/create', {
    type: el.getAttribute('data-log-type'),
    logId: el.id,
    time: new Date()
  }, {
    cache: true
  })
  .then((xhr, response) => {

  })
  .catch((err, xhr, response) => {
    console.error('error', err)
  })
}

function removeAll (dbs) {
  dbs.forEach((_db) =>
    _db.allDocs(allDocsOpts)
    .then(({rows}) =>
      Promise.all(rows.map(({doc}) =>
        _db.remove(doc))))
  )
}
