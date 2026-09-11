import { useCallback, useRef, useState } from 'react'

export function useMutationWithLock() {
  const [isLocked, setIsLocked] = useState(false)
  const lockRef = useRef(false)

  const runMutation = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (lockRef.current) {
        return undefined
      }

      lockRef.current = true
      setIsLocked(true)

      try {
        return await fn()
      } finally {
        lockRef.current = false
        setIsLocked(false)
      }
    },
    [],
  )

  return { isLocked, runMutation }
}
