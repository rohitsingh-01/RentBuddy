import { useState, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const call = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setState({ data: null, loading: true, error: null })
      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...options,
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
        setState({ data: json, loading: false, error: null })
        return json
      } catch (err: any) {
        setState({ data: null, loading: false, error: err.message })
        return null
      }
    },
    []
  )

  return { ...state, call }
}

// Convenience wrappers
export async function apiPost<T = any>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
  return json
}

export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
  return json
}

export async function apiPatch<T = any>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
  return json
}
