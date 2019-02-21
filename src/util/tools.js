export function urlParse() {
  var url = window.location.href
  var obj = {}
  var reg = /[?&][^?&]+=[^?&#/]+/g
  var arr = url.match(reg)
  // ['?id=12345', '&a=b']
  if (arr) {
    arr.forEach(function(item) {
      var tempArr = item.substring(1).split('=')
      var key = decodeURIComponent(tempArr[0])
      var val = decodeURIComponent(tempArr[1])
      obj[key] = val
    })
  }
  return obj
}

export function saveStorage(key, data) {
  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }
  localStorage.setItem(key, data)
}

export function loadStorage(key) {
  let data = localStorage.getItem(key)
  try {
    data = JSON.parse(data)
  } catch (error) {
  }
  return data
}