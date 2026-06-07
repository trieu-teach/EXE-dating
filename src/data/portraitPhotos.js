/** Ảnh chân dung mẫu (Unsplash) — đồng bộ khắp app, crop khuôn mặt */

export function portraitUrl(photoId, width = 800) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=88&auto=format&fit=crop&crop=faces`
}

/** Nam — ánh sáng tự nhiên, nụ cười nhẹ */
export const MALE_PORTRAITS = {
  urban: portraitUrl('1519085360353-028bae5c38f2'),
  outdoor: portraitUrl('1504257432387-005f4d10012b'),
  professional: portraitUrl('1560250097-0b93528c311a'),
  friendly: portraitUrl('1599566150163-29194dcaad36'),
}

/** Nữ — tông ấm, phù hợp hồ sơ hẹn hò */
export const FEMALE_PORTRAITS = {
  natural: portraitUrl('1544005313-94ddf0286df2'),
  bright: portraitUrl('1580489944761-15a19d654956'),
  elegant: portraitUrl('1531746020798-e6953b0a0cfa'),
  modern: portraitUrl('1529626455614-aa1d45c0bb07'),
  warm: portraitUrl('1488716821485-d46b26b3f640'),
  confident: portraitUrl('1573496359142-b8d87734a5a2'),
}

/** Avatar mặc định của user (chưa upload ảnh) */
export const DEFAULT_USER_AVATAR = portraitUrl('1580489944761-15a19d654956', 400)

/** Ảnh đại diện mặc định trong thư viện / picker */
export const DEFAULT_AVATAR = DEFAULT_USER_AVATAR

/** Theo id nhân vật mock — discovery & search */
export const PERSON_IMAGES = {
  minh: MALE_PORTRAITS.urban,
  linh: FEMALE_PORTRAITS.bright,
  hoang: MALE_PORTRAITS.professional,
  thao: FEMALE_PORTRAITS.natural,
  duc: MALE_PORTRAITS.friendly,
  my: FEMALE_PORTRAITS.modern,
  khoa: MALE_PORTRAITS.outdoor,
  huong: FEMALE_PORTRAITS.warm,
  'linh-hn': FEMALE_PORTRAITS.confident,
  'minh-dn': MALE_PORTRAITS.outdoor,
  'lan-ct': FEMALE_PORTRAITS.elegant,
}

export function personImage(id, width = 800) {
  const base = PERSON_IMAGES[id]
  if (!base) return DEFAULT_USER_AVATAR
  if (width === 800) return base
  const photoId = base.match(/photo-([^?]+)/)?.[1]
  return photoId ? portraitUrl(photoId, width) : base
}
