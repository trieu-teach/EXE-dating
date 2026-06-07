import { useMemo } from 'react'
import './LoveTreeScene.css'

export const MAX_LOVE_LEVEL = 7

export const LOVE_TREE_STAGES = [
  'sprout',
  'sparse',
  'seedling',
  'budding',
  'young',
  'blooming',
  'radiant',
]

export const LOVE_TREE_STAGE_LABELS = {
  sprout: 'Mầm non',
  sparse: 'Vươn lên',
  seedling: 'Nảy chồi',
  budding: 'Chớm nụ',
  young: 'Rực rỡ',
  blooming: 'Nở rộ',
  radiant: 'Tỏa sáng trọn vẹn',
}

function levelToStageIndex(level) {
  const lv = Math.min(Math.max(level, 1), MAX_LOVE_LEVEL)
  return lv - 1
}

/** Giai đoạn hiện tại theo cấp */
function getStage(level) {
  return LOVE_TREE_STAGES[levelToStageIndex(level)]
}

/** Giai đoạn hiển thị — 100% gắn kết: preview dạng kế (trước khi lên cấp) */
export function getDisplayStage(level, attachmentPercent, evolving = false) {
  const idx = levelToStageIndex(level)
  if (!evolving && attachmentPercent >= 100 && idx < LOVE_TREE_STAGES.length - 1) {
    return LOVE_TREE_STAGES[idx + 1]
  }
  return LOVE_TREE_STAGES[idx]
}

/** Dạng cuối (radiant) + gắn kết 100% */
export function isRadiantComplete(level, attachmentPercent) {
  return levelToStageIndex(level) === LOVE_TREE_STAGES.length - 1 && attachmentPercent >= 100
}

export const getLoveTreeStage = getStage
export { levelToStageIndex }

const SPROUT_IMG = '/assets/love-tree/tree-stage-sprout.png'
const SPARSE_IMG = '/assets/love-tree/tree-stage-sparse.png'
const SEEDLING_IMG = '/assets/love-tree/tree-stage-seedling.png'
const BUDDING_IMG = '/assets/love-tree/tree-stage-budding.png'
const YOUNG_IMG = '/assets/love-tree/tree-stage-young.png'
const BLOOMING_IMG = '/assets/love-tree/tree-stage-blooming.png'
const RADIANT_IMG = '/assets/love-tree/cherry-tree-premium.png'

const STAGE_PARTICLES = {
  sprout: 6,
  sparse: 8,
  seedling: 10,
  budding: 12,
  young: 16,
  blooming: 20,
  radiant: 24,
}

const RING_R = 108
const RING_C = 2 * Math.PI * RING_R

function CelebrateOverlay() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 13) % 100}%`,
        delay: `${(i * 0.12) % 2}s`,
        duration: `${2.5 + (i % 4) * 0.4}s`,
        emoji: i % 4 === 0 ? '💕' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🌸' : '🎉',
        drift: `${(i % 7) - 3}px`,
      })),
    [],
  )

  return (
    <div className="lt-celebrate" role="status" aria-live="polite">
      <div className="lt-celebrate__confetti" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="lt-celebrate__piece"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
              '--drift': c.drift,
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>
      <div className="lt-celebrate__card">
        <span className="lt-celebrate__icon">🎉</span>
        <strong>Chúc mừng!</strong>
        <p>Tình yêu đã tỏa sáng trọn vẹn</p>
      </div>
    </div>
  )
}

/** 7 giai đoạn PNG — mỗi cấp một ảnh trưởng thành */
function PngStage({ stage, src, particles = 0 }) {
  const rich = stage === 'young' || stage === 'blooming' || stage === 'radiant'
  return (
    <div className={`lt-tree-art lt-tree-art--${stage}`} aria-hidden="true">
      {rich && <div className="lt-tree-art__aura" />}
      <img src={src} alt="" className="lt-tree-art__img" draggable={false} />
      {particles > 0 && <TreePetals count={particles} />}
    </div>
  )
}

function StageTree({ stage }) {
  switch (stage) {
    case 'sprout':
      return <PngStage stage="sprout" src={SPROUT_IMG} particles={STAGE_PARTICLES.sprout} />
    case 'sparse':
      return <PngStage stage="sparse" src={SPARSE_IMG} particles={STAGE_PARTICLES.sparse} />
    case 'seedling':
      return <PngStage stage="seedling" src={SEEDLING_IMG} particles={STAGE_PARTICLES.seedling} />
    case 'budding':
      return <PngStage stage="budding" src={BUDDING_IMG} particles={STAGE_PARTICLES.budding} />
    case 'young':
      return <PngStage stage="young" src={YOUNG_IMG} particles={STAGE_PARTICLES.young} />
    case 'blooming':
      return <PngStage stage="blooming" src={BLOOMING_IMG} particles={STAGE_PARTICLES.blooming} />
    case 'radiant':
      return <PngStage stage="radiant" src={RADIANT_IMG} particles={STAGE_PARTICLES.radiant} />
    default:
      return <PngStage stage="sprout" src={SPROUT_IMG} particles={STAGE_PARTICLES.sprout} />
  }
}

function TreePetals({ count }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 17) % 84)}%`,
        delay: `${(i * 0.28) % 3.5}s`,
        duration: `${2.2 + (i % 5) * 0.45}s`,
        size: i % 3 === 0 ? 'lg' : i % 3 === 1 ? 'md' : 'sm',
        drift: `${(i % 9) - 4}px`,
      })),
    [count],
  )

  return (
    <div className="lt-tree-art__petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className={`lt-tree-art__petal lt-tree-art__petal--${p.size}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--drift': p.drift,
          }}
        />
      ))}
    </div>
  )
}

function RingProgress({ percent, ready, complete }) {
  const dash = (percent / 100) * RING_C
  return (
    <svg
      className={`lt-ring${ready ? ' lt-ring--ready' : ''}${complete ? ' lt-ring--complete' : ''}`}
      viewBox="0 0 240 240"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lt-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F48FB1" />
          <stop offset="50%" stopColor="#E2557A" />
          <stop offset="100%" stopColor="#FF80AB" />
        </linearGradient>
        <filter id="lt-ring-glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle className="lt-ring__bg" cx="120" cy="120" r={RING_R} fill="none" strokeWidth="7" />
      <circle
        className="lt-ring__fill"
        cx="120"
        cy="120"
        r={RING_R}
        fill="none"
        strokeWidth="7"
        stroke="url(#lt-ring-grad)"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${RING_C}`}
        transform="rotate(-90 120 120)"
        filter="url(#lt-ring-glow)"
      />
    </svg>
  )
}

function SceneParticles({ stage }) {
  const count = STAGE_PARTICLES[stage]
  const isRich = stage === 'young' || stage === 'blooming' || stage === 'radiant'

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${2 + ((i * 14) % 96)}%`,
        delay: `${(i * 0.38) % 4.5}s`,
        duration: `${2.8 + (i % 6) * 0.5}s`,
        type: stage === 'sprout' ? 'spark' : i % 4 === 0 ? 'heart' : 'petal',
        drift: `${(i % 7) - 3}px`,
      })),
    [count, stage],
  )

  return (
    <div className={`lt-scene__particles${isRich ? ' lt-scene__particles--shower' : ''}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`lt-particle lt-particle--${p.type}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--drift': p.drift,
          }}
        />
      ))}
    </div>
  )
}

export default function LoveTreeScene({
  level,
  levelLabel,
  attachmentPercent,
  careBurst,
  careBurstPoints,
  evolving,
  celebrating,
}) {
  const stage = getDisplayStage(level, attachmentPercent, evolving)
  const stageLabel = LOVE_TREE_STAGE_LABELS[stage]
  const stageIdx = LOVE_TREE_STAGES.indexOf(stage)
  const ringPercent = Math.min(100, attachmentPercent)
  const isComplete = isRadiantComplete(level, attachmentPercent)
  const isReadyToEvolve =
    attachmentPercent >= 100 && levelToStageIndex(level) < LOVE_TREE_STAGES.length - 1

  return (
    <div
      className={`lt-scene lt-scene--${stage}${careBurst ? ' lt-scene--burst' : ''}${evolving ? ' lt-scene--evolve' : ''}${isReadyToEvolve ? ' lt-scene--ready' : ''}${isComplete || celebrating ? ' lt-scene--celebrate' : ''}`}
    >
      <div className="lt-scene__backdrop">
        <div className="lt-scene__mesh" />
        <div className="lt-scene__glow-spot" />
        <div className="lt-scene__vignette" />
      </div>

      <SceneParticles stage={stage} />

      <div className="lt-scene__viewport">
        <div className={`lt-scene__stage lt-scene__stage--${stage}`}>
          <RingProgress percent={ringPercent} ready={isReadyToEvolve} complete={isComplete} />
          <div className="lt-scene__tree-slot">
            <StageTree stage={stage} />
          </div>
          <span className="lt-scene__percent">{isComplete ? '100%' : `${ringPercent}%`}</span>
          {isReadyToEvolve && <span className="lt-scene__evolve-hint">Tiến hóa!</span>}
          {isComplete && !celebrating && <span className="lt-scene__complete-badge">Trọn vẹn</span>}
          {careBurst && (
            <div className="lt-scene__burst" key={careBurst}>
              <span className="lt-scene__xp">
                {isComplete || celebrating
                  ? '🎉 Hoàn thành!'
                  : evolving
                    ? '🌟 Lên dạng mới!'
                    : `+${careBurstPoints ?? 3}%`}
              </span>
            </div>
          )}
        </div>
      </div>

      {(isComplete || celebrating) && <CelebrateOverlay />}

      <div className="lt-scene__info">
        <div className="lt-scene__badge">
          <span className="lt-scene__badge-lv">Cấp {level}/{MAX_LOVE_LEVEL}</span>
          <span className="lt-scene__badge-title">{levelLabel || stageLabel}</span>
          <span className="lt-scene__badge-sub">{stageLabel}</span>
        </div>

        <div className="lt-scene__steps" aria-label="Giai đoạn trưởng thành">
          {LOVE_TREE_STAGES.map((s, i) => (
            <span
              key={s}
              className={`lt-scene__step${i === stageIdx ? ' lt-scene__step--on' : ''}${i <= stageIdx ? ' lt-scene__step--done' : ''}`}
              title={LOVE_TREE_STAGE_LABELS[s]}
            >
              <span className="lt-scene__step-dot" />
              {i === stageIdx && <span className="lt-scene__step-label">{LOVE_TREE_STAGE_LABELS[s]}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
