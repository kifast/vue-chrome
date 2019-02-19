import api from './api'
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
// 推关注 推公告
export function pushFocus(data) {
  data._tb_token_ = getToken()
  return api.post('/live/action.do?api=publish_content_feed', data)
}
