import { config } from './config'

async function get(url: string) {
  return fetchWithAuth(url, { method: 'GET' })
}

async function post(url: string, body: any) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function fetchWithAuth(url: string, options: RequestInit) {
  return fetch(`${config.apiUrl}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAuthorizationCookie()}`,
    },
  })
}

function getAuthorizationCookie() {
  const cookies = document.cookie.split(';')
  const authorizationCookie = cookies.find((cookie) => cookie.trim().startsWith('Authorization='))
  return authorizationCookie?.split('=')[1]
}

export default {
  get,
  post,
}
