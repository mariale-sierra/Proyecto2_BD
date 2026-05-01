import { useEffect } from 'react'
import { Check, AlertTriangle, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Toast.module.scss'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const icons = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: Info,
  }

  const toneStyles = {
    success: 'border-l-4 border-l-success bg-card',
    error: 'border-l-4 border-l-destructive bg-card',
    warning: 'border-l-4 border-l-warning bg-card',
    info: 'border-l-4 border-l-primary bg-card',
  }

  const iconStyles = {
    success: 'text-success',
    error: 'text-destructive',
    warning: 'text-warning-foreground',
    info: 'text-primary',
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        styles.toast,
        toneStyles[type]
      )}
    >
      <Icon className={cn(styles.icon, iconStyles[type])} />
      <span className={styles.message}>{message}</span>
      <button
        onClick={onClose}
        className={styles.closeButton}
      >
        <X className={styles.closeIcon} />
      </button>
    </div>
  )
}

export interface ToastState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}
