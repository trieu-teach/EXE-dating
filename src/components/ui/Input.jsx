import { cn } from '../../lib/utils'

export function Input({ label, error, className, wrapperClassName, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-soft)]">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm transition-all duration-200 outline-none',
          'border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className, wrapperClassName, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-soft)]">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm transition-all duration-200 outline-none resize-none',
          'border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  )
}

export function Select({ label, error, className, wrapperClassName, children, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-soft)]">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm transition-all duration-200 outline-none cursor-pointer appearance-none',
          'border-[var(--color-border)]',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  )
}
