import { useState } from 'react'
import FieldNote from '../FieldNote/FieldNote.jsx'
import {
  EMPTY_PROFILE_FORM,
  PERSONALITY_OPTIONS,
  PROFILE_FIELD_NOTES,
  SEXUAL_ORIENTATION_OPTIONS,
} from '../../../data/profileFields.js'
import { hasErrors, validateProfileForm } from '../../../utils/validation.js'
import './ProfileInfoForm.css'

function ProfileField({
  label,
  required,
  note,
  error,
  touched,
  children,
  htmlFor,
}) {
  return (
    <label
      className={`profile-field${required ? ' profile-field--required' : ' profile-field--optional'}${touched && error ? ' profile-field--error' : ''}`}
      htmlFor={htmlFor}
    >
      <span className="profile-field__label">
        {label}
        {required ? (
          <em className="profile-field__badge profile-field__badge--req">Bắt buộc</em>
        ) : (
          <em className="profile-field__badge">Tùy chọn</em>
        )}
      </span>
      {children}
      {touched && error && <p className="profile-field__error">{error}</p>}
      <FieldNote>{note}</FieldNote>
    </label>
  )
}

export function profileFormFromUser(user, data) {
  const profile = user?.profile ?? {}
  return {
    displayName: data?.displayName ?? profile.fullName ?? user?.name ?? '',
    username: data?.username ?? user?.username ?? '',
    age: data?.age ?? profile.age ?? '',
    city: data?.city ?? profile.city ?? data?.location ?? '',
    occupation: data?.occupation ?? profile.occupation ?? '',
    bio: data?.bio ?? profile.bio ?? '',
    personality: data?.personality ?? profile.personality ?? 'Cân bằng',
    shareSexualOrientation:
      data?.shareSexualOrientation ?? Boolean(data?.sexualOrientation ?? profile.sexualOrientation),
    sexualOrientation: data?.sexualOrientation ?? profile.sexualOrientation ?? '',
  }
}

export default function ProfileInfoForm({
  initialValues,
  onSubmit,
  submitLabel = 'Lưu thông tin',
  showActions = true,
}) {
  const [form, setForm] = useState({ ...EMPTY_PROFILE_FORM, ...initialValues })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'username' && typeof value === 'string') {
        next.username = value.toLowerCase().replace(/\s/g, '')
      }
      return next
    })
    if (touched[field]) {
      const nextForm = { ...form, [field]: value }
      if (field === 'username' && typeof value === 'string') {
        nextForm.username = value.toLowerCase().replace(/\s/g, '')
      }
      setErrors((prev) => ({
        ...prev,
        [field]: validateProfileForm(nextForm)[field],
      }))
    }
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateProfileForm(form)[field] }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formErrors = validateProfileForm(form)
    setErrors(formErrors)
    setTouched({
      displayName: true,
      username: true,
      age: true,
      city: true,
      occupation: true,
      bio: true,
      sexualOrientation: true,
    })
    if (hasErrors(formErrors)) return false
    onSubmit?.({
      ...form,
      username: form.username.trim().toLowerCase(),
      displayName: form.displayName.trim(),
      sexualOrientation: form.shareSexualOrientation ? form.sexualOrientation : '',
      shareSexualOrientation: form.shareSexualOrientation,
    })
    return true
  }

  return (
    <form className="profile-info-form" onSubmit={handleSubmit} noValidate>
      <section className="profile-info-form__section profile-info-form__section--required">
        <header className="profile-info-form__head">
          <h2>Thông tin bắt buộc</h2>
          <p>Cần điền đủ để hồ sơ được hiển thị và ghép đôi chính xác.</p>
        </header>

        <ProfileField
          label="Tên hiển thị"
          required
          note={PROFILE_FIELD_NOTES.displayName}
          error={errors.displayName}
          touched={touched.displayName}
          htmlFor="profile-displayName"
        >
          <input
            id="profile-displayName"
            type="text"
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            onBlur={() => touch('displayName')}
            placeholder="VD: Nguyễn Minh Anh"
            autoComplete="name"
          />
        </ProfileField>

        <ProfileField
          label="Username"
          required
          note={PROFILE_FIELD_NOTES.username}
          error={errors.username}
          touched={touched.username}
          htmlFor="profile-username"
        >
          <input
            id="profile-username"
            type="text"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            onBlur={() => touch('username')}
            placeholder="minhanh_23"
            autoComplete="username"
            spellCheck={false}
          />
        </ProfileField>

        <div className="profile-info-form__row">
          <ProfileField
            label="Tuổi"
            required
            note={PROFILE_FIELD_NOTES.age}
            error={errors.age}
            touched={touched.age}
            htmlFor="profile-age"
          >
            <input
              id="profile-age"
              type="number"
              min="18"
              max="99"
              value={form.age}
              onChange={(e) => updateField('age', e.target.value)}
              onBlur={() => touch('age')}
              placeholder="25"
            />
          </ProfileField>

          <ProfileField
            label="Thành phố"
            required
            note={PROFILE_FIELD_NOTES.city}
            error={errors.city}
            touched={touched.city}
            htmlFor="profile-city"
          >
            <input
              id="profile-city"
              type="text"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              onBlur={() => touch('city')}
              placeholder="VD: Quận 3, TP. Hồ Chí Minh"
            />
          </ProfileField>
        </div>
      </section>

      <section className="profile-info-form__section profile-info-form__section--optional">
        <header className="profile-info-form__head">
          <h2>Thông tin không bắt buộc</h2>
          <p>Bạn có thể bỏ trống — bổ sung sau vẫn được.</p>
        </header>

        <ProfileField
          label="Nghề nghiệp"
          note={PROFILE_FIELD_NOTES.occupation}
          error={errors.occupation}
          touched={touched.occupation}
          htmlFor="profile-occupation"
        >
          <input
            id="profile-occupation"
            type="text"
            value={form.occupation}
            onChange={(e) => updateField('occupation', e.target.value)}
            onBlur={() => touch('occupation')}
            placeholder="VD: Nhân viên marketing"
          />
        </ProfileField>

        <ProfileField
          label="Tính cách / phong cách hẹn hò"
          note={PROFILE_FIELD_NOTES.personality}
          htmlFor="profile-personality"
        >
          <select
            id="profile-personality"
            value={form.personality}
            onChange={(e) => updateField('personality', e.target.value)}
          >
            {PERSONALITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </ProfileField>

        <ProfileField
          label="Giới thiệu ngắn"
          note={PROFILE_FIELD_NOTES.bio}
          error={errors.bio}
          touched={touched.bio}
          htmlFor="profile-bio"
        >
          <textarea
            id="profile-bio"
            rows={4}
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            onBlur={() => touch('bio')}
            placeholder="Sở thích, phong cách hẹn hò..."
          />
        </ProfileField>

        <div className="profile-info-form__xhtd">
          <label className="profile-info-form__toggle">
            <input
              type="checkbox"
              checked={form.shareSexualOrientation}
              onChange={(e) => {
                const checked = e.target.checked
                updateField('shareSexualOrientation', checked)
                if (!checked) updateField('sexualOrientation', '')
              }}
            />
            <span>Chia sẻ xu hướng tính dục trên hồ sơ</span>
          </label>
          <FieldNote>{PROFILE_FIELD_NOTES.sexualOrientation}</FieldNote>

          {form.shareSexualOrientation && (
            <ProfileField
              label="Xu hướng tính dục"
              note="Chọn một mục hoặc để trống nếu chỉ muốn bật quyền chia sẻ sau."
              htmlFor="profile-orientation"
            >
              <select
                id="profile-orientation"
                value={form.sexualOrientation}
                onChange={(e) => updateField('sexualOrientation', e.target.value)}
              >
                {SEXUAL_ORIENTATION_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </ProfileField>
          )}
        </div>
      </section>

      {showActions && (
        <div className="profile-info-form__actions">
          <button type="submit" className="profile-info-form__submit">
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  )
}
