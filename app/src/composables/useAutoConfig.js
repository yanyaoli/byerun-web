import { ref } from 'vue'
import { scheduledTaskConfig } from '@/utils/config'

export function useAutoConfig() {
  const loading = ref(false)
  const submitting = ref(false)
  const buttonState = ref('idle')

  // 获取配置
  const fetchConfig = async () => {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')
    const base = scheduledTaskConfig.apiBaseUrl
    const headers = { 'content-type': 'application/json' }
    if (token) headers['Token'] = token
    const params = userId ? `?userid=${encodeURIComponent(userId)}` : ''

    try {
      const res = await fetch(
        base.replace(/\/$/, '') + '/api/autorun/config' + params,
        { method: 'GET', headers }
      )
      return res.ok ? await res.json() : null
    } catch (error) {
      console.error('获取配置失败:', error)
      return null
    }
  }

  // 保存配置
  const saveConfig = async (configData) => {
    const token = localStorage.getItem('token')
    const base = scheduledTaskConfig.apiBaseUrl
    const headers = { 'content-type': 'application/json' }
    if (token) headers['Token'] = token

    try {
      const res = await fetch(base.replace(/\/$/, '') + '/api/autorun/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(configData),
      })

      if (!res.ok) throw new Error('network')
      const resp = await res.json()
      return resp && resp.ok === true
    } catch (error) {
      console.error('保存配置失败:', error)
      throw error
    }
  }

  // 提交配置
  const submitConfig = async (configData) => {
    submitting.value = true
    buttonState.value = 'loading'

    try {
      const result = await saveConfig(configData)
      buttonState.value = result ? 'success' : 'error'
      return result
    } catch (error) {
      buttonState.value = 'error'
      throw error
    } finally {
      submitting.value = false
      setTimeout(() => {
        buttonState.value = 'idle'
      }, 1500)
    }
  }

  return {
    loading,
    submitting,
    buttonState,
    fetchConfig,
    saveConfig,
    submitConfig,
  }
}