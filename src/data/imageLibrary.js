import {
  DEFAULT_AVATAR,
  FEMALE_PORTRAITS,
  MALE_PORTRAITS,
  portraitUrl,
} from './portraitPhotos.js'

/** Thư viện ảnh mẫu — dùng khi chưa cấu hình Google CSE */
export const IMAGE_LIBRARY = [
  {
    id: 'lib-1',
    url: FEMALE_PORTRAITS.modern,
    tags: ['nữ', 'chân dung', 'cười', 'hồ sơ'],
    label: 'Chân dung nữ',
  },
  {
    id: 'lib-2',
    url: MALE_PORTRAITS.urban,
    tags: ['nam', 'chân dung', 'ngoài trời'],
    label: 'Chân dung nam',
  },
  {
    id: 'lib-3',
    url: FEMALE_PORTRAITS.bright,
    tags: ['nữ', 'tự nhiên', 'hồ sơ'],
    label: 'Tự nhiên',
  },
  {
    id: 'lib-4',
    url: MALE_PORTRAITS.outdoor,
    tags: ['nam', 'cafe', 'ấm'],
    label: 'Cafe',
  },
  {
    id: 'lib-5',
    url: FEMALE_PORTRAITS.elegant,
    tags: ['nữ', 'du lịch', 'biển'],
    label: 'Du lịch',
  },
  {
    id: 'lib-6',
    url: portraitUrl('1516589178581-6cd7833ae07b', 600),
    tags: ['cặp đôi', 'hẹn hò', 'tình yêu'],
    label: 'Cặp đôi',
  },
  {
    id: 'lib-7',
    url: portraitUrl('1522673607200-164d1b6fc486', 600),
    tags: ['cặp đôi', 'hẹn hò', 'vui'],
    label: 'Hẹn hò',
  },
  {
    id: 'lib-8',
    url: portraitUrl('1469474968028-56623f02e42e', 600),
    tags: ['phong cảnh', 'thiên nhiên', 'nền'],
    label: 'Thiên nhiên',
  },
  {
    id: 'lib-9',
    url: portraitUrl('1476514525535-07fb3b4e453f', 600),
    tags: ['hồ', 'du lịch', 'nền'],
    label: 'Hồ núi',
  },
  {
    id: 'lib-10',
    url: MALE_PORTRAITS.friendly,
    tags: ['nam', 'mỉm cười', 'hồ sơ'],
    label: 'Mỉm cười',
  },
  {
    id: 'lib-11',
    url: FEMALE_PORTRAITS.natural,
    tags: ['nữ', 'thời trang', 'chân dung'],
    label: 'Thời trang',
  },
  {
    id: 'lib-12',
    url: FEMALE_PORTRAITS.warm,
    tags: ['nữ', 'cafe', 'ấm'],
    label: 'Cafe ấm',
  },
]

export { DEFAULT_AVATAR }
