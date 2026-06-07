import { Link } from 'react-router-dom'
import { canSuggestDateFromTree, loveTreeToDisplayState } from '../../../utils/loveTreeState.js'
import './LoveTreeBondBar.css'

const STAGE_EMOJI = {
  sprout: '🌱',
  sparse: '🌿',
  seedling: '🪴',
  budding: '🌸',
  young: '🌺',
  blooming: '🌳',
  radiant: '✨',
}

function LoveTreeBondBar({ treeState, partnerId, partnerName, compact = false }) {
  if (!treeState) return null

  const display = loveTreeToDisplayState(treeState)
  const emoji = STAGE_EMOJI[display.stageKey] ?? '🌱'
  const dateReady = canSuggestDateFromTree(treeState)
  const treeLink = partnerId ? `/love-tree?partner=${partnerId}` : '/love-tree'

  if (compact) {
    return (
      <Link
        to={treeLink}
        className="love-tree-bond love-tree-bond--compact"
        title={`Cây tình yêu · ${display.stageLabel} ${display.attachmentPercent}%`}
      >
        {emoji} Cấp {display.level}
      </Link>
    )
  }

  return (
    <div className={`love-tree-bond${dateReady ? ' love-tree-bond--date-ready' : ''}`}>
      <div className="love-tree-bond__head">
        <span className="love-tree-bond__emoji" aria-hidden="true">
          {emoji}
        </span>
        <div className="love-tree-bond__info">
          <strong>
            Cây tình yêu · Cấp {display.level}/{display.maxLevel}
          </strong>
          <span>
            {display.stageLabel} — {display.attachmentPercent}% gắn kết
          </span>
        </div>
        <Link to={treeLink} className="love-tree-bond__link">
          Chăm cây →
        </Link>
      </div>

      <div
        className="love-tree-bond__bar"
        role="progressbar"
        aria-valuenow={display.attachmentPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Mức gắn kết cây tình yêu"
      >
        <span style={{ width: `${display.attachmentPercent}%` }} />
      </div>

      <p className="love-tree-bond__hint">
        {dateReady
          ? `Cây đủ lớn — có thể hẹn ${partnerName ?? 'đối phương'} gặp mặt thật!`
          : 'Tưới nước, gửi nắng, bón yêu trên trang Cây tình yêu để hai bạn gắn bó hơn.'}
      </p>
    </div>
  )
}

export default LoveTreeBondBar
