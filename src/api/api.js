import axios from 'axios'
// qs插件
import qs from 'qs'

// import serverParams from '../store/serverParams'

// import CryptoJS from 'crypto-js'

// const studentUserId = serverParams.studentUserId
const studentUserId = 8999248

function post(url, data, time = 0) {
  if (!url.startsWith('http')) {
    // url = process.env.HOST + url
    url = `https://liveplatform.taobao.com${url}`
  }
  return axios
    .post(url, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
    .catch(err => {
      // 返回数据
      return Promise.reject(err)
    })
}
export default { post }
