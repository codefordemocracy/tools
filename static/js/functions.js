/* Shared Functions */

const DOWNLOAD = function(elements, format, filename) {
  if (format == 'json') {
    file = new Blob([JSON.stringify(elements, null, 2)], {type: 'application/javascript;charset=utf-8'})
    saveAs(file, filename + '.json');
  } else if (format == 'csv') {
    axios.post('/format/flat/', elements)
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
