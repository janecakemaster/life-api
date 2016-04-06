/* global hoodie */

const $itemsList = document.querySelector('.items .list')
const $clearButton = document.querySelector('[data-action="clear"]')

/*
 * With hoodie we're storing our data locally and it will stick around next time you reload.
 * This means each time the page loads we need to find any previous notes that we have stored.
 */
function loadAndRenderItems () {
  hoodie.store.findAll().then(render)
}

/* render items initially on page load */
loadAndRenderItems()

$clearButton.addEventListener('click', () => {
  hoodie.store.removeAll()
})

/**
 * Anytime there is a data change we reload and render the list of items
 */
hoodie.store.on('change', loadAndRenderItems)

/**
 * As items are dynamically added an removed, we cannot add event listeners
 * to the buttons. Instead, we register a click event on the items table and
 * then check if one of the buttons was clicked.
 * See: https://davidwalsh.name/event-delegate
 */
$itemsList.addEventListener('click', (e) => {
  e.preventDefault()

  const action = e.target.dataset.action
  if (!action) {
    return
  }

  const row = e.target.parentNode.parentNode
  const id = row.dataset.id
  let amount = row.firstChild.textContent
  let note = row.firstChild.nextSibling.textContent

  switch (action) {
    case 'cancel':
      loadAndRenderItems()
      break
    case 'remove':
      hoodie.store.remove({
        id: id
      })
      break
    case 'update':
      amount = row.querySelector('input[name=amount]').value
      note = row.querySelector('input[name=note]').value
      hoodie.store.update(id, {
        amount: amount,
        note: note
      })
  }
})

;[].forEach.call(document.querySelectorAll('[data-log-type]'), (el) => {
  const event = el.nodeName === 'BUTTON' ? 'click' : 'input'

  el.addEventListener(event, (e) => {
    switch (e.target.getAttribute('data-log-type')) {
      case 'time':
        logTime(e.target)
        break
      case 'scale':
        logScale(e.target)
        break
      case 'completed':
        logCompleted(e.target)
        break
      default:
        console.log(e.target.attributes)
    }
  })
})

function logTime (elem) {
  hoodie.store.add({
    type: elem.getAttribute('data-type'),
    name: elem.textContent,
    time: new Date(),
    logType: 'time'
  })
}

function logScale (elem) {
  const id = document.querySelector('[data-log-type="scale"]').id
  const name = document.querySelector(`[for="${id}"]`).textContent

  hoodie.store.updateOrAdd({
    type: elem.getAttribute('data-type'),
    id: `${elem.getAttribute('data-type')}${new Date().toJSON().slice(0, 10)}`,
    name: name,
    level: elem.value,
    logType: 'scale'
  })
}

function logCompleted (elem) {
  hoodie.store.updateOrAdd({
    type: elem.getAttribute('data-type'),
    id: `${elem.getAttribute('data-type')}`,
    name: elem.textContent,
    completed: true,
    logType: 'completed'
  })
}

function render (items) {
  if (items.length === 0) {
    document.body.dataset.storeState = 'empty'
    return
  }

  document.body.dataset.storeState = 'not-empty'
  $itemsList.innerHTML = items
    .sort(orderByCreatedAt)
    .map((item) => {
      const exclude = ['id', 'createdAt', 'updatedAt', '_rev', 'type']
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

function orderByCreatedAt (item1, item2) {
  return item1.createdAt < item2.createdAt ? 1 : -1
}
