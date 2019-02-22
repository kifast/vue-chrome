import api from './api'
import jsonp from './jsonp'
import { getToken } from '../util/token'
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
// 获取上架的商品列表
export function getUpGoodsList(data) {
  let options = {
    // param: 'callback',
    // prefix: 'mtopjsonp1'
  }
  data._tb_token_ = getToken()
  let url = 'https://h5api.m.taobao.com/h5/mtop.mediaplatform.video.livedetail.itemlist.withpagination/2.0/'
  return api.post(url, data)
}
// 获取上架的商品列表
export function getCoupon(url, data) {
  return api.post(url, data)
}
