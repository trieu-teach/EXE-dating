import { portraitUrl } from '../../../data/portraitPhotos.js'
import './LovePageDecor.css'

const LOVE_IMAGES = [
  {
    src: portraitUrl('1544005313-94ddf0286df2', 320),
    alt: '',
    className: 'love-page-decor__photo love-page-decor__photo--1',
  },
  {
    src: portraitUrl('1516589178581-6cd7833ae07b', 320),
    alt: '',
    className: 'love-page-decor__photo love-page-decor__photo--2',
  },
  {
    src: portraitUrl('1519085360353-028bae5c38f2', 320),
    alt: '',
    className: 'love-page-decor__photo love-page-decor__photo--3',
  },
]

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

function LovePageDecor() {
  return (
    <div className="love-page-decor" aria-hidden="true">
      <div className="love-page-decor__glow love-page-decor__glow--1" />
      <div className="love-page-decor__glow love-page-decor__glow--2" />

      {LOVE_IMAGES.map((image) => (
        <img key={image.className} src={image.src} alt={image.alt} className={image.className} />
      ))}

      <HeartIcon className="love-page-decor__heart love-page-decor__heart--1" />
      <HeartIcon className="love-page-decor__heart love-page-decor__heart--2" />
      <HeartIcon className="love-page-decor__heart love-page-decor__heart--3" />
      <HeartIcon className="love-page-decor__heart love-page-decor__heart--4" />
      <HeartIcon className="love-page-decor__heart love-page-decor__heart--5" />
    </div>
  )
}

export default LovePageDecor
