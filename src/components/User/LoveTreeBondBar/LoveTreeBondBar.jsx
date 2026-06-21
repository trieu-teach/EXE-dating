import { Link } from 'react-router-dom'

const TREE_IMAGES_MINI = {
  seedling: '/assets/love-tree/tree-stage-seedling.png',
  sprout:  '/assets/love-tree/tree-stage-sprout.png',
  budding: '/assets/love-tree/tree-stage-budding.png',
  sparse:  '/assets/love-tree/tree-stage-sparse.png',
  young:   '/assets/love-tree/tree-stage-young.png',
  blooming:'/assets/love-tree/tree-stage-blooming.png',
  premium: '/assets/love-tree/cherry-tree-premium.png',
}

function getTreeMini(level) {
  if (level >= 21) return TREE_IMAGES_MINI.premium
  if (level >= 11) return TREE_IMAGES_MINI.blooming
  if (level >= 6)  return TREE_IMAGES_MINI.young
  if (level >= 4)  return TREE_IMAGES_MINI.sparse
  if (level >= 3)  return TREE_IMAGES_MINI.budding
  if (level >= 2)  return TREE_IMAGES_MINI.sprout
  return TREE_IMAGES_MINI.seedling
}

export default function LoveTreeBondBar({ plant, matchId, onWater, loading }) {
  if (!plant) return null
  const level = Number(plant.level ?? 1)
  const growthPct = Math.max(0, Math.min(100, Number(plant.growthPercent ?? 0)))
  const perLevel = Math.max(1, Number(plant.percentPerLevel ?? 100))
  const barPct = Math.min(100, (growthPct / perLevel) * 100)
  const streak = Number(plant.streakCount ?? 0)
  const bothWatered = Boolean(plant.bothWateredToday)
  const treeImg = getTreeMini(level)

  return (
    <section className="bond-bar">
      <div className="bond-bar-left">
        <img src={treeImg} alt={`Cây cấp ${level}`} className="bond-bar-img" />
      </div>
      <div className="bond-bar-mid">
        <div className="bond-bar-top">
          <span className="bond-bar-level">Cấp {level}</span>
          {streak > 0 && <span className="bond-bar-streak">🔥 {streak}</span>}
          {bothWatered && <span className="bond-bar-duo">💞</span>}
        </div>
        <div className="bond-bar-progress">
          <div className="bond-bar-progress-fill" style={{ width: `${barPct}%` }} />
        </div>
        <div className="bond-bar-bottom">
          <span className="bond-bar-xp">{growthPct}% / {perLevel}%</span>
        </div>
      </div>
      {matchId ? (
        <Link
          to={`/love-tree?matchId=${matchId}`}
          className="bond-bar-water-btn"
          title="Xem & chăm Cây tình yêu"
          aria-label="Đi tới Cây tình yêu"
        >
          💧
        </Link>
      ) : (
        <span className="bond-bar-water-btn">💧</span>
      )}
    </section>
  )
}
