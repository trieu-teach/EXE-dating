/**
 * Gamification service — STAGE 6.
 *
 *   GET /api/tasks       → { tasks: [{ id, code, title, description, xp, completed }] }
 *   GET /api/inventory   → { items: [...] }
 */

import { API_ENDPOINTS } from '../config.js'
import { get } from '../http.js'

export const gamificationService = {
  tasks() {
    return get(API_ENDPOINTS.gamification.tasks)
  },

  inventory() {
    return get(API_ENDPOINTS.gamification.inventory)
  },
}
