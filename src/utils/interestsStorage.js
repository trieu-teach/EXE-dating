import { DEFAULT_SELECTED_INTERESTS } from '../data/interests.js'
import { getUser, saveUser } from './session.js'

export function getStoredInterests() {
  const user = getUser()
  return {
    interests: user?.interests?.length ? user.interests : [...DEFAULT_SELECTED_INTERESTS],
    customInterests: user?.customInterests ?? [],
  }
}

export function addCustomInterest(label) {
  const trimmed = label.trim()
  if (!trimmed) return null

  const user = getUser() ?? {}
  const customInterests = [...new Set([...(user.customInterests ?? []), trimmed])]
  const interests = [...new Set([...(user.interests ?? DEFAULT_SELECTED_INTERESTS), trimmed])]

  saveUser({ customInterests, interests })
  return trimmed
}
