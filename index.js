if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dist/cnfapi-mini-vs.js')
} else {
  module.exports = require('./dist/cnfapi-mini-vs.common.js')
}
