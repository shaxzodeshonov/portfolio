import { Scramble } from './Scramble'
import { cursorHover } from '../lib/cursorHover'

type Play = {
  name: string
  caption: string
}

const PLAYS: Play[] = [
  { name: 'KAIROS', caption: 'Scheduling tool. Designed and shipped solo.' },
  { name: 'SILK ROUTE', caption: 'Trade archive. 40k records, one search field.' },
  { name: 'ATLAS', caption: 'Map renderer. Rust core, canvas surface.' },
]

export function Tiles() {
  return (
    <section className="tiles" id="play">
      {PLAYS.map((play) => (
        <figure
          className="tile"
          key={play.name}
          onPointerEnter={() => { cursorHover.on = true }}
          onPointerLeave={() => { cursorHover.on = false }}
        >
          <div className="tile__img" data-slot="4:5" />
          <figcaption>
            <Scramble as="span" text={play.name} />
            <span className="dim">{play.caption}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  )
}
