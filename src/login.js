var log = require('npmlog')
var open = require('openurl')
var request = require('request')
var randomString = require('random-string')
var spinner = require('char-spinner')

var rc = require('./lib/rc')
var story = require('./lib/story').login
var logo = require('./lib/story').logo

module.exports = function (flags) {
  logo()
  log.verbose('login', 'starting command')

  if (flags.token && !flags.force) {
    log.error('login', story.error_already_logged_in)
    process.exit(1)
  }

  if (!flags['public-only']) {
    log.info('login', 'Requsting access for public and private repos. For public only usecases do $ greenkeeper login --public-only')
  }

  var id = randomString({length: 32})
  log.verbose('login', 'id', id)

  log.verbose('login', 'Getting token from API and opening GitHub login')
  var spin = spinner()
  function getToken () {
    request({
      method: 'POST',
      json: true,
      url: flags.api + 'tokens',
      timeout: 1000 * 60 * 60, // wait 1h
      body: {
        id: id
      }
    }, function (err, res, data) {
      if (err) {
        log.error('login', story.request_failed)
        process.exit(2)
      }

      if (res.statusCode >= 502 && res.statusCode <= 504) {
        log.warn('login', 'Oops, that took too long. retrying...')
        return setTimeout(getToken, 1000)
      }

      if (!(res.statusCode === 200 && data.token)) {
        log.error('login', story.login_failed)
        process.exit(1)
      }

      rc.set('token', data.token)

      // async me! (sing along to moisturize me!)
      log.info('login', 'That was successful, now syncing all your GitHub repos')

      request({
        method: 'POST',
        url: flags.api + 'sync',
        json: true,
        headers: {
          Authorization: 'Bearer ' + data.token
        }
      }, function (err, res, data) {
        clearInterval(spin)

        if (err) {
          log.error('login', err.message)
          process.exit(2)
        }

        if (data.error) {
          log.error('login', data.statusCode + '/' + data.error + ': ' + data.message)
          process.exit(2)
        }

        if (data.repos) {
          log.info('login', 'Done syncing ' + data.repos.length + ' repositories')
          console.log('You are now logged in, synced and all set up!')
          log.info('login', 'Find out how to get started with', '$ greenkeeper start')
        }
      })
    })
  }

  getToken()

  var url = flags.api + 'login?id=' + id + (flags['public-only'] ? '&public=true' : '')

  log.verbose('login', 'Open ' + url+' type: '+typeof url)
  open.open(url)
}
