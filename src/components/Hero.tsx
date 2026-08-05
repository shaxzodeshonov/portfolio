import { Butterfly } from './Butterfly'
import { useClock } from '../hooks/useClock'

export function Hero() {
  const clock = useClock()

  return (
    <section className="hero">
      <Butterfly />
      <h1 className="sr">Shaxzod — design engineer</h1>
      <div className="hero__base">
        <div className="hero__cell">
          <span className="lab">DESIGN ENGINEER</span>
          <span className="dim">TASHKENT · UTC+5</span>
        </div>
        <div className="hero__cell hero__cell--end">
          <span className="lab">AVAILABLE FROM MARCH</span>
          <span className="dim">
            <time>{clock}</time>
          </span>
        </div>
      </div>
    </section>
  )
}
