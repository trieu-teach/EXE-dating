import { getAvatarUrl } from './profilePhotos.js'
import { getUser } from './session.js'

const INTEREST_KEYWORDS = {
  'thiết kế': 'Thiết kế',
  design: 'Thiết kế',
  'cà phê': 'Cà phê',
  coffee: 'Cà phê',
  'du lịch': 'Du lịch',
  travel: 'Du lịch',
  yoga: 'Yoga',
  'nhiếp ảnh': 'Nhiếp ảnh',
  photo: 'Nhiếp ảnh',
  'công nghệ': 'Công nghệ',
  tech: 'Công nghệ',
  'lập trình': 'Lập trình',
  code: 'Lập trình',
  'âm nhạc': 'Âm nhạc',
  music: 'Âm nhạc',
  'chạy bộ': 'Chạy bộ',
  run: 'Chạy bộ',
  'nấu ăn': 'Nấu ăn',
  cooking: 'Nấu ăn',
  sách: 'Sách',
  book: 'Sách',
  'ăn uống': 'Ăn uống',
  food: 'Ăn uống',
  biển: 'Biển',
  beach: 'Biển',
  game: 'Game',
  phim: 'Điện ảnh',
  movie: 'Điện ảnh',
}

const PERSONALITY_KEYWORDS = {
  'hướng ngoại': 'Hướng ngoại',
  extrovert: 'Hướng ngoại',
  'năng động': 'Hướng ngoại',
  'hướng nội': 'Hướng nội',
  introvert: 'Hướng nội',
  'yên tĩnh': 'Hướng nội',
  'lãng mạn': 'Lãng mạn',
  romantic: 'Lãng mạn',
  'thực tế': 'Thực tế',
  practical: 'Thực tế',
  'cân bằng': 'Cân bằng',
  balanced: 'Cân bằng',
}

const PERSONALITY_COMPAT = {
  'Hướng ngoại': ['Hướng ngoại', 'Cân bằng', 'Lãng mạn'],
  'Hướng nội': ['Hướng nội', 'Cân bằng', 'Thực tế'],
  'Cân bằng': ['Hướng ngoại', 'Hướng nội', 'Cân bằng', 'Lãng mạn', 'Thực tế'],
  'Lãng mạn': ['Lãng mạn', 'Cân bằng', 'Hướng ngoại'],
  'Thực tế': ['Thực tế', 'Cân bằng', 'Hướng nội'],
}

const CITY_ALIASES = [
  { keys: ['hồ chí minh', 'hcm', 'sài gòn', 'saigon', 'tp.hcm', 'tp. hồ chí minh'], city: 'TP. Hồ Chí Minh', region: 'Nam' },
  { keys: ['hà nội', 'hanoi', 'hn'], city: 'Hà Nội', region: 'Bắc' },
  { keys: ['đà nẵng', 'danang'], city: 'Đà Nẵng', region: 'Trung' },
  { keys: ['cần thơ', 'cantho'], city: 'Cần Thơ', region: 'Nam' },
  { keys: ['hải phòng', 'haiphong'], city: 'Hải Phòng', region: 'Bắc' },
]

function normalize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function extractFromText(text, dictionary) {
  const norm = normalize(text)
  const found = new Set()
  for (const [key, value] of Object.entries(dictionary)) {
    if (norm.includes(normalize(key))) found.add(value)
  }
  return [...found]
}

export function parseCityLocation(text = '') {
  const norm = normalize(text)
  for (const entry of CITY_ALIASES) {
    if (entry.keys.some((k) => norm.includes(normalize(k)))) {
      return { city: entry.city, region: entry.region }
    }
  }
  return { city: text || 'TP. Hồ Chí Minh', region: 'Nam' }
}

export function getUserMatchingProfile() {
  const user = getUser()
  const profile = user?.profile ?? {}
  const discovery = user?.discoveryPrefs ?? {}
  const age = Number(profile.age) || 25

  const bioInterests = extractFromText(profile.bio, INTEREST_KEYWORDS)
  const savedInterests = user?.interests ?? []
  const interests = [...new Set([...savedInterests, ...bioInterests])]

  const personality =
    profile.personality ??
    extractFromText(profile.bio, PERSONALITY_KEYWORDS)[0] ??
    'Cân bằng'

  const { city, region } = parseCityLocation(profile.city)

  return {
    age,
    city,
    region,
    district: profile.district ?? '',
    locationLabel: profile.city || city,
    bio: profile.bio ?? '',
    occupation: profile.occupation ?? '',
    interests,
    personality,
    ageMin: discovery.ageMin ?? Math.max(18, age - 4),
    ageMax: discovery.ageMax ?? Math.min(60, age + 6),
    photo: profile.photo ?? getAvatarUrl(),
    identityVerified: Boolean(getUser()?.identityVerified),
    trustScore: getUser()?.trustScore,
  }
}

function scoreInterests(userInterests, candidateInterests) {
  if (!userInterests.length || !candidateInterests.length) return { score: 0.5, shared: [] }

  const userSet = new Set(userInterests.map((i) => normalize(i)))
  const shared = candidateInterests.filter((i) => userSet.has(normalize(i)))

  const union = new Set([...userInterests, ...candidateInterests].map(normalize))
  const score = shared.length / union.size
  return { score: Math.min(1, score + shared.length * 0.08), shared }
}

function scoreLocation(user, candidate) {
  if (normalize(user.city) === normalize(candidate.city)) {
    if (user.district && candidate.district && normalize(user.district) === normalize(candidate.district)) {
      return { score: 1, label: `Cùng khu vực ${candidate.district}` }
    }
    return { score: 0.85, label: `Cùng ${candidate.city}` }
  }
  if (user.region && candidate.region && user.region === candidate.region) {
    return { score: 0.55, label: `Cùng miền ${candidate.region}` }
  }
  return { score: 0.2, label: 'Khác thành phố' }
}

function scoreAge(user, candidateAge) {
  if (candidateAge >= user.ageMin && candidateAge <= user.ageMax) {
    const diff = Math.abs(candidateAge - user.age)
    return { score: 1 - diff * 0.06, label: `Độ tuổi phù hợp (${candidateAge})` }
  }
  const gap =
    candidateAge < user.ageMin ? user.ageMin - candidateAge : candidateAge - user.ageMax
  return { score: Math.max(0, 0.35 - gap * 0.08), label: 'Độ tuổi hơi chênh' }
}

function scorePersonality(userPersonality, candidatePersonality) {
  const compatible = PERSONALITY_COMPAT[userPersonality] ?? PERSONALITY_COMPAT['Cân bằng']
  const ok = compatible.includes(candidatePersonality)
  return {
    score: ok ? 0.95 : 0.45,
    label: ok ? `Tính cách hợp (${candidatePersonality})` : `Khác phong cách (${candidatePersonality})`,
  }
}

function scoreOccupation(userOcc, candidateJob) {
  const a = normalize(userOcc)
  const b = normalize(candidateJob)
  if (!a || !b) return { score: 0.5, label: null }
  const wordsA = a.split(/\s+/).filter((w) => w.length > 3)
  const hit = wordsA.some((w) => b.includes(w))
  return hit ? { score: 0.8, label: 'Ngành nghề tương đồng' } : { score: 0.4, label: null }
}

/** Tính % phù hợp và lý do */
export function scoreMatchCandidate(candidate, user = getUserMatchingProfile()) {
  const interests = scoreInterests(user.interests, candidate.interests ?? candidate.tags ?? [])
  const location = scoreLocation(user, candidate)
  const age = scoreAge(user, candidate.age)
  const personality = scorePersonality(user.personality, candidate.personality ?? 'Cân bằng')
  const occupation = scoreOccupation(user.occupation, candidate.job ?? '')

  const trustBoost = candidate.identityVerified ? 0.04 : 0

  const weighted =
    interests.score * 0.35 +
    location.score * 0.25 +
    age.score * 0.2 +
    personality.score * 0.12 +
    occupation.score * 0.08 +
    trustBoost

  const match = Math.round(Math.min(99, Math.max(52, weighted * 100)))

  const reasons = [
    interests.shared.length
      ? `Cùng sở thích: ${interests.shared.slice(0, 3).join(', ')}`
      : user.interests.length
        ? 'Bổ sung sở thích mới cho bạn'
        : null,
    location.label,
    age.label,
    personality.label,
    occupation.label,
    candidate.identityVerified ? 'Đã xác minh danh tính · uy tín cao' : null,
  ].filter(Boolean)

  return {
    ...candidate,
    match,
    reasons: reasons.slice(0, 4),
    matchBreakdown: {
      interests: Math.round(interests.score * 100),
      location: Math.round(location.score * 100),
      age: Math.round(age.score * 100),
      personality: Math.round(personality.score * 100),
    },
  }
}

/** Xếp hạng danh sách theo độ phù hợp */
export function rankMatchCandidates(candidates, user = getUserMatchingProfile()) {
  return candidates
    .map((c) => scoreMatchCandidate(c, user))
    .sort((a, b) => b.match - a.match)
}

export const MATCHING_STEPS = [
  'Đọc hồ sơ & sở thích của bạn',
  'Lọc theo vị trí & độ tuổi',
  'Phân tích tính cách & vibe',
  'Sắp xếp đối tượng phù hợp nhất',
]
