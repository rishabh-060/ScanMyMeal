import axios from 'axios'
import summaryApi, { baseUrl } from '../common/summaryApi'

const Axios = axios.create({ baseURL: baseUrl, withCredentials: true })
let refreshPromise = null

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshRequest = originalRequest?.url === summaryApi.refreshToken.url
    if (error.response?.status !== 401 || originalRequest?._retry || isRefreshRequest) {
      return Promise.reject(error)
    }
    originalRequest._retry = true
    try {
      refreshPromise ||= Axios(summaryApi.refreshToken).finally(() => { refreshPromise = null })
      await refreshPromise
      return Axios(originalRequest)
    } catch (refreshError) {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'))
      return Promise.reject(refreshError)
    }
  },
)

export default Axios
