import api from './api'
import jsonp from './jsonp'
import { getToken, getMH5Token } from '../util/token'
import setPass from '../util/pass'
// 查询用户名
export function getUserInfo(data) {
  return api.post('/video/component/getUserInfo.do', data)
}
// 验证信息
export function addMaterial(data) {
  data._tb_token_ = getToken()
  return api.post('/ajax/video/material/addMaterial.do', data)
}
// // 推关注 推公告
// export function pushFocus(data) {
//   data._tb_token_ = getToken()
//   return api.post('/live/action.do?api=publish_content_feed', data)
// }
// 公共推送
export function commonPush(data) {
  data._tb_token_ = getToken()
  return api.post('/live/action.do?api=publish_content_feed', data)
}
// 获取商品信息
export function liveAction(data) {
  let params = '?'
  for (let key in data) {
    params += `${key}=${data[key]}&`
  }
  params = params.substr(0, params.length - 1)
  return api.post(`/live/action.do${params}`, {})
}
// 获取公用接口
export function getCommon(data) {
  let options = {
    param: 'callback',
    prefix: 'mtopjsonp1'
  }
  let t = new Date().getTime()
  let appKey = '12574478'
  let key = getMH5Token() + '&' + t + '&' + appKey + '&' + data.data
  let sign = setPass(key)
  let obj = {
    t,
    appKey,
    sign,
    type: 'jsonp',
    dataType: 'jsonp',
    __: 'ji'
  }
  Object.assign(data, obj)
  let url = `https://h5api.m.taobao.com/h5/${data.api}/${data.v}/`
  return jsonp(url, data, options)
}
// 获取上架的商品列表
export function getUpGoodsList(data) {
  let options = {
    param: 'callback',
    prefix: 'mtopjsonp1'
  }
  let url = `https://h5api.m.taobao.com/h5/${data.api}/${data.v}/`
  data.__ = 'ji'
  return jsonp(url, data, options)
}
// 获取优惠券信息
export function getCoupon(data) {
  let options = {
    param: 'callback',
    prefix: 'mtopjsonp1'
  }
  let url = `https://acs.m.taobao.com/h5/${data.api}/${data.v}/`
  data.__ = 'ji'
  return jsonp(url, data, options)
}
