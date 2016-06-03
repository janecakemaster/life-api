module.exports = [
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
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public',
        index: true,
        defaultExtension: 'html'
      }
    }
  }
]
