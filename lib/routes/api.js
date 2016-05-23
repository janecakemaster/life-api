module.exports = [
  {
    method: 'GET',
    path: '/logs/{name?}',
    handler: require('../api/logs')
  },
  {
    method: 'GET',
    path: '/inputs',
    handler: require('../api/inputs')
  }
]
