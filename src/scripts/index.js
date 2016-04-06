/* globals hoodie */

const $log = document.querySelector('.log')
const $inputs = document.querySelector('.inputs')
const $clearButton = document.querySelector('[data-action="clear"]')

/*
 * With hoodie we're storing our data locally and it will stick around next time you reload.
 * This means each time the page loads we need to find any previous notes that we have stored.
 */
function loadAndRenderItems () {
  hoodie.store.findAll((item) => item.type.startsWith('input-'))
    .then(renderInputs)

  hoodie.store.findAll((item) => item.type.startsWith('log-')).then(renderLog)
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
$log.addEventListener('click', (e) => {
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

$inputs.addEventListener('click', (e) => {
  switch (e.target.getAttribute('data-input-type')) {
    case 'time':
      logTime(e.target)
      break
    case 'scale':
      logScale(e.target)
      break
    case 'completed':
      logCompleted(e.target)
      break
  }
})

function logTime (elem) {
  hoodie.store.add({
    type: `log-${elem.getAttribute('data-type')}`,
    inputType: 'input-time',
    name: elem.textContent,
    time: new Date(),
  })
}

function logScale (elem) {
  const inputID = document.querySelector('[data-input-type="scale"]').id
  const type = `log-${elem.getAttribute('data-type')}`
  const name = document.querySelector(`[for="${inputID}"]`).textContent

  hoodie.store.updateOrAdd({
    id: `${type}${new Date().toJSON().slice(0, 10)}`,
    type,
    inputType: 'input-scale',
    name: name,
    level: elem.value,
  })
}

function logCompleted (elem) {
  hoodie.store.updateOrAdd({
    id: `${elem.getAttribute('data-type')}`,
    type: `log-${elem.getAttribute('data-type')}`,
    inputType: 'input-completed',
    name: elem.textContent,
    completed: true,
  })
}

function renderLog (items) {
  if (items.length === 0) {
    document.body.dataset.logState = 'empty'
    return
  }

  document.body.dataset.logState = 'not-empty'
  $log.innerHTML = items
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

function renderInputs (items) {
  if (items.length === 0) {
    document.body.dataset.inputsState = 'empty'
    return
  }

  document.body.dataset.inputsState = 'not-empty'
  $inputs.innerHTML = items
    .sort(orderByCreatedAt)
    .map((item) => {
      let result = `<div class="input ${item.type}">`

      switch (item.type.replace('input-', '')) {
        case 'completed':
          result += `<button data-type="${item.name}" data-input-type="completed">${item.displayName}</button>`
          break
        case 'time':
          result += `<button data-type="${item.name}" data-input-type="time">${item.displayName}</button>`
          break
        case 'scale':
          result += `
          <label for="${item.name}">${item.displayName}</label>
          <input data-type="${item.name}" id="${item.name}" data-input-type="scale" type="range" min="0" max="10">
          `
          break
      }

      result += '</div>'

      return result
    }).join('')
}

function orderByCreatedAt (item1, item2) {
  return item1.createdAt < item2.createdAt ? 1 : -1
}
