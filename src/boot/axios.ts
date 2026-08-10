import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// 每次 Request 自動附上 Bearer Token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default defineBoot(() => {
  // 之後可以加入全域 401 處理
})

export { api }
