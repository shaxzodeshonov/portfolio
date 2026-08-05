import { Scramble } from './Scramble'

export function Nav({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  return (
    <header className="nav">
      <Scramble as="a" className="nav__mark" href="#top" text="SHAXZOD" />
      <div className="nav__col">
        <Scramble as="a" href="#index" text="WORK" />
        <Scramble as="a" href="#play" text="PLAY" />
      </div>
      <div className="nav__col">
        <Scramble as="a" href="#about" text="ABOUT" />
      </div>
      <div className="nav__col">
        <Scramble
          as="button"
          className="nav__theme"
          type="button"
          onClick={onToggleTheme}
          text={theme === 'dark' ? 'LIGHT' : 'DARK'}
        />
      </div>
      <div className="nav__col nav__col--end">
        <Scramble as="a" href="mailto:shaxzod221007@gmail.com" text="CONTACT" />
      </div>
    </header>
  )
}
