// GET /logs list all logs
// POST /logs create log
// GET /inputs list all inputs
// POST /inputs create input

module.exports = [
  {
    method: 'POST',
    path: '/inputs',
    handler: require('../controllers/create-input'),
    config: {
      cors: true // @todo stricter options
    }
  }, {
    method: 'GET',
    path: '/inputs',
    handler: require('../controllers/inputs')
  }, {
    method: 'POST',
    path: '/logs',
    handler: require('../controllers/create-log'),
    config: {
      cors: true
    }
  }, {
    method: 'GET',
    path: '/logs/{name?}',
    handler: require('../controllers/logs')
  }, {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.redirect('/docs')
    }
  }
]
