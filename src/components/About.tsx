const COLUMNS = [
  {
    label: 'HOW I WORK',
    body: 'Design in the browser as early as it survives. Figma holds the decisions; the code holds the truth. Whatever disagrees gets fixed in both.',
  },
  {
    label: 'WHAT I REACH FOR',
    body: 'TypeScript, and as little around it as the job tolerates. Canvas and WebGL when the interface has to move. Postgres when it has to remember.',
  },
  {
    label: 'WHAT I CARE ABOUT',
    body: 'Type that holds at every size. Motion with a reason. Pages that load before you notice they were loading.',
  },
  {
    label: 'RIGHT NOW',
    body: 'Taking on contract work from March. Interfaces with real complexity behind them are the ones worth talking about.',
  },
]

export function About() {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        <p className="about__lead">
          I design the thing and then I build it. No handoff, no spec that loses half its intent on the way to
          production, no waiting for someone else to make the animation feel right.
        </p>
        <div className="about__cols">
          {COLUMNS.map((col) => (
            <div key={col.label}>
              <span className="lab">{col.label}</span>
              <p>{col.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
