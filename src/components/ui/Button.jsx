import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-[#F7931E]/60 to-[#EC4899]/60 backdrop-blur-[9px] border border-white/35 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] shadow-glow-pink hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-surface-2 text-foreground border border-border hover:bg-surface hover:border-border-strong',
        ghost: 'text-foreground-muted hover:bg-surface-2 hover:text-foreground',
        danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
        soft: 'bg-brand-soft text-brand-500 hover:bg-brand-100',
        outline: 'border-2 border-brand-400 text-brand-400 hover:bg-brand-50 font-bold',
        link: 'text-brand-400 underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-lg',
        sm: 'h-9 px-4 text-sm rounded-xl',
        md: 'h-11 px-6 text-sm rounded-xl',
        lg: 'h-13 px-8 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        full: 'w-full h-12 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
