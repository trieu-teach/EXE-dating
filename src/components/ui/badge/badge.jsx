import { cn } from '../../../lib/cn.js'
import './badge.css'

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn('ui-badge', `ui-badge--${variant}`, className)}
      {...props}
    />
  )
}
