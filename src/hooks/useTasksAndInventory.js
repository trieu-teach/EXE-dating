import { useCallback, useEffect, useMemo, useState } from 'react'
import { gamificationService } from '../api'
import { useInventory } from '../context/InventoryContext.jsx'

/**
 * Tasks-only data hook. Inventory is owned by `InventoryContext` and shared
 * across the app; this hook just reads `tasks` from /api/tasks.
 *
 * The `inventory` returned here is the same reference as
 * `useInventory().inventory` — refreshing either refreshes both.
 */
export function useTasksAndInventory() {
  const { inventory, loading: invLoading, refreshing, refresh, error: invError } = useInventory()
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)

  const loadTasks = useCallback(async (mode = 'initial') => {
    if (mode === 'initial') setTasksLoading(true)
    setTasksError(null)
    try {
      const t = await gamificationService.tasks()
      const list = Array.isArray(t) ? t : (t?.tasks ?? [])
      setTasks(list)
    } catch (err) {
      setTasksError(err?.message || 'Không tải được nhiệm vụ.')
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks('initial') }, [loadTasks])

  const refreshAll = useCallback(async () => {
    setTasksLoading(true)
    await Promise.all([loadTasks('refresh'), refresh('visible')])
  }, [loadTasks, refresh])

  return useMemo(() => ({
    tasks,
    inventory,
    loading: invLoading || tasksLoading,
    refreshing,
    error: invError || tasksError,
    refresh: refreshAll,
  }), [tasks, inventory, invLoading, tasksLoading, refreshing, invError, tasksError, refreshAll])
}