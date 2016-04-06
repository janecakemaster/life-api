/* global hoodie */

if (hoodie.account.isSignedIn()) {
  showSignedIn(hoodie.account.username)
} else {
  hideSignedIn()
}
hoodie.account.on('signin', ({username}) => showSignedIn(username))
hoodie.account.on('signout', hideSignedIn)

function showSignedIn (username) {
  document.querySelector('[data-value=username]').textContent = username
  document.body.setAttribute('data-account-state', 'signed-in')
}

function hideSignedIn () {
  document.body.setAttribute('data-account-state', 'signed-out')
}
