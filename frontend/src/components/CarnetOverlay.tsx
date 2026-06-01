import { useState, useEffect, useRef } from 'react'
import { authApi } from '@/services/api/auth.api'
import type { AuthUser } from '@/src/auth/roles'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import styles from './CarnetOverlay.module.scss'

interface CarnetOverlayProps {
  isOpen: boolean
  onAuthenticate: (employee: AuthUser) => void
}

export function CarnetOverlay({ isOpen, onAuthenticate }: CarnetOverlayProps) {
  const [carnet, setCarnet] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const credential = carnet.trim()
    if (!credential) {
      setError('Ingresa un carnet o usuario valido.')
      return
    }

    try {
      setLoading(true)
      const employee = await authApi.login(credential)
      setError('')
      setCarnet('')
      onAuthenticate(employee)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Carnet no encontrado. Intenta de nuevo.'
      setError(message)
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>
          Inicia sesión para comenzar
        </h2>
        <p className={styles.subtitle}>
          Escribe tu número de carnet de empleado
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input
              ref={inputRef}
              type="text"
              inputMode="text"
              value={carnet}
              onChange={(e) => {
                setCarnet(e.target.value)
                setError('')
              }}
              placeholder="Ej: 1001 o dueno123"
              className={error ? styles.inputError : ''}
              autoComplete="off"
            />
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>
          
          <Button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Validando...' : 'Confirmar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
