const Hapi = require('hapi')
const winston = require('winston')
const server = new Hapi.Server()

// configure logger
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  colorize: true,
  level: 'debug'
})

server.register(require('inert'))

server.connection({
  port: 8000
})

server.route([
  {
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: 'public/assets'
      }
    }
  },
  {
    method: 'GET',
    path: '/dump',
    handler: require('./lib/dump')
  },
  {
    method: 'GET',
    path: '/api',
    handler: require('./lib/api')
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public',
        index: true,
        defaultExtension: 'html'
      }
    }
  }
])

server.start()
  .then(() => {
    winston.info('Server running at:', server.info.uri)
  })
  .catch(winston.error)
