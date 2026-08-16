'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { soundFX } from '@/lib/soundfx'

export default function AudioFeedbackToggle() {
  const [isMuted, setIsMuted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMuted(soundFX.getMuted())

    const handleToggle = (e: CustomEvent<{ muted: boolean }>) => {
      setIsMuted(e.detail.muted)
    }

    window.addEventListener('soundfx_toggle' as unknown as keyof WindowEventMap, handleToggle as EventListener)
    return () => {
      window.removeEventListener('soundfx_toggle' as unknown as keyof WindowEventMap, handleToggle as EventListener)
    }
  }, [])

  if (!mounted) return null

  const toggleSound = () => {
    const nextState = soundFX.toggleMute()
    setIsMuted(nextState)
    if (!nextState) {
      soundFX.playSuccess()
    }
  }

  return (
    <button
      onClick={toggleSound}
      className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-mono ${
        !isMuted
          ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_12px_rgba(26,122,122,0.3)]'
          : 'bg-white/5 border-white/10 text-text-gray hover:text-white hover:bg-white/10'
      }`}
      title={isMuted ? 'Unmute UI Audio Feedback' : 'Mute UI Audio Feedback'}
      aria-label="Toggle UI Audio Effects"
    >
      {!isMuted ? (
        <>
          <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px] font-semibold">SFX ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">SFX OFF</span>
        </>
      )}
    </button>
  )
}
