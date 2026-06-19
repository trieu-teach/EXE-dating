import { cn } from '../../lib/utils'

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-[var(--color-surface-2)] text-[var(--color-text-soft)]',
    primary: 'bg-brand-soft text-brand-500',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-700',
    online: 'bg-green-100 text-green-700',
    premium: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}
