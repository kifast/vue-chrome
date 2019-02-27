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
  let ret = ''
  if (
    window.pageData &&
    window.pageData.liveDO &&
    window.pageData.liveDO.accountId
  ) {
    ret = window.pageData.liveDO.accountId
  } else if (Cookies.get(userIdKey)) {
    ret = Cookies.get(userIdKey)
  }
  return ret
}

const _m_h5_tk = '_m_h5_tk'
export function getMH5Token() {
  return Cookies.get(_m_h5_tk) ? Cookies.get(_m_h5_tk).split('_')[0] : ''
}
