import { useState, useEffect, useCallback, useRef } from 'react'
import { APIClient, type LocalExecutionPlan } from './client.js'
import type { Task } from '@ai-company/shared'
import type { ModelProviderConfig } from '@ai-company/shared'

// Hook for managing API client connection
export function useAPIClient(config: { baseURL: string; wsURL?: string }) {
  const [client] = useState(() => new APIClient(config))
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<unknown[]>([])

  useEffect(() => {
    client.connect()

    client.setCallbacks({
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onMessage: (data) => setMessages((prev) => [...prev, data]),
    })

    return () => {
      client.disconnect()
    }
  }, [client])

  return { client, connected, messages }
}

// Hook for fetching and managing tasks
export function useTasks(client: APIClient) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await client.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [client])

  const createTask = useCallback(
    async (data: {
      title: string
      description?: string
      priority?: 'low' | 'medium' | 'high'
      category?: string
    }) => {
      setLoading(true)
      setError(null)
      try {
        const newTask = await client.createTask(data)
        setTasks((prev) => [...prev, newTask])
        return newTask
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  const reviewTask = useCallback(
    async (id: string, approved: boolean, feedback?: string) => {
      setLoading(true)
      setError(null)
      try {
        await client.reviewTask(id, approved, feedback)
        await fetchTasks() // Refresh tasks
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client, fetchTasks]
  )

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, fetchTasks, createTask, reviewTask }
}

// Hook for fetching and managing plans
export function usePlans(client: APIClient) {
  const [plans, setPlans] = useState<LocalExecutionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await client.getPlans()
      setPlans(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [client])

  const createPlan = useCallback(
    async (taskId: string, title: string) => {
      setLoading(true)
      setError(null)
      try {
        const newPlan = await client.createPlan(taskId, title)
        setPlans((prev) => [...prev, newPlan])
        return newPlan
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return { plans, loading, error, fetchPlans, createPlan }
}

// Hook for fetching and managing model providers
export function useModelProviders(client: APIClient) {
  const [providers, setProviders] = useState<ModelProviderConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await client.getModelProviders()
      setProviders(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [client])

  const createProvider = useCallback(
    async (data: {
      name: string
      provider: string
      baseUrl: string
      apiKey: string
      isActive?: boolean
      models?: Array<{
        name: string
        modelId: string
        capabilities: string[]
        maxTokens: number
        costPer1MTokens: number
        isActive: boolean
      }>
    }) => {
      setLoading(true)
      setError(null)
      try {
        const newProvider = await client.createModelProvider(data as any)
        setProviders((prev) => [...prev, newProvider])
        return newProvider
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  const updateProvider = useCallback(
    async (id: string, data: Partial<ModelProviderConfig>) => {
      setLoading(true)
      setError(null)
      try {
        const updated = await client.updateModelProvider(id, data)
        setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)))
        return updated
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  const deleteProvider = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await client.deleteModelProvider(id)
        setProviders((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  const testProvider = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        return await client.testModelProvider(id)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  return {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    testProvider,
  }
}
