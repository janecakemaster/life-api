/* global PouchDB */
const appUtils = window.appUtils
const $logs = document.querySelector('.logs')
const $inputs = document.querySelector('.inputs')
const $clearButton = document.querySelector('[data-action="clear"]')

const _logs = new PouchDB('http://localhost:5984/logs')
const _inputs = new PouchDB('http://localhost:5984/inputs')

const changeOptions = {
  since: 'now',
  live: true,
  include_docs: true
}

loadAndDraw()

_inputs.changes(changeOptions)
  .on('change', loadAndDraw)

_logs.changes(changeOptions)
  .on('change', loadAndDraw)

$clearButton.addEventListener('click', () => removeAll([_inputs]))
$logs.addEventListener('click', handleLogsClick)
$inputs.addEventListener('click', handleInputsClick)

function loadAndDraw () {
  _inputs.allDocs({include_docs: true})
    .then(drawInputs)
    // .catch(handleError)

  _logs.allDocs({include_docs: true})
    .then(drawLogs)
    // .catch(handleError)
}

function drawLogs ({rows}) {
  if (rows.length === 0) {
    document.body.dataset.logState = 'empty'
    return
  }

  document.body.dataset.logState = 'not-empty'
  $logs.innerHTML = rows
    .sort(orderByCreatedAt)
    .map(({doc}) =>
      `<div class="log"><button data-log-type="${doc.type}" id="${doc._id}">${doc.name}</button></div>`
    ).join('')
}

function drawInputs ({rows}) {
  if (rows.length === 0) {
    document.body.dataset.inputState = 'empty'
    return
  }

  document.body.dataset.inputState = 'not-empty'
  $inputs.innerHTML = rows
    .sort(orderByCreatedAt)
    .map(({doc}) => {
      const exclude = ['_rev', '_id', 'timestamp', 'logId']
      let result = `<tr data-id="${doc._id}" data-rev="${doc._rev}" data-log="${doc.log}">`

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
  appUtils.post({
    action: 'POST',
    url: '//localhost:8001/inputs/create',
    data: {
      type: el.getAttribute('data-log-type'),
      logId: el.getAttribute('data-log-id'),
      logName: el.textContent,
      name: el.textContent,
      time: new Date()
    }
  })
}

// function logScale (elem) {
//   const inputID = document.querySelector('[data-log-type="scale"]').id
//   const type = `log-${elem.getAttribute('data-type')}`
//   const name = document.querySelector(`[for="${inputID}"]`).textContent

//   hoodie.store.updateOrAdd({
//     id: `${type}${getToday()}`,
//     type,
//     inputType: 'input-scale',
//     name: name,
//     level: elem.value,
//   })
// }

// function logCompleted (elem) {
//   hoodie.store.updateOrAdd({
//     id: `${elem.getAttribute('data-type')}${getToday()}`,
//     type: `log-${elem.getAttribute('data-type')}`,
//     inputType: 'input-completed',
//     name: elem.textContent,
//     completed: true,
//   })
// }

function orderByCreatedAt (item1, item2) {
  return item1.createdAt < item2.createdAt ? 1 : -1
}

// function getToday () {
//   return new Date().toJSON().slice(0, 10)
// }

// function handleError (err) {
//   if (err.status !== 404) {
//     console.info(err)
//   }
// }

function removeAll (dbs) {
  dbs.forEach((_db) =>
    _db.allDocs({include_docs: true})
    .then(({rows}) =>
      Promise.all(rows.map(({doc}) =>
        _db.remove(doc))))
  )
}
