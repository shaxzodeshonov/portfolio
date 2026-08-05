import { useEffect, useRef, useState, type ElementType, type ComponentPropsWithoutRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+='
const SETTLE_MS = 300

function useScramble(text: string) {
  const ref = useRef<HTMLElement>(null)
  const [display, setDisplay] = useState(text)
  const liveRef = useRef(false)

  // the theme button relabels itself outside of hover; only sync while idle
  // so a relabel never interrupts a scramble in progress
  useEffect(() => {
    if (!liveRef.current) setDisplay(text)
  }, [text])

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const host = el.closest('.row, .tile') ?? el
    let raf = 0

    function run() {
      if (liveRef.current || !el) return
      liveRef.current = true
      const start = performance.now()

      const step = (now: number) => {
        const p = Math.min(1, (now - start) / SETTLE_MS)
        let out = ''
        for (let i = 0; i < text.length; i++) {
          const c = text[i]
          // each character settles on its own, left to right
          const settle = 0.35 + 0.65 * (i / text.length)
          out += p >= settle || !/[A-Z0-9]/i.test(c)
            ? c
            : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        setDisplay(out)
        if (p < 1) {
          raf = requestAnimationFrame(step)
        } else {
          setDisplay(text)
          liveRef.current = false
        }
      }
      raf = requestAnimationFrame(step)
    }

    host.addEventListener('pointerenter', run)
    el.addEventListener('focus', run)
    return () => {
      host.removeEventListener('pointerenter', run)
      el.removeEventListener('focus', run)
      cancelAnimationFrame(raf)
      liveRef.current = false
    }
  }, [text])

  return { ref, display }
}

type ScrambleProps<T extends ElementType> = {
  as?: T
  text: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

export function Scramble<T extends ElementType = 'span'>({
  as,
  text,
  ...rest
}: ScrambleProps<T>) {
  const Tag = (as ?? 'span') as ElementType
  const { ref, display } = useScramble(text)
  return (
    <Tag ref={ref} data-scramble {...rest}>
      {display}
    </Tag>
  )
}
