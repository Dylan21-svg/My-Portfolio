'use client'

import { useEffect } from 'react'

/**
 * BrowserErrorGuard comprehensively prevents benign browser notifications
 * (specifically 'ResizeObserver loop completed with undelivered notifications'
 * and 'ResizeObserver loop limit exceeded') from triggering unhandled error
 * handlers, runtime error overlays, or console errors.
 */
export default function BrowserErrorGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isResizeObserverWarning = (msg?: unknown) => {
      if (!msg) return false
      const str =
        typeof msg === 'string'
          ? msg
          : (msg as Error)?.message || (msg as any)?.reason?.message || String(msg)
      return (
        str.includes('ResizeObserver loop completed with undelivered notifications') ||
        str.includes('ResizeObserver loop limit exceeded')
      )
    }

    // 1. Monkey-patch window.ResizeObserver so callback execution is cleanly deferred
    // to the next animation frame, completely eliminating the browser notification loop condition.
    if (typeof window.ResizeObserver !== 'undefined') {
      const OriginalResizeObserver = window.ResizeObserver
      if (!(OriginalResizeObserver as any).__wrappedByGuard) {
        const WrappedResizeObserver = class extends OriginalResizeObserver {
          constructor(callback: ResizeObserverCallback) {
            super((entries, observer) => {
              requestAnimationFrame(() => {
                try {
                  callback(entries, observer)
                } catch (err) {
                  if (!isResizeObserverWarning(err)) {
                    console.error(err)
                  }
                }
              })
            })
          }
        }
        ;(WrappedResizeObserver as any).__wrappedByGuard = true
        window.ResizeObserver = WrappedResizeObserver
      }
    }

    // 2. Intercept console.error and console.warn for ResizeObserver warnings
    const origConsoleError = console.error
    const origConsoleWarn = console.warn

    console.error = (...args: any[]) => {
      if (args.some((arg) => isResizeObserverWarning(arg))) {
        return
      }
      origConsoleError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      if (args.some((arg) => isResizeObserverWarning(arg))) {
        return
      }
      origConsoleWarn.apply(console, args)
    }

    // 3. Window error handler (both capture and bubble phases)
    const errorHandler = (event: ErrorEvent) => {
      if (isResizeObserverWarning(event.message) || isResizeObserverWarning(event.error)) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return true
      }
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg = typeof reason === 'string' ? reason : reason?.message
      if (isResizeObserverWarning(msg) || isResizeObserverWarning(reason)) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return true
      }
    }

    window.addEventListener('error', errorHandler, true)
    window.addEventListener('error', errorHandler, false)
    window.addEventListener('unhandledrejection', rejectionHandler, true)
    window.addEventListener('unhandledrejection', rejectionHandler, false)

    // 4. window.onerror fallback
    const origOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (isResizeObserverWarning(message) || isResizeObserverWarning(error)) {
        return true
      }
      if (typeof origOnError === 'function') {
        return origOnError(message, source, lineno, colno, error)
      }
      return false
    }

    return () => {
      window.removeEventListener('error', errorHandler, true)
      window.removeEventListener('error', errorHandler, false)
      window.removeEventListener('unhandledrejection', rejectionHandler, true)
      window.removeEventListener('unhandledrejection', rejectionHandler, false)
      console.error = origConsoleError
      console.warn = origConsoleWarn
      if (window.onerror === origOnError) {
        window.onerror = origOnError
      }
    }
  }, [])

  return null
}
