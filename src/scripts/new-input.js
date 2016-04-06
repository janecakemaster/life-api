/* globals hoodie */

const $form = document.querySelector('form')
const $clearButton = document.querySelector('[data-action="clear"]')
const $list = document.querySelector('.list')

$form.addEventListener('submit', (e) => {
  e.preventDefault()

  const displayName = e.target.querySelector('#name').value
  const name = displayName.replace(/[^A-Z0-9]/ig, '').toLowerCase()
  const id = `input-${name}`
  const type = `input-${e.target.querySelector(':checked').value}`
  const noteEnabled = e.target.querySelector('#note-enabled').checked

  function catchError (err) {
    if (err.status !== 404) {
      console.info(err)
    }
  }

  hoodie.store.updateOrAdd({
    id,
    type,
    name,
    displayName,
    noteEnabled,
  })
    .then((obj) => {
      $form.reset()
    })
    .catch(catchError)
})

function loadAndRenderItems () {
  hoodie.store.findAll((item) => item.type.startsWith('input-'))
    .then(render)
}

loadAndRenderItems()

hoodie.store.on('change', loadAndRenderItems)

$clearButton.addEventListener('click', () => {
  hoodie.store.removeAll()
})

$list.addEventListener('click', (e) => {
  e.preventDefault()

  const action = e.target.dataset.action
  if (!action) {
    return
  }

  const row = e.target.parentNode.parentNode
  const id = row.dataset.id

  switch (action) {
    case 'remove':
      hoodie.store.remove({id})
      break
  }
})

function render (items) {
  if (items.length === 0) {
    document.body.dataset.storeState = 'empty'
    return
  }

  document.body.dataset.storeState = 'not-empty'
  $list.innerHTML = items
    .sort(orderByName)
    .map((item) => {
      const exclude = ['id', 'createdAt', 'updatedAt', '_rev']
      const date = new Date(item.updatedAt)
      let result = `<tr data-id="${item.id}">
      <td class="updatedAt">${date}</td>`

      for (let key in item) {
        if (!exclude.includes(key)) {
          result += `<td class="${key}">${item[key]}</td>`
        }
      }

      result += '<td><a href="#" data-action="remove">Delete</a></td></tr>'

      return result
    }).join('')
}

function orderByName (item1, item2) {
  return item1.name < item2.name ? 1 : -1
}
