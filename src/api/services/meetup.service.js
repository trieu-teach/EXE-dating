/**
 * Meetup service — Meetup §3 & §4.
 *
 *   POST /api/connection/meetup/{conversationId}/propose
 *     body: { venueId, proposedAt (ISO 8601 UTC), note? }
 *     → { meetupId, status: "Proposed" }
 *
 *   GET  /api/connection/meetups/{conversationId}
 *     → MeetupDto[]: { id, conversationId, proposerId, isMine,
 *                      venueId, venueName, proposedAt, note,
 *                      status, createdAt }
 *     status: "Proposed" | "Accepted" | "Declined"
 *
 *   POST /api/connection/meetup/{meetupId}/respond
 *     body: { action: "accept" | "decline" }
 *     → updated MeetupDto
 *
 *   POST /api/conversations/{conversationId}/venue
 *     body: { venueId }
 *     → MessageDto (type: "venue")
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const meetupService = {
  propose(conversationId, { venueId, proposedAt, note } = {}) {
    return post(API_ENDPOINTS.connection.proposeMeetup(conversationId), {
      venueId,
      proposedAt,
      ...(note ? { note } : {}),
    })
  },

  list(conversationId) {
    return get(API_ENDPOINTS.connection.meetups(conversationId))
  },

  respond(meetupId, action) {
    return post(API_ENDPOINTS.connection.respondMeetup(meetupId), { action })
  },

  shareVenue(conversationId, venueId) {
    return post(API_ENDPOINTS.conversations.venue(conversationId), { venueId })
  },
}
