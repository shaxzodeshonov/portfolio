import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import { VIEW, WING, BODY, ANTENNA, ANTENNA_W, MIRROR, sampleMask } from '../lib/butterfly'

const SETTLE_MS = 300 // same settle window as Scramble — one motion language
const SWEEP = 0.7 // share of the settle spent crossing left to right
const SPARK = 0.16 // how long a freshly-uncovered cell keeps rolling
const TICK_MS = 90 // idle churn: 60fps bit-flipping reads as static, this reads as data
const CHURN = 0.08 // share of cells re-rolled per tick

// stable per-cell bit, so the resting pattern doesn't reshuffle on every
// repaint. needs real avalanche — a single multiply leaves the low bits
// periodic and the grid moirés into diagonal stripes
function bitOf(i: number) {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  return (h >>> 16) & 1
}

export function Butterfly() {
  const figRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const fig = figRef.current
    const svg = svgRef.current
    const pre = preRef.current
    if (!fig || !svg || !pre) return
    const reduced = prefersReducedMotion()

    let cols = 0
    let rows = 0
    let mask = new Uint8Array(0)
    let bits = new Uint8Array(0)
    let on: number[] = []

    function measure() {
      if (!svg || !pre) return
      const probe = document.createElement('span')
      probe.style.cssText =
        'position:absolute;visibility:hidden;white-space:pre;font:11px/1 ' +
        getComputedStyle(pre).fontFamily
      probe.textContent = 'M'.repeat(50)
      pre.appendChild(probe)
      const cw = probe.getBoundingClientRect().width / 50
      const ch = 11 // line-height: 1
      probe.remove()

      // css sizes the svg; the glyph inside it is meet-fitted, so the grid has
      // to repeat that fit or the binary lands somewhere the silhouette wasn't
      const box = svg.getBoundingClientRect()
      const s = Math.min(box.width / VIEW.w, box.height / VIEW.h)
      cols = Math.max(8, Math.round((VIEW.w * s) / cw))
      rows = Math.max(6, Math.round((VIEW.h * s) / ch))

      mask = sampleMask(cols, rows)
      bits = new Uint8Array(cols * rows)
      on = []
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue
        bits[i] = bitOf(i)
        on.push(i)
      }
    }

    // p: 0→1 reveal progress
    function render(p: number) {
      if (!pre) return
      let out = ''
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c
          if (!mask[i]) {
            out += ' '
            continue
          }
          const age = p - (c / cols) * SWEEP
          if (age < 0) out += ' '
          else if (age < SPARK && !reduced) out += Math.random() < 0.5 ? '0' : '1'
          else out += bits[i] ? '1' : '0'
        }
        if (r < rows - 1) out += '\n'
      }
      pre.textContent = out
    }

    function churn() {
      const n = Math.max(1, Math.round(on.length * CHURN))
      for (let k = 0; k < n; k++) bits[on[(Math.random() * on.length) | 0]] ^= 1
    }

    let raf = 0
    let start = 0
    let last = 0
    let live = false

    function loop(t: number) {
      if (!start) {
        start = t
        last = t
      }
      const p = Math.min(1, (t - start) / SETTLE_MS)
      if (p < 1) {
        render(p)
      } else if (t - last >= TICK_MS) {
        churn()
        render(1)
        last = t
      }
      raf = requestAnimationFrame(loop)
    }

    function enter() {
      if (live || !svg) return
      live = true
      svg.classList.add('is-out')
      if (reduced) {
        render(1)
        return
      }
      start = 0
      raf = requestAnimationFrame(loop)
    }

    function leave() {
      if (!live || !svg || !pre) return
      live = false
      cancelAnimationFrame(raf)
      raf = 0
      svg.classList.remove('is-out')
      pre.textContent = ''
    }

    measure()

    // the first measure runs on fallback metrics; Geist Mono has a wider
    // advance, so re-measure once it swaps in
    document.fonts?.ready.then(() => {
      measure()
      if (live) render(1)
    })

    let rz = 0
    const onResize = () => {
      clearTimeout(rz)
      rz = window.setTimeout(() => {
        measure()
        if (live) render(1)
      }, 150)
    }

    fig.addEventListener('pointerenter', enter)
    fig.addEventListener('pointerleave', leave)
    addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(rz)
      fig.removeEventListener('pointerenter', enter)
      fig.removeEventListener('pointerleave', leave)
      removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="hero__mark" aria-hidden="true">
      <div className="hero__mark-fig" ref={figRef}>
        <svg
          className="hero__mark-svg"
          ref={svgRef}
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          focusable="false"
        >
          <g fill="currentColor">
            <path d={BODY} />
            <path d={WING} />
            <path d={WING} transform={MIRROR} />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth={ANTENNA_W} strokeLinecap="round">
            <path d={ANTENNA} />
            <path d={ANTENNA} transform={MIRROR} />
          </g>
        </svg>
        <pre className="hero__mark-bits" ref={preRef} />
      </div>
    </div>
  )
}
