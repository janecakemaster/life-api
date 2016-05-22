// /* globals hoodie */

// const $success = document.querySelector('.success')
// const $fail = document.querySelector('.fail')
// const $date = document.querySelector('.date')

// loadAndRenderItems()
// hoodie.store.on('change', loadAndRenderItems)

// function loadAndRenderItems () {
//   hoodie.store.findAll((item) => item.type === 'input-completed')
//     .then(render)
//     .catch(handleError)
// }

// function render (items) {
//   if (items.length === 0) {
//     return
//   }

//   items.map((item) => {
//     const data = {
//       id: `${item.name}${getDate(item.updatedAt)}`,
//       type: `log-${item.name}`,
//       name: item.displayName,
//       inputType: item.type,
//       completed: false,
//     }

//     hoodie.store.findOrAdd(data)
//       .then((obj) => {
//         obj.completed
//           ? $success.insertAdjacentHTML('beforeend', `<li><span>success</span> ${item.name}</li>`)
//           : $fail.insertAdjacentHTML('beforeend', `<li><span>fail</span> ${item.name}</li>`)
//       })
//       .catch(handleError)
//   })

//   $date.innerHTML = getToday()
// }

// function getToday () {
//   return new Date().toJSON().slice(0, 10)
// }

// function getDate (str) {
//   return new Date(str).toJSON().slice(0, 10)
// }

// function handleError (err) {
//   if (err.status !== 404) {
//     console.info(err)
//   }
// }
