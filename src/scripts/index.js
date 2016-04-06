/* globals hoodie */

const $log = document.querySelector('.log')
const $inputs = document.querySelector('.inputs')
const $clearButton = document.querySelector('[data-action="clear"]')

loadAndRenderItems()
hoodie.store.on('change', loadAndRenderItems)
$clearButton.addEventListener('click', () => hoodie.store.removeAll())
$log.addEventListener('click', handleLogClick)
$inputs.addEventListener('click', handleInputsClick)

function handleLogClick (e) {
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
}

function handleInputsClick (e) {
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
          hoodie.store.find(`${item.name}${getToday()}`)
            .then((obj) => {
              if (obj.completed === true) {
                document.querySelector(`[data-type="${item.name}"]`).classList.add('on')
              }
            })
            .catch((err) => {
              catchError(err)
              document.querySelector(`[data-type="${item.name}"]`).classList.remove('on')
            })
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

function loadAndRenderItems () {
  hoodie.store.findAll((item) => item.type.startsWith('input-'))
    .then(renderInputs)
    .catch(catchError)

  hoodie.store.findAll((item) => item.type.startsWith('log-'))
    .then(renderLog)
    .catch(catchError)
}

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
    id: `${type}${getToday()}`,
    type,
    inputType: 'input-scale',
    name: name,
    level: elem.value,
  })
}

function logCompleted (elem) {
  hoodie.store.updateOrAdd({
    id: `${elem.getAttribute('data-type')}${getToday()}`,
    type: `log-${elem.getAttribute('data-type')}`,
    inputType: 'input-completed',
    name: elem.textContent,
    completed: true,
  })
}

function orderByCreatedAt (item1, item2) {
  return item1.createdAt < item2.createdAt ? 1 : -1
}

function getToday () {
  return new Date().toJSON().slice(0, 10)
}

function catchError (err) {
  if (err.status !== 404) {
    console.info(err)
  }
}
