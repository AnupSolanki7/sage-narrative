import { useState } from 'react'
import type { SubscriberSource } from '@/models/Subscriber'

export type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SubscribeState {
  status: SubscribeStatus
  message: string
}

export interface UseSubscribeReturn {
  state: SubscribeState
  subscribe: (email: string, source?: SubscriberSource) => Promise<void>
  reset: () => void
}

const IDLE: SubscribeState = { status: 'idle', message: '' }

export function useSubscribe(): UseSubscribeReturn {
  const [state, setState] = useState<SubscribeState>(IDLE)

  const subscribe = async (email: string, source: SubscriberSource = 'unknown') => {
    const trimmed = email.trim()
    if (!trimmed) {
      setState({ status: 'error', message: 'Please enter your email address.' })
      return
    }

    setState({ status: 'loading', message: '' })

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      })

      const data: { success: boolean; message: string } = await res.json()

      if (data.success) {
        setState({ status: 'success', message: data.message })
      } else {
        setState({ status: 'error', message: data.message })
      }
    } catch {
      setState({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      })
    }
  }

  const reset = () => setState(IDLE)

  return { state, subscribe, reset }
}
