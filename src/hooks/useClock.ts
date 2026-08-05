import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tashkent',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function format() {
  return fmt.format(new Date()).replace(',', '').toUpperCase()
}

export function useClock() {
  const [time, setTime] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
