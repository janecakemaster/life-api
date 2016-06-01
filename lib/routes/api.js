module.exports = [
  {
    method: 'POST',
    path: '/inputs/create',
    handler: require('../api/input'),
    config: {
      cors: true
    }
  },
  {
    method: 'POST',
    path: '/logs/create',
    handler: require('../api/log'),
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
