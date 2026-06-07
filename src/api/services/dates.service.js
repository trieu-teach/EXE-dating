import { API_ENDPOINTS } from '../config.js'
import { get, withMockFallback } from '../http.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

const MOCK = {
  categories: [
    { id: 'coffee', label: 'Cà phê', icon: '☕' },
    { id: 'food', label: 'Ăn uống', icon: '🍽️' },
    { id: 'outdoor', label: 'Ngoài trời', icon: '🌿' },
  ],
  featured: {
    title: 'Workshop gốm thủ công tại Quận 3',
    match: 92,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop',
  },
  forBoth: [
    {
      id: 'ba-vi',
      title: 'Leo núi Ba Vì & ngắm hoàng hôn',
      match: 88,
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop',
    },
  ],
}

export const datesService = {
  async getSuggestions() {
    return withMockFallback(
      () => get(API_ENDPOINTS.dates.suggestions),
      async () => {
        await delay()
        return MOCK
      },
    )
  },
}
