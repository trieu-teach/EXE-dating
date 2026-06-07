import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import InlineInterestAdd from '../../../components/User/InlineInterestAdd/InlineInterestAdd.jsx'
import InterestAddMenu from '../../../components/User/InterestAddMenu/InterestAddMenu.jsx'
import {
  OTHER_INTERESTS_GROUP,
  SEARCH_PRESET_TAGS,
  iconForTag,
  interestTagId,
  isOtherInterest,
} from '../../../data/interests.js'
import { useAsync } from '../../../hooks/useAsync.js'
import { addCustomInterest, getStoredInterests } from '../../../utils/interestsStorage.js'
import './Search.css'

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h4a8 8 0 018 8z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function buildTagCatalog(stored) {
  const byId = new Map()
  SEARCH_PRESET_TAGS.forEach((t) => byId.set(t.id, { ...t, isOther: false }))

  const otherLabels = [
    ...new Set([
      ...stored.customInterests,
      ...stored.interests.filter((label) => isOtherInterest(label, stored.customInterests)),
    ]),
  ]

  otherLabels.forEach((label) => {
    const id = interestTagId(label)
    if (!byId.has(id)) {
      byId.set(id, { id, label, icon: iconForTag(label), isOther: true })
    }
  })

  return byId
}

function initialActiveTagIds(stored, catalog) {
  const ids = []
  for (const label of stored.interests) {
    const preset = SEARCH_PRESET_TAGS.find((t) => t.label === label)
    if (preset) ids.push(preset.id)
    else {
      const id = interestTagId(label)
      if (catalog.has(id)) ids.push(id)
    }
  }
  if (!ids.length) return ['music', 'art']
  return [...new Set(ids)]
}

function Search() {
  const topInterestsRef = useRef(null)
  const sidebarInterestsRef = useRef(null)
  const topInputRef = useRef(null)
  const sidebarInputRef = useRef(null)

  const [stored, setStored] = useState(() => getStoredInterests())
  const tagCatalog = useMemo(() => buildTagCatalog(stored), [stored])

  const { data: filterOptions, loading: filtersLoading } = useAsync(
    () => searchService.getFilters(),
    [],
  )

  const [mood, setMood] = useState('')
  const [wantToGo, setWantToGo] = useState('')
  const [cityId, setCityId] = useState('hcm')
  const [proximity, setProximity] = useState('city')
  const [gender, setGender] = useState('all')
  const [ageMax, setAgeMax] = useState(30)
  const [activeTags, setActiveTags] = useState(() => initialActiveTagIds(stored, tagCatalog))
  const [topEditorOpen, setTopEditorOpen] = useState(false)
  const [sidebarEditorOpen, setSidebarEditorOpen] = useState(false)

  const presetTags = SEARCH_PRESET_TAGS
  const otherTags = useMemo(
    () => [...tagCatalog.values()].filter((t) => t.isOther),
    [tagCatalog],
  )

  const searchParams = useMemo(
    () => ({
      mood: mood || undefined,
      wantToGo: wantToGo || undefined,
      cityId,
      proximity,
      gender,
      ageMax,
      interests: activeTags
        .map((id) => tagCatalog.get(id)?.label)
        .filter(Boolean),
    }),
    [mood, wantToGo, cityId, proximity, gender, ageMax, activeTags, tagCatalog],
  )

  const runSearch = useCallback(() => searchService.search(searchParams), [searchParams])

  const {
    data: searchData,
    loading: resultsLoading,
    error,
    refetch,
  } = useAsync(runSearch, [searchParams])

  const results = searchData?.results ?? []
  const meta = searchData?.meta
  const moods = filterOptions?.moods ?? []
  const wantToGoOptions = filterOptions?.wantToGo ?? []
  const cities = filterOptions?.cities ?? []
  const proximityOptions = filterOptions?.proximity ?? []

  const selectedCity = cities.find((c) => c.id === cityId)

  function refreshStored() {
    setStored(getStoredInterests())
  }

  function toggleTag(tagId) {
    setActiveTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }

  function removeTag(tagId) {
    setActiveTags((prev) => prev.filter((id) => id !== tagId))
  }

  function resetSmartFilters() {
    setMood('')
    setWantToGo('')
  }

  function scrollToRef(ref, { focusSelector } = {}) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (focusSelector) {
      window.setTimeout(() => {
        ref.current?.querySelector(focusSelector)?.focus()
      }, 400)
    }
  }

  function openTopEditor() {
    setTopEditorOpen(true)
    setSidebarEditorOpen(false)
    scrollToRef(topInterestsRef, { focusSelector: '.inline-interest-add__input' })
  }

  function openSidebarEditor() {
    setSidebarEditorOpen(true)
    setTopEditorOpen(false)
    scrollToRef(sidebarInterestsRef, { focusSelector: '.inline-interest-add__input' })
  }

  function handleAddInterest(label) {
    const added = addCustomInterest(label)
    if (!added) return
    refreshStored()
    const id = interestTagId(added)
    setActiveTags((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setTopEditorOpen(false)
    setSidebarEditorOpen(false)
  }

  const proximityHint =
    proximity === 'district'
      ? `Ưu tiên người trong ~5 km tại ${selectedCity?.label ?? 'thành phố của bạn'}`
      : proximity === 'city'
        ? `Chỉ hiện người ở ${selectedCity?.label ?? 'cùng thành phố'}`
        : `Kết nối cùng miền ${selectedCity?.region ?? ''}`

  const activeTagItems = activeTags
    .map((id) => tagCatalog.get(id))
    .filter(Boolean)

  return (
    <AppShell activeNav="search">
      <div className="search-page">
        <header className="search-page__header" ref={topInterestsRef} id="search-interests-top">
          <div>
            <h1>Tìm người gần bạn</h1>
            <p className="search-page__subtitle">
              Kết nối theo cảm xúc hôm nay, nơi muốn đi và khoảng cách thật — cùng quận, cùng TP
              hoặc cùng miền.
            </p>
          </div>
          <div className="search-page__header-actions">
            <Link to="/settings/interests" className="search-page__edit">
              Sửa sở thích đầy đủ
            </Link>
            <InterestAddMenu
              onEditAtTop={openTopEditor}
              onEditInSidebar={openSidebarEditor}
              topLabel="Chỉnh ở đầu trang"
              sidebarLabel="Chỉnh tại bộ lọc trái"
            />
          </div>

          {topEditorOpen && (
            <div className="search-interests-top-editor" ref={topInputRef}>
              <p className="search-interests-top-editor__hint">
                Thêm sở thích tùy chỉnh — sẽ xuất hiện trong mục &quot;{OTHER_INTERESTS_GROUP}&quot;
                ở bộ lọc bên trái.
              </p>
              <InlineInterestAdd
                onAdd={handleAddInterest}
                onCancel={() => setTopEditorOpen(false)}
                placeholder="VD: Board game, Podcast..."
              />
            </div>
          )}
        </header>

        <aside className="search-filters surface-glass">
          <section className="search-filters__block search-filters__block--highlight">
            <h2 className="search-filters__heading">
              <span aria-hidden="true">📍</span> Bạn đang ở đâu?
            </h2>
            <label className="search-field">
              <span>Thành phố / khu vực</span>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="search-select"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} · Miền {c.region}
                  </option>
                ))}
              </select>
            </label>

            <span className="search-filters__label">Phạm vi kết nối</span>
            <div className="search-proximity-options">
              {proximityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`search-proximity-btn${proximity === opt.id ? ' search-proximity-btn--active' : ''}`}
                  onClick={() => setProximity(opt.id)}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </button>
              ))}
            </div>
            <p className="search-filters__hint">{proximityHint}</p>
          </section>

          <section className="search-filters__block">
            <h2 className="search-filters__heading">
              <span aria-hidden="true">💭</span> Cảm xúc hôm nay
            </h2>
            <p className="search-filters__block-desc">Tìm người có vibe phù hợp tâm trạng của bạn</p>
            <div className="search-mood-grid">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`search-mood-btn${mood === m.id ? ' search-mood-btn--active' : ''}`}
                  onClick={() => setMood(mood === m.id ? '' : m.id)}
                  title={m.desc}
                >
                  <span className="search-mood-btn__icon">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="search-filters__block">
            <h2 className="search-filters__heading">
              <span aria-hidden="true">🗺️</span> Muốn đi đâu hôm nay?
            </h2>
            <div className="search-want-grid">
              {wantToGoOptions.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`search-want-btn${wantToGo === w.id ? ' search-want-btn--active' : ''}`}
                  onClick={() => setWantToGo(wantToGo === w.id ? '' : w.id)}
                >
                  <span>{w.icon}</span>
                  {w.label}
                </button>
              ))}
            </div>
          </section>

          {(mood || wantToGo) && (
            <button type="button" className="search-reset-smart" onClick={resetSmartFilters}>
              Xóa bộ lọc cảm xúc & địa điểm
            </button>
          )}

          <section
            className="search-filters__block search-filters__block--divider search-filters__block--interests"
            id="search-filter-interests"
            ref={sidebarInterestsRef}
          >
            <div className="search-filters__label-row">
              <span className="search-filters__label search-filters__label--inline">
                Sở thích đang lọc
              </span>
              <InterestAddMenu
                onEditAtTop={openTopEditor}
                onEditInSidebar={openSidebarEditor}
                topLabel="Lên đầu trang"
                sidebarLabel="Chỉnh tại đây"
              />
            </div>
            <div className="search-filters__tags">
              {activeTagItems.length === 0 && (
                <span className="search-filters__empty">Chưa chọn sở thích nào</span>
              )}
              {activeTagItems.map((tag) => (
                <span key={tag.id} className="search-filter-tag">
                  <span>{tag.icon}</span>
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    aria-label={`Bỏ ${tag.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <span className="search-filters__label">Gợi ý nhanh</span>
            <div className="search-tag-picker">
              {presetTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`search-tag-picker__btn${activeTags.includes(tag.id) ? ' search-tag-picker__btn--on' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
            </div>

            <div className="search-filters__other">
              <div className="search-filters__label-row">
                <span className="search-filters__label search-filters__label--inline">
                  {OTHER_INTERESTS_GROUP}
                </span>
                <InterestAddMenu
                  onEditAtTop={openTopEditor}
                  onEditInSidebar={openSidebarEditor}
                  topLabel="Lên đầu trang"
                  sidebarLabel="Thêm tại bộ lọc"
                />
              </div>
              <p className="search-filters__other-desc">
                Sở thích bạn tự thêm — bấm (+) để chỉnh ở đầu trang hoặc ngay tại đây.
              </p>
              <div className="search-tag-picker search-tag-picker--other">
                {otherTags.length === 0 && !sidebarEditorOpen && (
                  <span className="search-filters__empty">Chưa có — bấm (+) để thêm</span>
                )}
                {otherTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`search-tag-picker__btn${activeTags.includes(tag.id) ? ' search-tag-picker__btn--on' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.icon} {tag.label}
                  </button>
                ))}
              </div>
              {sidebarEditorOpen && (
                <div ref={sidebarInputRef}>
                  <InlineInterestAdd
                    onAdd={handleAddInterest}
                    onCancel={() => setSidebarEditorOpen(false)}
                    placeholder="Thêm sở thích khác..."
                  />
                </div>
              )}
            </div>
          </section>

          <div className="search-filters__gender">
            <span className="search-filters__label">Giới tính</span>
            <div className="search-gender-options">
              {[
                { id: 'male', label: 'Nam' },
                { id: 'female', label: 'Nữ' },
                { id: 'all', label: 'Tất cả' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`search-gender-btn${gender === opt.id ? ' search-gender-btn--active' : ''}`}
                  onClick={() => setGender(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-filters__age">
            <label className="search-filters__label">
              Độ tuổi
              <span>18 – {ageMax}</span>
            </label>
            <input
              type="range"
              min="18"
              max="50"
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
            />
          </div>
        </aside>

        <div className="search-results">
          <AsyncContent loading={filtersLoading || resultsLoading} error={error} onRetry={refetch}>
            <div className="search-results__summary">
              <p className="search-results__count">
                Tìm thấy <strong>{meta?.total ?? results.length}</strong> người
                {meta?.proximity && (
                  <>
                    {' '}
                    · <span className="search-results__scope">{meta.proximity}</span>
                    {meta.city && <> tại {meta.city}</>}
                  </>
                )}
              </p>
              {(mood || wantToGo) && (
                <p className="search-results__smart">
                  {mood && (
                    <span>
                      Cảm xúc:{' '}
                      {moods.find((m) => m.id === mood)?.icon}{' '}
                      {moods.find((m) => m.id === mood)?.label}
                    </span>
                  )}
                  {wantToGo && (
                    <span>
                      Muốn đi:{' '}
                      {wantToGoOptions.find((w) => w.id === wantToGo)?.icon}{' '}
                      {wantToGoOptions.find((w) => w.id === wantToGo)?.label}
                    </span>
                  )}
                </p>
              )}
            </div>

            {results.length === 0 ? (
              <div className="search-empty dating-empty">
                <strong>Chưa có ai phù hợp</strong>
                <p>
                  Thử mở rộng sang &quot;Cùng thành phố&quot; hoặc &quot;Cùng miền&quot;, hoặc bỏ
                  bớt bộ lọc cảm xúc.
                </p>
              </div>
            ) : (
              <div className="search-results__grid">
                {results.map((person) => (
                  <article key={person.id} className="search-person-card">
                    <div className="search-person-card__photo">
                      <img src={person.image} alt={`${person.name}, ${person.age}`} />
                      <span className="search-person-card__match">{person.match}% phù hợp</span>
                      {person.distanceKm != null && (
                        <span className="search-person-card__distance">
                          <LocationIcon />
                          {person.distanceKm < 1
                            ? '< 1 km'
                            : `${person.distanceKm.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                    <div className="search-person-card__body">
                      <h2>
                        {person.name}, {person.age}
                      </h2>
                      <p className="search-person-card__city">
                        {person.district}, {person.city}
                      </p>
                      {person.wantToGoLabels?.length > 0 && (
                        <p className="search-person-card__want">
                          Muốn đi: {person.wantToGoLabels.join(' · ')}
                        </p>
                      )}
                      <ul className="search-person-card__tags">
                        {person.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                      <div className="search-person-card__actions">
                        <Link to="/match-success" className="search-connect-btn">
                          Kết nối ngay
                        </Link>
                        <Link to="/chat" className="search-msg-btn" aria-label="Nhắn tin">
                          <ChatIcon />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </AsyncContent>
        </div>
      </div>
    </AppShell>
  )
}

export default Search
