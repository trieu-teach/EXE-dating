import { cn } from '../../lib/utils'

export function Avatar({ src, alt, size = 'md', online, className }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  }
  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn('rounded-full bg-[var(--color-surface-2)] bg-cover bg-center border-2 border-[var(--color-border)]', sizes[size])}
        style={src ? { backgroundImage: `url(${src})` } : {}}
      >
        {!src && <span className="flex items-center justify-center w-full h-full text-[var(--color-text-muted)]">?</span>}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#34c759] rounded-full border-2 border-[var(--color-surface)]" />
      )}
    </div>
  )
}
