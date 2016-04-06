const $announcer = document.getElementById('a11y-announcer')
let announceTimer

const announce = function (message, tone) {
  tone = tone || 'polite'
  $announcer.setAttribute('aria-live', 'off')
  $announcer.innerHTML = ''
  clearTimeout(announceTimer)
  announceTimer = setTimeout(function () {
    $announcer.setAttribute('aria-live', tone)
    $announcer.innerHTML = message
  }, 500)
}

window.announce = announce
