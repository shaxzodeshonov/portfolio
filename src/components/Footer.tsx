import { Scramble } from './Scramble'
import { useClock } from '../hooks/useClock'

export function Footer() {
  const clock = useClock()

  return (
    <footer className="foot">
      <div className="foot__mark" aria-hidden="true">SHAXZOD</div>
      <div className="foot__base">
        <div className="foot__cell">
          <span className="dim">TASHKENT</span>
          <span className="dim">{clock}</span>
        </div>
        <div className="foot__cell">
          <span className="lab">NEW WORK</span>
          <Scramble as="a" href="mailto:shaxzod221007@gmail.com" text="SHAXZOD221007@GMAIL.COM" />
        </div>
        <div className="foot__cell foot__cell--end">
          <Scramble as="a" href="#" text="GITHUB" />
          <Scramble as="a" href="#" text="LINKEDIN" />
        </div>
      </div>
    </footer>
  )
}
