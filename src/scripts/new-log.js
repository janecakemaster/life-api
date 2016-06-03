/* globals PouchDB qwest */

const $form = document.querySelector('form')
const $clearButton = document.querySelector('[data-action="clear"]')
const $list = document.querySelector('.list')

const _logs = new PouchDB('http://localhost:5984/logs')

_logs.changes(changeOpts)
  .on('change', loadAndDraw)

const changeOpts = {
  since: 'now',
  live: true
}
const allDocsOpts = {
  include_docs: true
}

loadAndDraw()

_logs.changes(changeOpts)
  .on('change', loadAndDraw)

$form.addEventListener('submit', handleForm)
$list.addEventListener('click', handleListClick)
$clearButton.addEventListener('click', () => removeAll([_logs]))

function loadAndDraw () {
  _logs.allDocs(allDocsOpts)
    .then(drawLogs)
}

function drawLogs ({rows}) {
  if (rows.length === 0) {
    $list.innerHTML = ''
    return
  }

  $list.innerHTML = rows
    .map(({doc}) =>
      `<tr data-id="${doc.id}" data-rev="${doc._rev}"><td>${doc.name}</td><td>${doc.type}</td><td><a href="#" data-action="remove">Delete</a></td></tr>`
    ).join('')
}

function handleListClick (e) {
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
      _logs.remove(id, rev)
      break
  }
}

function handleForm (e) {
  e.preventDefault()

  qwest.post('//localhost:8001/logs', {
    type: e.target.logType.value,
    name: e.target.name.value
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
