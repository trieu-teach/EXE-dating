import { MOCK_CANDIDATES } from '../api/mocks/discovery.mock.js'
import { NEARBY_VENUES } from '../data/nearbyVenues.js'
import { parseCityLocation } from './matching.js'
import { getUser } from './session.js'

function normalizeCity(city = '') {
  const { city: parsed } = parseCityLocation(city)
  return parsed
}

function pickDistrictVenues(cityData, district) {
  if (!cityData) return []
  if (district && cityData[district]?.length) return cityData[district]
  return cityData.default ?? []
}

export function getPartnerLocation(partnerId) {
  const partner = MOCK_CANDIDATES.find((c) => c.id === partnerId)
  return {
    city: partner?.city ?? 'TP. Hồ Chí Minh',
    district: partner?.district ?? 'Quận 1',
    name: partner?.name ?? 'đối phương',
    image: partner?.image ?? null,
  }
}

export function getUserLocation() {
  const user = getUser()
  const profile = user?.profile ?? {}
  return {
    city: normalizeCity(profile.city) || 'TP. Hồ Chí Minh',
    district: profile.district ?? 'Quận 1',
  }
}

/**
 * Gợi ý địa điểm gần vị trí 2 người
 * - Cùng quận → ưu tiên quận đó
 * - Cùng TP khác quận → gộp 2 quận + điểm trung tâm
 * - Khác TP → điểm trung tâm TP của user
 */
export function getNearbyMeetupVenues(partnerId, { limit = 4 } = {}) {
  const userLoc = getUserLocation()
  const partnerLoc = getPartnerLocation(partnerId)

  const userCity = normalizeCity(userLoc.city)
  const partnerCity = normalizeCity(partnerLoc.city)
  const sameCity = userCity === partnerCity
  const sameDistrict =
    sameCity && userLoc.district && partnerLoc.district && userLoc.district === partnerLoc.district

  const cityKey = sameCity ? userCity : userCity
  const cityData = NEARBY_VENUES[cityKey] ?? NEARBY_VENUES['TP. Hồ Chí Minh']

  let venues = []
  let locationHint = ''

  if (sameDistrict) {
    venues = pickDistrictVenues(cityData, userLoc.district)
    locationHint = `Gần ${userLoc.district} — cả hai cùng khu vực`
  } else if (sameCity) {
    const a = pickDistrictVenues(cityData, userLoc.district)
    const b = pickDistrictVenues(cityData, partnerLoc.district)
    const central = cityData.default ?? []
    venues = [...a, ...b, ...central]
    locationHint = `Giữa ${userLoc.district} & ${partnerLoc.district}, ${userCity}`
  } else {
    venues = cityData.default ?? []
    locationHint = `Bạn ở ${userCity}, ${partnerLoc.name} ở ${partnerCity} — gợi ý tại ${userCity}`
  }

  const seen = new Set()
  const unique = venues.filter((v) => {
    if (seen.has(v.id)) return false
    seen.add(v.id)
    return true
  })

  unique.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))

  return {
    venues: unique.slice(0, limit),
    locationHint,
    userLocation: userLoc,
    partnerLocation: partnerLoc,
    sameCity,
    sameDistrict,
  }
}
