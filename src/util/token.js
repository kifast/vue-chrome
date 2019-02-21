import Cookies from 'js-cookie'
const TokenKey = '_tb_token_'
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

const userIdKey = 'unb'
export function getUserId() {
  return Cookies.get(userIdKey)
}

const _m_h5_tk = '_m_h5_tk'
export function getMH5Token() {
  return Cookies.get(_m_h5_tk) ? Cookies.get(_m_h5_tk).join('_')[0] : ''
}
