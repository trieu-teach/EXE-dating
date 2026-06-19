import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, formatDistance } from '../../../utils/format.js'
import { SearchIcon, PinIcon, UserIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button.jsx'
import './Search.css'

export default function Search() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filters, setFilters] = useState({ interests: [] })
  const [params, setParams] = useState({
    gender: '',
    city: '',
    minAge: '',
    maxAge: '',
    interests: '',
    distanceKm: '',
    sort: 'distance',
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    searchService.filters()
      .then((data) => setFilters(data || { interests: [] }))
      .catch(() => setFilters({ interests: [] }))
  }, [])

  const selectedInterests = params.interests ? params.interests.split(',').filter(Boolean) : []

  const toggleInterest = (id) => {
    const cur = selectedInterests
    const next = cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]
    setParams({ ...params, interests: next.join(',') })
  }

  const run = async (e) => {
    e?.preventDefault?.()
    setLoading(true)
    setHasSearched(true)
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null))
      const res = await searchService.results(clean)
      setResults(Array.isArray(res) ? res : (res?.items ?? []))
    } catch (err) {
      toast.error(err?.message || 'Tìm kiếm thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-root">
      {/* Hero */}
      <div className="search-hero">
        <div className="search-hero-icon">
          <SearchIcon size={20} />
        </div>
        <div>
          <h1 className="search-hero-title">Tìm kiếm nâng cao</h1>
          <p className="search-hero-subtitle">Tìm người phù hợp với tiêu chí của bạn</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={run} className="search-form-card">
        {/* Gender + City */}
        <div className="search-row">
          <div className="search-field">
            <label>Giới tính</label>
            <select value={params.gender} onChange={(e) => setParams({ ...params, gender: e.target.value })}>
              <option value="">Tất cả</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>
          <div className="search-field">
            <label>Thành phố</label>
            <input
              value={params.city}
              onChange={(e) => setParams({ ...params, city: e.target.value })}
              placeholder="VD: Hà Nội"
            />
          </div>
        </div>

        {/* Age range */}
        <div className="search-row">
          <div className="search-field">
            <label>Tuổi từ</label>
            <input
              type="number" min={18} max={99}
              value={params.minAge}
              onChange={(e) => setParams({ ...params, minAge: e.target.value })}
              placeholder="18"
            />
          </div>
          <div className="search-field">
            <label>Tuổi đến</label>
            <input
              type="number" min={18} max={99}
              value={params.maxAge}
              onChange={(e) => setParams({ ...params, maxAge: e.target.value })}
              placeholder="40"
            />
          </div>
        </div>

        {/* Distance + Sort */}
        <div className="search-row">
          <div className="search-field">
            <label>Khoảng cách (km)</label>
            <input
              type="number" min={1} max={500}
              value={params.distanceKm}
              onChange={(e) => setParams({ ...params, distanceKm: e.target.value })}
              placeholder="20"
            />
          </div>
          <div className="search-field">
            <label>Sắp xếp</label>
            <select value={params.sort} onChange={(e) => setParams({ ...params, sort: e.target.value })}>
              <option value="distance">Gần nhất</option>
              <option value="recent">Mới hoạt động</option>
              <option value="relevance">Phù hợp nhất</option>
            </select>
          </div>
        </div>

        {/* Interests */}
        {filters.interests?.length > 0 && (
          <div className="search-interests">
            <label className="search-interests-label">Sở thích</label>
            <div className="search-interest-chips">
              {filters.interests.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className={`search-interest-chip${selectedInterests.includes(String(i.id)) ? ' selected' : ''}`}
                  onClick={() => toggleInterest(String(i.id))}
                >
                  {i.name || i.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" size="full" disabled={loading}>
          {loading ? <span className="spinner" /> : <><SearchIcon size={16} /> Tìm kiếm</>}
        </Button>
      </form>

      {/* Results */}
      {hasSearched && results.length === 0 && !loading && (
        <div className="search-empty">
          <UserIcon size={32} />
          <p>Không tìm thấy ai phù hợp. Thử nới bộ lọc nhé.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            <span className="search-results-count">
              <UserIcon size={14} /> Tìm thấy {results.length} người
            </span>
          </div>
          <div className="search-results-grid">
            {results.map((r, i) => (
              <motion.div
                key={r.userId}
                className="search-result-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => navigate(`/profile/${r.userId}`)}
              >
                <div
                  className="search-result-photo"
                  style={{ backgroundImage: `url(${resolveImageUrl(r.photoUrl || r.avatarUrl)})` }}
                >
                  {r.isOnline && <span className="search-result-online" />}
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{r.displayName}{r.age ? `, ${r.age}` : ''}</div>
                  <div className="search-result-meta">
                    {r.city && <><PinIcon size={10} />{r.city}</>}
                    {r.distanceKm != null && <> · {formatDistance(r.distanceKm)}</>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
