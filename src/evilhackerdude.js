var open = require('openurl')

module.exports = function (flags) {
  console.log('We have content addressed you!')
  open.open('https://www.youtube.com/watch?v=TrcT7sseLZI')
}
