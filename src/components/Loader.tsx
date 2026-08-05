import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const BAR_CHAR = '='

const DRAW_MS = 1600
const REDUCED_DRAW_MS = 200
const HOLD_MS = 200
const FADE_MS = 500

// measures the rendered width of one monospace char at the bar's font/size
function measureCharWidth(el: HTMLElement) {
  const probe = document.createElement('span')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.whiteSpace = 'pre'
  probe.style.font = getComputedStyle(el).font
  probe.textContent = 'M'.repeat(50)
  document.body.appendChild(probe)
  const width = probe.getBoundingClientRect().width / 50
  document.body.removeChild(probe)
  return width
}

export function Loader() {
  const barRef = useRef<HTMLPreElement>(null)
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in')

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const reduced = prefersReducedMotion()
    const drawMs = reduced ? REDUCED_DRAW_MS : DRAW_MS

    let raf = 0
    let exited = false
    let loaded = document.readyState === 'complete'
    let cols = 0
    const start = performance.now()

    document.documentElement.style.overflow = 'hidden'

    function measure() {
      const charW = measureCharWidth(bar!)
      cols = Math.max(1, Math.floor(innerWidth / charW))
    }
    measure()

    function draw(elapsed: number) {
      const p = Math.max(0, Math.min(1, elapsed / drawMs))
      bar!.textContent = BAR_CHAR.repeat(Math.round(p * cols))
    }

    function startExit() {
      if (exited) return
      exited = true
      cancelAnimationFrame(raf)
      document.documentElement.style.overflow = ''
      setPhase('out')
      setTimeout(() => setPhase('gone'), FADE_MS)
    }

    function loop(t: number) {
      const elapsed = t - start
      draw(elapsed)
      if (loaded && elapsed >= drawMs + HOLD_MS) {
        startExit()
        return
      }
      raf = requestAnimationFrame(loop)
    }

    const onLoad = () => { loaded = true }
    if (!loaded) addEventListener('load', onLoad, { once: true })

    const onSkip = () => startExit()
    addEventListener('resize', measure)
    addEventListener('pointerdown', onSkip)
    addEventListener('keydown', onSkip)

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', measure)
      removeEventListener('load', onLoad)
      removeEventListener('pointerdown', onSkip)
      removeEventListener('keydown', onSkip)
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={`loader${phase === 'out' ? ' loader--out' : ''}`} aria-hidden="true">
      <pre className="loader__bar" ref={barRef} />
    </div>
  )
}
