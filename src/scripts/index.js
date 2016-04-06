/* global hoodie */

const $time = document.querySelector('.time')
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

$clearButton.addEventListener('click', function () {
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
$itemsList.addEventListener('click', function (event) {
  event.preventDefault()

  const action = event.target.dataset.action
  if (!action) {
    return
  }

  const row = event.target.parentNode.parentNode
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

$time.addEventListener('click', function (e) {
  switch (e.target.getAttribute('data-log-type')) {
    case 'time':
      logTime(e.target.getAttribute('data-name'))
      break
    default:
      console.log(e.target.attributes)
  }
})

function logTime (name) {
  hoodie.store.add({
    name,
    time: new Date(),
    type: 'time'
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
    .map(function (item) {
      return '<tr data-id="' + item.id + '">' +
      '<td>' + item.name + '</td>' +
      '<td>' + item.type + '</td>' +
      '<td>' + item.time + '</td>' +
      '<td><a href="#" data-action="remove">Delete</a></td>' +
      '</tr>'
    }).join('')
}

function orderByCreatedAt (item1, item2) {
  return item1.createdAt < item2.createdAt ? 1 : -1
}
