import { useState, useEffect, useRef } from 'react'
import { getEmployeeByCarnet, type Employee } from '@/src/data/mock-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import styles from './CarnetOverlay.module.scss'

interface CarnetOverlayProps {
  isOpen: boolean
  onAuthenticate: (employee: Employee) => void
}

export function CarnetOverlay({ isOpen, onAuthenticate }: CarnetOverlayProps) {
  const [carnet, setCarnet] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const employee = getEmployeeByCarnet(carnet)
    
    if (employee) {
      setError('')
      setCarnet('')
      onAuthenticate(employee)
    } else {
      setError('Carnet no encontrado. Intenta de nuevo.')
      inputRef.current?.focus()
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>
          Ingresa tu carnet para comenzar
        </h2>
        <p className={styles.subtitle}>
          Escribe tu número de carnet de empleado
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={carnet}
              onChange={(e) => {
                setCarnet(e.target.value)
                setError('')
              }}
              placeholder="Ej: 1001"
              className={error ? styles.inputError : ''}
              autoComplete="off"
            />
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>
          
          <Button type="submit" className={styles.submitButton}>
            Confirmar
          </Button>
        </form>
      </div>
    </div>
  )
}
