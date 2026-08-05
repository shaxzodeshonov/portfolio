import { Scramble } from './Scramble'
import { cursorHover } from '../lib/cursorHover'

type Project = {
  name: string
  des: boolean
  eng: boolean
  stack: string
  year: number
}

const PROJECTS: Project[] = [
  { name: 'KAIROS', des: true, eng: true, stack: 'TS · WEBGL', year: 2025 },
  { name: 'HALQA', des: true, eng: false, stack: 'IDENTITY', year: 2025 },
  { name: 'SILK ROUTE', des: true, eng: true, stack: 'NEXT · POSTGRES', year: 2024 },
  { name: 'METER', des: false, eng: true, stack: 'SVELTE · D3', year: 2024 },
  { name: 'ATLAS', des: true, eng: true, stack: 'CANVAS · RUST', year: 2023 },
]

function Row({ project }: { project: Project }) {
  return (
    <a
      className="row"
      href="#"
      role="row"
      onPointerEnter={() => { cursorHover.on = true }}
      onPointerLeave={() => { cursorHover.on = false }}
    >
      <Scramble as="span" role="cell" text={project.name} />
      <span role="cell" className="role">
        <i className={`chip${project.des ? ' is-on' : ''}`} />DES
        <i className={`chip${project.eng ? ' is-on' : ''}`} />ENG
      </span>
      <Scramble as="span" role="cell" text={project.stack} />
      <span role="cell" className="row--y">{project.year}</span>
    </a>
  )
}

export function IndexTable() {
  return (
    <section className="index" id="index">
      <div className="head">
        <span className="lab">INDEX</span>
        <span className="dim">FILLED SQUARE MEANS I DID THAT HALF</span>
      </div>

      <div className="table" role="table" aria-label="Selected work">
        <div className="row row--head" role="row">
          <span role="columnheader">PROJECT</span>
          <span role="columnheader">ROLE</span>
          <span role="columnheader">STACK</span>
          <span role="columnheader" className="row--y">YEAR</span>
        </div>

        {PROJECTS.map((project) => (
          <Row key={project.name} project={project} />
        ))}
      </div>
    </section>
  )
}
