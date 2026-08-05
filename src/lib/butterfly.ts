/* The hero mark. One geometry, two readings: a solid silhouette at rest, a
   field of 0s and 1s on hover. Both come from the paths below, so the two
   states can never drift apart.

   Only the right half of the wing and antenna are authored — the left is the
   same path mirrored. A hand-traced full butterfly is never quite symmetric,
   and on a mark that large the eye catches it. */

export const VIEW = { w: 200, h: 140 }

/* forewing: long shallow leading edge out to the tip, outer edge falling away
   to a corner, trailing edge cutting back to a V at the waist — then the
   shorter hindwing swinging out and round beneath it */
export const WING =
  'M 104 40 ' +
  'C 126 26, 154 14, 176 12 ' +
  'C 190 11, 194 22, 188 38 ' +
  'C 180 54, 167 68, 153 75 ' +
  'C 145 79, 136 81, 129 81 ' +
  'C 143 84, 162 94, 168 107 ' +
  'C 173 118, 162 129, 146 130 ' +
  'C 128 131, 112 126, 103 116 ' +
  'C 103 100, 104 70, 104 40 Z'

/* thorax into a tapering abdomen — drawn full, already symmetric */
export const BODY =
  'M 100 22 ' +
  'C 106 22, 110 28, 110 38 ' +
  'C 110 52, 108 68, 106 84 ' +
  'C 105 100, 104 120, 100 134 ' +
  'C 96 120, 95 100, 94 84 ' +
  'C 92 68, 90 52, 90 38 ' +
  'C 90 28, 94 22, 100 22 Z'

export const ANTENNA = 'M 101 26 C 112 18, 128 10, 144 6'
export const ANTENNA_W = 3

/* rightmost transform runs first: x → x - w → w - x */
export const MIRROR = `scale(-1,1) translate(${-VIEW.w},0)`

const SS = 2 // subsamples per axis — 1:1 leaves the edges ragged

let cache: { body: Path2D; wing: Path2D; antenna: Path2D } | null = null

/** Rasterise the butterfly into a cols×rows character mask: 1 = ink, 0 = ground. */
export function sampleMask(cols: number, rows: number): Uint8Array<ArrayBuffer> {
  const mask = new Uint8Array(cols * rows)
  const cv = document.createElement('canvas')
  cv.width = cols * SS
  cv.height = rows * SS
  const ctx = cv.getContext('2d')
  if (!ctx) return mask

  // Path2D fills the same geometry the svg paints — no image to load, no
  // rasterisation round-trip, nothing to taint the canvas
  cache ??= { body: new Path2D(BODY), wing: new Path2D(WING), antenna: new Path2D(ANTENNA) }
  ctx.scale(cv.width / VIEW.w, cv.height / VIEW.h)
  ctx.lineWidth = ANTENNA_W
  ctx.lineCap = 'round'
  ctx.fill(cache.body)
  ctx.fill(cache.wing)
  ctx.stroke(cache.antenna)
  ctx.translate(VIEW.w, 0)
  ctx.scale(-1, 1)
  ctx.fill(cache.wing)
  ctx.stroke(cache.antenna)

  const px = ctx.getImageData(0, 0, cv.width, cv.height).data
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let hit = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          if (px[(((r * SS + sy) * cv.width + c * SS + sx) << 2) + 3] > 128) hit++
        }
      }
      if (hit * 2 >= SS * SS) mask[r * cols + c] = 1
    }
  }
  return mask
}
