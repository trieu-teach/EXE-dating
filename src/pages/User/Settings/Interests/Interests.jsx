import { useMemo, useRef, useState } from 'react'
import AppShell from '../../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../../components/User/PageHeader/PageHeader.jsx'
import InlineInterestAdd from '../../../../components/User/InlineInterestAdd/InlineInterestAdd.jsx'
import InterestAddMenu from '../../../../components/User/InterestAddMenu/InterestAddMenu.jsx'
import {
  DEFAULT_SELECTED_INTERESTS,
  GROUP_ICONS,
  INTEREST_GROUPS,
  OTHER_INTERESTS_GROUP,
  TAG_ICONS,
  iconForTag,
} from '../../../../data/interests.js'
import { addCustomInterest, getStoredInterests } from '../../../../utils/interestsStorage.js'
import { saveUser } from '../../../../utils/session.js'
import '../../../../styles/settings-shared.css'
import './Interests.css'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function Interests() {
  const topRef = useRef(null)
  const otherGroupRef = useRef(null)

  const [search, setSearch] = useState('')
  const [stored, setStored] = useState(() => getStoredInterests())
  const [selected, setSelected] = useState(
    () => new Set(stored.interests.length ? stored.interests : DEFAULT_SELECTED_INTERESTS),
  )
  const [topEditorOpen, setTopEditorOpen] = useState(false)
  const [otherEditorOpen, setOtherEditorOpen] = useState(false)

  const otherTags = stored.customInterests

  const groupsWithOther = useMemo(
    () => ({
      ...INTEREST_GROUPS,
      [OTHER_INTERESTS_GROUP]: otherTags,
    }),
    [otherTags],
  )

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groupsWithOther

    return Object.fromEntries(
      Object.entries(groupsWithOther)
        .map(([group, tags]) => [
          group,
          tags.filter((tag) => tag.toLowerCase().includes(q)),
        ])
        .filter(([, tags]) => tags.length > 0 || group === OTHER_INTERESTS_GROUP),
    )
  }, [search, groupsWithOther])

  const selectedList = useMemo(() => Array.from(selected), [selected])

  function refreshStored() {
    setStored(getStoredInterests())
  }

  function toggleTag(tag) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  function clearAll() {
    setSelected(new Set())
  }

  function scrollToRef(ref) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openTopEditor() {
    setTopEditorOpen(true)
    setOtherEditorOpen(false)
    scrollToRef(topRef)
    window.setTimeout(() => {
      topRef.current?.querySelector('.inline-interest-add__input')?.focus()
    }, 400)
  }

  function openOtherEditor() {
    setOtherEditorOpen(true)
    setTopEditorOpen(false)
    scrollToRef(otherGroupRef)
    window.setTimeout(() => {
      otherGroupRef.current?.querySelector('.inline-interest-add__input')?.focus()
    }, 400)
  }

  function handleAddOther(label) {
    const added = addCustomInterest(label)
    if (!added) return
    refreshStored()
    setSelected((prev) => new Set([...prev, added]))
    setTopEditorOpen(false)
    setOtherEditorOpen(false)
  }

  return (
    <AppShell activeNav="discovery">
      <div className="settings-page interests-page">
        <PageHeader title="Sở thích chi tiết" backTo="/settings/discovery" />

        <div className="settings-panel interests-panel" ref={topRef} id="interests-page-top">
          <div className="interests-search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="interests-search-input"
              placeholder="Tìm sở thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm sở thích"
            />
          </div>

          <div className="interests-toolbar">
            <div className="interests-toolbar__count">
              <span className="interests-toolbar__badge">{selected.size}</span>
              <span>đã chọn</span>
            </div>
            <div className="interests-toolbar__actions">
              <InterestAddMenu
                onEditAtTop={openTopEditor}
                onEditInSidebar={openOtherEditor}
                topLabel="Lên đầu trang (ô tìm)"
                sidebarLabel={`Thêm tại "${OTHER_INTERESTS_GROUP}"`}
              />
              {selected.size > 0 && (
                <button type="button" className="interests-clear-btn" onClick={clearAll}>
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {topEditorOpen && (
            <div className="interests-inline-editor interests-inline-editor--top">
              <p>Thêm sở thích tùy chỉnh — sẽ nằm trong nhóm &quot;{OTHER_INTERESTS_GROUP}&quot;.</p>
              <InlineInterestAdd
                onAdd={handleAddOther}
                onCancel={() => setTopEditorOpen(false)}
              />
            </div>
          )}

          {selectedList.length > 0 && (
            <div className="interests-selected-preview">
              {selectedList.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="interests-selected-chip"
                  onClick={() => toggleTag(tag)}
                  aria-label={`Bỏ chọn ${tag}`}
                >
                  <span>{TAG_ICONS[tag] ?? iconForTag(tag)}</span>
                  {tag}
                  <span className="interests-selected-chip__x">×</span>
                </button>
              ))}
            </div>
          )}

          <div className="interests-groups">
            {Object.entries(filteredGroups).map(([group, tags]) => (
              <section
                key={group}
                className={`interest-group${group === OTHER_INTERESTS_GROUP ? ' interest-group--other' : ''}`}
                ref={group === OTHER_INTERESTS_GROUP ? otherGroupRef : undefined}
                id={group === OTHER_INTERESTS_GROUP ? 'interests-other-group' : undefined}
              >
                <header className="interest-group__head">
                  <span className="interest-group__icon" aria-hidden="true">
                    {GROUP_ICONS[group]}
                  </span>
                  <h2 className="interest-group__title">{group}</h2>
                  {group === OTHER_INTERESTS_GROUP && (
                    <InterestAddMenu
                      className="interest-group__add"
                      onEditAtTop={openTopEditor}
                      onEditInSidebar={openOtherEditor}
                      topLabel="Lên đầu trang"
                      sidebarLabel="Thêm tại đây"
                    />
                  )}
                </header>

                <div className="interest-group__grid">
                  {tags.length === 0 && group === OTHER_INTERESTS_GROUP && !otherEditorOpen && (
                    <p className="interest-group__empty">
                      Chưa có sở thích khác — bấm (+) để thêm.
                    </p>
                  )}
                  {tags.map((tag) => {
                    const isSelected = selected.has(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`interest-chip${isSelected ? ' interest-chip--selected' : ''}`}
                        onClick={() => toggleTag(tag)}
                        aria-pressed={isSelected}
                      >
                        <span className="interest-chip__icon" aria-hidden="true">
                          {TAG_ICONS[tag] ?? iconForTag(tag)}
                        </span>
                        <span className="interest-chip__label">{tag}</span>
                        {isSelected && (
                          <span className="interest-chip__check" aria-hidden="true">
                            <CheckIcon />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {group === OTHER_INTERESTS_GROUP && otherEditorOpen && (
                  <InlineInterestAdd
                    onAdd={handleAddOther}
                    onCancel={() => setOtherEditorOpen(false)}
                    placeholder="Nhập sở thích khác..."
                  />
                )}
              </section>
            ))}
          </div>

          <div className="interests-footer">
            <button
              type="button"
              className="interests-apply-btn"
              onClick={() => {
                const interests = [...selected]
                saveUser({
                  interests,
                  customInterests: stored.customInterests,
                })
              }}
            >
              <CheckIcon />
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default Interests
