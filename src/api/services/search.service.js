import { API_ENDPOINTS } from '../config.js'
import { get, withMockFallback } from '../http.js'
import {
  CITY_OPTIONS,
  filterSearchResults,
  MOCK_SEARCH_PEOPLE,
  MOOD_OPTIONS,
  PROXIMITY_OPTIONS,
  USER_DEFAULT_CITY,
  WANT_TO_GO_OPTIONS,
} from '../mocks/search.mock.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export const searchService = {
  async getFilters() {
    return withMockFallback(
      () => get(`${API_ENDPOINTS.search.results}/filters`),
      async () => {
        await delay(150)
        return {
          moods: MOOD_OPTIONS,
          wantToGo: WANT_TO_GO_OPTIONS,
          cities: CITY_OPTIONS,
          proximity: PROXIMITY_OPTIONS,
          userCity: USER_DEFAULT_CITY,
        }
      },
    )
  },

  async search(params = {}) {
    return withMockFallback(
      () => get(`${API_ENDPOINTS.search.results}?${new URLSearchParams(params)}`),
      async () => {
        await delay()
        return filterSearchResults(MOCK_SEARCH_PEOPLE, params)
      },
    )
  },
}
