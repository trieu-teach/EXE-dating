/** Gợi ý / quy tắc nội dung — hiển thị dưới từng trường */
export const PROFILE_FIELD_NOTES = {
  displayName:
    'Tên hiển thị chỉ gồm chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt (@, #, …).',
  username:
    'Username dùng để đăng nhập/tìm bạn: 3–20 ký tự, chữ thường, số và gạch dưới; không khoảng trắng, không viết hoa.',
  email: 'Email hợp lệ (vd: ten@gmail.com), tối đa 254 ký tự.',
  password:
    'Mật khẩu: 8–64 ký tự, có chữ hoa, chữ thường, số, ít nhất 1 ký tự đặc biệt (!@#$…); không chứa khoảng trắng.',
  age: 'Tuổi từ 18 đến 99, chỉ nhập số.',
  city: 'Thành phố / quận bạn đang sống (2–80 ký tự).',
  occupation: 'Tùy chọn — mô tả nghề nghiệp ngắn gọn (tối đa 80 ký tự).',
  bio: 'Tùy chọn — giới thiệu bản thân (tối đa 300 ký tự).',
  personality: 'Tùy chọn — giúp gợi ý người phù hợp hơn.',
  sexualOrientation:
    'Tùy chọn — bạn có quyền khai báo hoặc không. Chỉ hiển thị khi bạn bật “Chia sẻ xu hướng tính dục”.',
}

export const SEXUAL_ORIENTATION_OPTIONS = [
  { value: '', label: '— Chọn (nếu muốn chia sẻ) —' },
  { value: 'heterosexual', label: 'Dị tính' },
  { value: 'homosexual', label: 'Đồng tính' },
  { value: 'bisexual', label: 'Song tính' },
  { value: 'pansexual', label: 'Toàn tính' },
  { value: 'asexual', label: 'Vô tính' },
  { value: 'queer', label: 'Queer' },
  { value: 'other', label: 'Khác' },
  { value: 'prefer_not_say', label: 'Không muốn nêu cụ thể' },
]

export const PERSONALITY_OPTIONS = [
  'Hướng ngoại',
  'Hướng nội',
  'Cân bằng',
  'Lãng mạn',
  'Thực tế',
]

export const EMPTY_PROFILE_FORM = {
  displayName: '',
  username: '',
  age: '',
  city: '',
  occupation: '',
  bio: '',
  personality: 'Cân bằng',
  shareSexualOrientation: false,
  sexualOrientation: '',
}
