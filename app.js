const Hapi = require('hapi')
const winston = require('winston')
const config = require('config')
const env = config.get('env')

if (env === 'demo') {
  require('./lib/populate')()
}

const server = new Hapi.Server()

// api server
server.connection({
  port: 8001,
  labels: ['api'],
  routes: {
    cors: true
  }
})

const apiServer = server.select('api')

apiServer.register([require('vision'), require('inert'), { register: require('lout') }])
apiServer.route(require('./lib/routes/api'))

// web server
server.connection({
  port: 8000,
  labels: ['web']
})

const webServer = server.select('web')

webServer.register(require('inert'))
webServer.route(require('./lib/routes/web'))

// configure logger
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  colorize: true,
  level: 'debug'
  // json: true
})

if (env === 'production') {
  winston.add(winston.transports.File, {
    filename: 'logs/info.log'
  })
}

server.start()
  .then(() => {
    server.table().forEach((connection) => {
      winston.info(`${connection.labels} server running at ${connection.info.uri}`)
    })
  })
  .catch(winston.error)
