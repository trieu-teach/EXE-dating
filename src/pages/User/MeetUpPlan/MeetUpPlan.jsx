import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext.jsx'
import { chatService, connectionRemindersService } from '../../../api'
import MeetUpCard from '../../../components/User/MeetUpCard/MeetUpCard.jsx'

const VENUES = [
  { id: 'cafe-1', name: 'The Coffee House', address: 'Quán cà phê' },
  { id: 'cafe-2', name: 'Highlands Coffee', address: 'Quán cà phê' },
  { id: 'park-1', name: 'Công viên Tao Đàn', address: 'Công viên' },
  { id: 'restaurant-1', name: 'Pizza 4P\'s', address: 'Nhà hàng' },
  { id: 'bar-1', name: 'Chill Sky Bar', address: 'Bar' },
  { id: 'museum-1', name: 'Bảo tàng Mỹ Thuật', address: 'Bảo tàng' },
  { id: 'walk-1', name: 'Đi bộ ven sông Sài Gòn', address: 'Ngoài trời' },
]

export default function MeetUpPlan() {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [conversationId, setConversationId] = useState(null)
  const [proposedAt, setProposedAt] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
    d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [venueId, setVenueId] = useState(VENUES[0].id)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Resolve conversation: try chatService.conversations() and find by partner
  const ensureConversation = async () => {
    const list = await chatService.conversations()
    const arr = Array.isArray(list) ? list : (list?.items ?? [])
    const conv = arr.find((c) => c.otherUserId === partnerId)
    if (conv) {
      setConversationId(conv.id)
      return conv.id
    }
    toast.error('Bạn cần match trước khi đề xuất gặp mặt.')
    navigate('/matches')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const convId = conversationId || (await ensureConversation())
      if (!convId) return
      const venue = VENUES.find((v) => v.id === venueId)
      const proposedIso = new Date(proposedAt).toISOString()
      await connectionRemindersService.proposeMeetup(convId, {
        venueId,
        venueName: venue?.name,
        venueAddress: venue?.address,
        proposedAt: proposedIso,
        note: note || undefined,
      })
      toast.success('Đã gửi lời mời gặp mặt!')
      navigate(`/chat/${convId}`)
    } catch (err) {
      toast.error(err?.message || 'Không gửi được lời mời.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedVenue = VENUES.find((v) => v.id === venueId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>Đề xuất gặp mặt</h1>
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label className="field-label">Địa điểm</label>
          <select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
            {VENUES.map((v) => (
              <option key={v.id} value={v.id}>{v.name} — {v.address}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Thời gian</label>
          <input
            type="datetime-local"
            value={proposedAt}
            onChange={(e) => setProposedAt(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field-label">Lời nhắn (tuỳ chọn)</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mình rủ bạn đi uống cà phê nhé ☕"
            maxLength={300}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Gửi lời mời'}
        </button>
      </form>

      <h2 style={{ fontSize: '1rem' }}>Xem trước</h2>
      <MeetUpCard
        meetup={{
          venueId: selectedVenue?.id,
          venueName: selectedVenue?.name,
          venueAddress: selectedVenue?.address,
          proposedAt: proposedAt ? new Date(proposedAt).toISOString() : null,
          note,
          status: 'Pending',
        }}
      />
    </div>
  )
}
