var log = require('npmlog')
var open = require('openurl')

module.exports = function (flags) {
  log.verbose('support', 'starting command')

  if (!flags.token) {
    log.info('support', 'Not logged in. Opening the general support repo.')
    open.open('https://github.com/greenkeeperio/support')
    process.exit(1)
  }

  log.info('support', 'Opening Intercom chat in browser')

  open.open(flags.api + 'support?access_token=' + flags.token)
}
