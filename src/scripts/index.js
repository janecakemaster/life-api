/* global PouchDB */

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

loadAndRenderItems()

_inputs.changes(changeOptions)
  .on('change', loadAndRenderItems)

_logs.changes(changeOptions)
  .on('change', loadAndRenderItems)

$clearButton.addEventListener('click', () => removeAll([_inputs]))
// $logs.addEventListener('click', handleLogsClick)
$inputs.addEventListener('click', handleInputsClick)

function loadAndRenderItems () {
  _inputs.allDocs({include_docs: true})
    .then(renderInputs)
    // .catch(handleError)

  _logs.allDocs({include_docs: true})
    .then(renderLogs)
    // .catch(handleError)
}

function renderLogs ({rows}) {
  if (rows.length === 0) {
    document.body.dataset.logState = 'empty'
    return
  }

  document.body.dataset.logState = 'not-empty'
  $logs.innerHTML = rows
    .sort(orderByCreatedAt)
    .map(({doc}) =>
      `<div class="log"><button data-log-type="${doc.type}">${doc.name}</button></div>`
    ).join('')
}

function renderInputs ({rows}) {
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

// function handleLogClick (e) {
//   switch (e.target.getAttribute('data-log-type')) {
//     case 'time':
//       logTime(e.target)
//       break
//     case 'scale':
//       logScale(e.target)
//       break
//     case 'completed':
//       logCompleted(e.target)
//       break
//   }
// }

// function logTime (elem) {
//   hoodie.store.add({
//     type: `log-${elem.getAttribute('data-type')}`,
//     inputType: 'input-time',
//     name: elem.textContent,
//     time: new Date(),
//   })
// }

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

function getLogName (id) {

}
