const STORAGE_KEY = 'samemess_connection_tracking'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function recordUserMessage(conversationId) {
  const store = readStore()
  const convo = store[conversationId] ?? {}
  const now = new Date().toISOString()

  store[conversationId] = {
    ...convo,
    lastUserMessageAt: now,
    greetedToday: todayKey(),
    totalUserMessages: (convo.totalUserMessages ?? 0) + 1,
  }
  writeStore(store)
}

export function markDateInviteHandled(conversationId, accepted = false) {
  const store = readStore()
  const convo = store[conversationId] ?? {}
  const dismissed = new Set(convo.dismissedNudges ?? [])
  dismissed.add('intimacy_date_invite')

  store[conversationId] = {
    ...convo,
    dismissedNudges: [...dismissed],
    dateInviteAccepted: accepted,
    dateInviteHandledAt: new Date().toISOString(),
  }
  writeStore(store)
}

export function getConversationTracking(conversationId) {
  return readStore()[conversationId] ?? {}
}

export function markNudgeDismissed(conversationId, nudgeId) {
  const store = readStore()
  const convo = store[conversationId] ?? {}
  const dismissed = new Set(convo.dismissedNudges ?? [])
  dismissed.add(nudgeId)

  store[conversationId] = {
    ...convo,
    dismissedNudges: [...dismissed],
  }
  writeStore(store)
}

export function saveMeetupProposal(conversationId, proposal) {
  const store = readStore()
  const convo = store[conversationId] ?? {}

  store[conversationId] = {
    ...convo,
    lastMeetupProposal: {
      ...proposal,
      sentAt: new Date().toISOString(),
    },
  }
  writeStore(store)
}

export function getMeetupProposal(conversationId) {
  return getConversationTracking(conversationId).lastMeetupProposal ?? null
}

export function daysSince(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function hoursSince(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60))
}
