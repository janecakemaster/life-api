module.exports = [
  {
    method: 'POST',
    path: '/inputs/create',
    handler: require('../api/create-input'),
    config: {
      cors: true // @todo stricter options
    }
  },
  {
    method: 'POST',
    path: '/logs/create',
    handler: require('../api/create-log'),
    config: {
      cors: true
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.redirect('/docs')
    }
  },
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
