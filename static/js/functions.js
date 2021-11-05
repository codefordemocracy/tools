/* Shared Functions */

const DOWNLOAD = function(elements, format, filename) {
  if (format == 'json') {
    file = new Blob([JSON.stringify(elements, null, 2)], {type: 'application/javascript;charset=utf-8'})
    saveAs(file, filename + '.json');
  } else if (format == 'csv') {
    axios.post('/api/format/flat/', elements)
    .then(function(response) {
      keys = _.uniq(_.map(response, function(ele) { return _.keys(ele) }))
      data = Papa.unparse((response), {columns: keys})
      file = new Blob([data], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename + '.csv')
    })
    .catch(function(error) {
      console.error(error)
    })
  }
}

// Popup window function
const POPUP = function(url, name, ratio, main) {
  var w = main.top.outerWidth*ratio
  var h = main.top.innerHeight*ratio
  var x = main.top.outerWidth/2 + main.top.screenX - (w/2)
  var y = main.top.outerHeight/2 + main.top.screenY - (h/2)
  window.open(url, name, `width=${w}, height=${h}, top=${y}, left=${x}, toolbar=no, directories=no, status=no, menubar=no, copyhistory=no`)
}

// Send to datawrapper
const DATAWRAPPER = function(settings, title, description) {
  if (!_.isNil(settings)) {
    settings.title = title
    if (!_.isNull(description)) {
      settings.description = description
    }
    let form = document.createElement('form')
    form.setAttribute('method', 'post')
    form.setAttribute('target', '_blank')
    form.setAttribute('action', 'https://app.datawrapper.de/create/')
    _.forEach(_.keys(settings), function(key) {
      let input = document.createElement('input')
      input.setAttribute('type', 'hidden')
      input.setAttribute('name', key)
      input.setAttribute('value', key === 'metadata' ? JSON.stringify(settings[key]) : settings[key])
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }
}

// Copy text to clipboard
const COPY = function(payload) {
  let el = document.createElement('textarea')
  el.value = payload
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

// Generate sharelink
const GENSHARELINK = function(route) {
  axios.post('/api/generate/link/', route)
  .then(function(response) {
    COPY(ROOTURL + response.data)
  })
  .catch(function(error) {
    console.error(error)
  })
}
