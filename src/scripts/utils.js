const appUtils = window.appUtils = {
  post ({action, url, data}) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()

      request.open(action, url)
      request.send(data || null)

      request.onreadystatechange = () => {
        if (request.status === 200 && request.readyState === 4) {
          resolve(request.response)
        } else if (request.status !== 200 && request.readyState === 4) {
          reject(error)
        }
      }
    })
  }
}
