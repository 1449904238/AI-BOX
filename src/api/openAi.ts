import { Body } from '@tauri-apps/api/http'
import {
  fetchEventSource,
  type EventSourceMessage
} from '@microsoft/fetch-event-source'
import type { MessageData, ImageData, AudioData } from '@/types' // audioData

const { t } = i18n.global

/**
 * 获取 openai 对话消息
 * @param messages 消息列表
 */
export const getOpenAIResultApi = async (messages: MessageData[]) => {
  if (!messages.length) return

  const apiKey = getOpenAIKey()
  if (!apiKey) return

  return await request(`/v1/chat/completions`, {
    method: 'POST',
    body: Body.json({
      model: OPEN_AI_MODEL,
      messages
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
}

/**
 * 获取 openai 对话消息(流)
 * @param messages 消息列表
 */
export const getOpenAIResultStreamApi = async (messages: MessageData[]) => {
  if (!messages.length) return

  const apiKey = getOpenAIKey()
  if (!apiKey) return

  const { updateSessionData } = useSessionStore()
  const { sessionDataList, chatController } = storeToRefs(useSessionStore())
  const {
    proxy: { bypass, url: proxyURL },
    modalParams: { temperature, max_tokens }
  } = useSettingsStore()

  let url = '/v1/chat/completions'
  if (bypass && proxyURL) {
    url = proxyURL + url
  } else {
    url = HOST_URL.OPENAI + url
  }

  // 创建一个新的 AbortController
  const abortController = new AbortController()
  chatController.value = abortController

  await fetchEventSource(url, {
    method: 'POST',
    body: JSON.stringify({
      model: OPEN_AI_MODEL,
      messages,
      temperature,
      max_tokens,
      stream: true
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    signal: abortController.signal,
    async onopen(response) {
      if (response.ok) return

      if (response.status === 429) {
        throw new Error(t('errors.keyOverLimit'))
      } else if (response.status === 401) {
        throw new Error(t('errors.disableApiKey'))
      } else {
        throw new Error(t('errors.requestError'))
      }
    },
    onmessage(msg: EventSourceMessage) {
      if (msg.data !== '[DONE]') {
        const { choices } = JSON.parse(msg.data)

        if (!choices[0].delta.content) return

        getLastItem(sessionDataList.value).message.content +=
          choices[0].delta.content
      }
    },
    onclose() {
      updateSessionData(getLastItem(sessionDataList.value!))
    },
    onerror({ message }: any) {
      Message.error(i18n.global.t('message.networkError'))
      throw new Error(message)
    }
  })
}

/**
 * 获取账号余额信息
 */
export const getOpenAICreditApi = async () => {
  try {
    const apiKey = getOpenAIKey()
    if (!apiKey) return

    const result = await request('/dashboard/billing/credit_grants', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        HostUrl: HOST_URL.OPENAI
      }
    })

    return result
  } catch ({ message }: any) {
    const { isThinking } = useSessionStore()

    if (isThinking) {
      return t('errors.disableApiKey')
    }
  }
}

/**
 * 根据提示创建图像
 * @param messages 图像参数
 */
export const getOpenAIImage = async (imageData: ImageData) => {
  if (!imageData) return
  const apiKey = getOpenAIKey()
  if (!apiKey) return

  return await request('/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      HostUrl: HOST_URL.OPENAI
    },
    body: Body.json(imageData)
  })
}
/**
 * 根据音频生成文本
 * @param messages 音频参数
 */
export const genTextByAudio = async (audioData: AudioData) => {
  // console.log(Body.json(audioData), '====audioData')
  if (!audioData) return
  const apiKey = getOpenAIKey()
  if (!apiKey) return

  const result = await requestV2('/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      HostUrl: HOST_URL.OPENAI,
      'Content-Type': 'multipart/form-data'
    },
    body: Body.json(audioData) // Body.json(audioData)
  })
  // console.log(result, '===result=audioData')
  return result
}

