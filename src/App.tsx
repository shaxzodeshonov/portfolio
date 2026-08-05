import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { IndexTable } from './components/IndexTable'
import { Tiles } from './components/Tiles'
import { About } from './components/About'
import { Footer } from './components/Footer'
import { CursorLabel } from './components/CursorLabel'
import { Loader } from './components/Loader'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggle } = useTheme()

  return (
    <>
      <Loader />

      <a className="skip" href="#index">Skip to work</a>

      <Nav theme={theme} onToggleTheme={toggle} />

      <main id="top">
        <Hero />
        <IndexTable />
        <Tiles />
        <About />
      </main>

      <Footer />

      <CursorLabel />
    </>
  )
}

export default App
