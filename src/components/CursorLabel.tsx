import { useEffect, useRef } from 'react'
import { cursorHover } from '../lib/cursorHover'
import { prefersReducedMotion } from '../lib/motion'

export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(pointer: fine)').matches) return
    const reduced = prefersReducedMotion()

    let x = 0
    let y = 0
    let cx = 0
    let cy = 0
    const onPointerMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
    }
    addEventListener('pointermove', onPointerMove, { passive: true })

    let raf = 0
    const loop = () => {
      const k = reduced ? 1 : 0.18
      cx += (x - cx) * k
      cy += (y - cy) * k
      el.classList.toggle('is-on', cursorHover.on)
      if (cursorHover.on) el.style.transform = `translate(${cx + 14}px, ${cy + 14}px)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      CLICK
    </div>
  )
}
