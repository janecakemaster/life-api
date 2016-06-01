/* globals PouchDB */

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
  include_docs: true,
  descending: true
}

loadAndDraw()

_logs.changes(changeOpts)
  .on('change', loadAndDraw)


$clearButton.addEventListener('click', () => removeAll([_logs]))

function loadAndDraw () {
  _logs.allDocs(allDocsOpts)
    .then(drawLogs)
}

function drawLogs ({rows}) {
  if (rows.length === 0) {
    return
  }

  $list.innerHTML = rows
    .map(({doc}) => {
      const exclude = ['createdAt', 'updatedAt', '_rev']
      const date = new Date(doc.updatedAt)
      let result = `<tr data-id="${doc.id}">
      <td class="updatedAt">${date}</td>`

      for (let key in doc) {
        if (!exclude.includes(key)) {
          result += `<td class="${key}">${doc[key]}</td>`
        }
      }

      result += '<td><a href="#" data-action="remove">Delete</a></td></tr>'

      return result
    }).join('')
}



// loadAndRenderItems()
// hoodie.store.on('change', loadAndRenderItems)
// $list.addEventListener('click', handleListClick)
// $form.addEventListener('submit', handleForm)

// function loadAndRenderItems () {
//   hoodie.store.findAll((item) => item.type && item.type.startsWith('input-'))
//     .then(render)
//     .catch(handleError)
// }

// function render (items) {
//   if (items.length === 0) {
//     document.body.dataset.storeState = 'empty'
//     return
//   }

//   document.body.dataset.storeState = 'not-empty'
//   $list.innerHTML = items
//     .sort(orderByName)
//     .map((item) => {
//       const exclude = ['createdAt', 'updatedAt', '_rev']
//       const date = new Date(item.updatedAt)
//       let result = `<tr data-id="${item.id}">
//       <td class="updatedAt">${date}</td>`

//       for (let key in item) {
//         if (!exclude.includes(key)) {
//           result += `<td class="${key}">${item[key]}</td>`
//         }
//       }

//       result += '<td><a href="#" data-action="remove">Delete</a></td></tr>'

//       return result
//     }).join('')
// }

// function handleListClick (e) {
//   e.preventDefault()

//   const action = e.target.dataset.action
//   if (!action) {
//     return
//   }

//   const row = e.target.parentNode.parentNode
//   const id = row.dataset.id

//   switch (action) {
//     case 'remove':
//       hoodie.store.remove({id})
//       break
//   }
// }

// function handleForm (e) {
//   e.preventDefault()

//   const displayName = e.target.querySelector('#name').value
//   const name = displayName.replace(/[^A-Z0-9]/ig, '').toLowerCase()
//   const id = `input-${name}`
//   const type = `input-${e.target.querySelector(':checked').value}`
//   const noteEnabled = e.target.querySelector('#note-enabled').checked

//   function handleError (err) {
//     if (err.status !== 404) {
//       console.info(err)
//     }
//   }

//   hoodie.store.updateOrAdd({
//     id,
//     type,
//     name,
//     displayName,
//     noteEnabled,
//   }).then((obj) => {
//     $form.reset()
//   }).catch(handleError)
// }


function removeAll (dbs) {
  dbs.forEach((_db) =>
    _db.allDocs(allDocsOpts)
    .then(({rows}) =>
      Promise.all(rows.map(({doc}) =>
        _db.remove(doc))))
  )
}
