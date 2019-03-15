import storage from 'good-storage'

// 格式化时间
export function formatTime(time, fmt = 'yyyy-MM-dd') {
  // time是秒
  var date = new Date(time)
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
}
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

const JM_KEY = '__jimei__'
export function saveStorage(key, data) {
  let obj = storage.get(JM_KEY, {})
  obj[key] = data
  storage.set(JM_KEY, obj)
  // if (typeof data === 'object') {
  //   data = JSON.stringify(data)
  // }
  // localStorage.setItem(key, data)
}

export function loadStorage(key) {
  let obj = storage.get(JM_KEY, {})
  let ret = obj[key]
  return ret
  // let data = localStorage.getItem(key)
  // try {
  //   data = JSON.parse(data)
  // } catch (error) {
  // }
  // return data
}
