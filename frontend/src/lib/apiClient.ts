import { config } from './config'

async function publicGet(url: string) {
  return fetch(`${config.apiUrl}${url}`, {
    method: 'GET',
  })
}

async function get(url: string) {
  return fetchWithAuth(url, { method: 'GET' })
}

async function post(url: string, body: any, options: RequestInit = {}) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  })
}

function fetchWithAuth(url: string, options: RequestInit) {
  return fetch(`${config.apiUrl}${url}`, {
    ...options,
    headers: {
      Authorization: `${getBearerAuthorizationCookie()}`,
    },
  })
}

function getBearerAuthorizationCookie() {
  const cookies = document.cookie.split(';')
  const authorizationCookie = cookies.find((cookie) => cookie.trim().startsWith('Authorization='))
  return authorizationCookie?.split('=')[1]
}

export default {
  publicGet,
  get,
  post,
}
