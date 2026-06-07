/** Mock tìm kiếm — ưu tiên kết nối gần (cùng quận / TP / miền) */

import { personImage } from '../../data/portraitPhotos.js'

export const USER_DEFAULT_CITY = 'TP. Hồ Chí Minh'
export const USER_DEFAULT_DISTRICT = 'Quận 1'

export const MOOD_OPTIONS = [
  { id: 'vui', label: 'Vui vẻ', icon: '😊', desc: 'Tâm trạng tích cực, sẵn sàng trò chuyện' },
  { id: 'binh_yen', label: 'Bình yên', icon: '😌', desc: 'Thư thái, muốn gặp gỡ nhẹ nhàng' },
  { id: 'lang_man', label: 'Lãng mạn', icon: '🥰', desc: 'Muốn hẹn hò, tìm kết nối sâu' },
  { id: 'kham_pha', label: 'Khám phá', icon: '🎉', desc: 'Năng động, thích trải nghiệm mới' },
  { id: 'tam_su', label: 'Tâm sự', icon: '🤔', desc: 'Muốn trò chuyện thật lòng' },
]

/** Nơi muốn đi hôm nay */
export const WANT_TO_GO_OPTIONS = [
  { id: 'cafe', label: 'Quán cà phê', icon: '☕' },
  { id: 'cong_vien', label: 'Công viên / đi dạo', icon: '🌳' },
  { id: 'an_uong', label: 'Ăn uống', icon: '🍽️' },
  { id: 'trien_lam', label: 'Triển lãm / workshop', icon: '🎨' },
  { id: 'bien_song', label: 'Gần biển / ven sông', icon: '🌊' },
  { id: 'am_nhac', label: 'Live music', icon: '🎵' },
]

export const CITY_OPTIONS = [
  { id: 'hcm', label: 'TP. Hồ Chí Minh', region: 'Nam' },
  { id: 'hanoi', label: 'Hà Nội', region: 'Bắc' },
  { id: 'danang', label: 'Đà Nẵng', region: 'Trung' },
  { id: 'cantho', label: 'Cần Thơ', region: 'Nam' },
  { id: 'haiphong', label: 'Hải Phòng', region: 'Bắc' },
  { id: 'nhatrang', label: 'Nha Trang', region: 'Trung' },
]

/** Phạm vi kết nối gần */
export const PROXIMITY_OPTIONS = [
  { id: 'district', label: 'Cùng quận', desc: 'Trong bán kính ~5 km', maxKm: 5 },
  { id: 'city', label: 'Cùng thành phố', desc: 'Toàn TP bạn đang chọn', maxKm: 35 },
  { id: 'region', label: 'Cùng miền', desc: 'Bắc · Trung · Nam', maxKm: null },
]

export const MOCK_SEARCH_PEOPLE = [
  {
    id: 'thao',
    name: 'Thảo',
    age: 25,
    gender: 'female',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    region: 'Nam',
    distanceKm: 1.2,
    moodToday: 'vui',
    wantToGo: ['cafe', 'cong_vien'],
    wantToGoLabels: ['Quán cà phê', 'Phố đi bộ'],
    match: 94,
    tags: ['Cà phê', 'Nhiếp ảnh'],
    image: personImage('thao', 500),
  },
  {
    id: 'khoa',
    name: 'Khoa',
    age: 28,
    gender: 'male',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    region: 'Nam',
    distanceKm: 3.8,
    moodToday: 'kham_pha',
    wantToGo: ['trien_lam', 'an_uong'],
    wantToGoLabels: ['Triển lãm', 'Ăn uống'],
    match: 89,
    tags: ['Thiết kế', 'Ẩm thực'],
    image: personImage('khoa', 500),
  },
  {
    id: 'my',
    name: 'My',
    age: 24,
    gender: 'female',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    region: 'Nam',
    distanceKm: 8.5,
    moodToday: 'lang_man',
    wantToGo: ['bien_song', 'an_uong'],
    wantToGoLabels: ['Ven sông', 'Ăn tối'],
    match: 86,
    tags: ['Du lịch', 'Yoga'],
    image: personImage('my', 500),
  },
  {
    id: 'duc',
    name: 'Đức',
    age: 27,
    gender: 'male',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    region: 'Nam',
    distanceKm: 0.8,
    moodToday: 'tam_su',
    wantToGo: ['cafe', 'cong_vien'],
    wantToGoLabels: ['Cà phê', 'Công viên'],
    match: 91,
    tags: ['Sách', 'Chạy bộ'],
    image: personImage('duc', 500),
  },
  {
    id: 'huong',
    name: 'Hương',
    age: 26,
    gender: 'female',
    city: 'TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    region: 'Nam',
    distanceKm: 12,
    moodToday: 'binh_yen',
    wantToGo: ['cong_vien', 'cafe'],
    wantToGoLabels: ['Công viên', 'Cà phê'],
    match: 83,
    tags: ['Thiền', 'Cà phê'],
    image: personImage('huong', 500),
  },
  {
    id: 'linh-hn',
    name: 'Linh',
    age: 24,
    gender: 'female',
    city: 'Hà Nội',
    district: 'Ba Đình',
    region: 'Bắc',
    distanceKm: 4.2,
    moodToday: 'vui',
    wantToGo: ['cafe', 'trien_lam'],
    wantToGoLabels: ['Cà phê', 'Triển lãm'],
    match: 88,
    tags: ['Âm nhạc', 'Nghệ thuật'],
    image: personImage('linh-hn', 500),
  },
  {
    id: 'minh-dn',
    name: 'Minh',
    age: 26,
    gender: 'male',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    region: 'Trung',
    distanceKm: 2.1,
    moodToday: 'kham_pha',
    wantToGo: ['bien_song', 'am_nhac'],
    wantToGoLabels: ['Biển', 'Live music'],
    match: 85,
    tags: ['Leo núi', 'Âm nhạc'],
    image: personImage('minh-dn', 500),
  },
  {
    id: 'lan-ct',
    name: 'Lan',
    age: 23,
    gender: 'female',
    city: 'Cần Thơ',
    district: 'Ninh Kiều',
    region: 'Nam',
    distanceKm: 1.5,
    moodToday: 'lang_man',
    wantToGo: ['bien_song', 'an_uong'],
    wantToGoLabels: ['Sông nước', 'Ẩm thực'],
    match: 80,
    tags: ['Nấu ăn', 'Du lịch'],
    image: personImage('lan-ct', 500),
  },
]

/** Cảm xúc tương thích (mock) */
const MOOD_COMPAT = {
  vui: ['vui', 'kham_pha', 'binh_yen'],
  binh_yen: ['binh_yen', 'tam_su', 'vui'],
  lang_man: ['lang_man', 'binh_yen', 'tam_su'],
  kham_pha: ['kham_pha', 'vui', 'lang_man'],
  tam_su: ['tam_su', 'binh_yen', 'lang_man'],
}

export function filterSearchResults(people, params = {}) {
  const {
    mood,
    wantToGo,
    cityId = 'hcm',
    proximity = 'city',
    gender = 'all',
    ageMax = 50,
    interests = [],
  } = params

  const cityMeta = CITY_OPTIONS.find((c) => c.id === cityId) ?? CITY_OPTIONS[0]
  const proximityMeta = PROXIMITY_OPTIONS.find((p) => p.id === proximity) ?? PROXIMITY_OPTIONS[1]

  let list = [...people]

  // Vị trí — ưu tiên kết nối gần
  list = list.filter((p) => {
    if (proximity === 'region') {
      return p.region === cityMeta.region
    }
    if (proximity === 'city') {
      return p.city === cityMeta.label
    }
    // district — cùng TP + trong bán kính
    return p.city === cityMeta.label && p.distanceKm <= (proximityMeta.maxKm ?? 5)
  })

  if (gender !== 'all') {
    const g = gender === 'male' ? 'male' : 'female'
    list = list.filter((p) => p.gender === g)
  }

  list = list.filter((p) => p.age <= ageMax)

  if (mood) {
    const compatible = MOOD_COMPAT[mood] ?? [mood]
    list = list.filter((p) => compatible.includes(p.moodToday))
  }

  if (wantToGo) {
    list = list.filter((p) => p.wantToGo.includes(wantToGo))
  }

  if (interests.length) {
    list = list.filter((p) => interests.some((tag) => p.tags.includes(tag)))
  }

  // Sắp xếp: gần nhất + match cao
  list.sort((a, b) => {
    const scoreA = a.match - a.distanceKm * 0.5
    const scoreB = b.match - b.distanceKm * 0.5
    return scoreB - scoreA
  })

  return {
    results: list,
    meta: {
      city: cityMeta.label,
      region: cityMeta.region,
      proximity: proximityMeta.label,
      total: list.length,
    },
  }
}

export function getMoodLabel(moodId) {
  return MOOD_OPTIONS.find((m) => m.id === moodId)?.label ?? moodId
}
