/** A titled section: a light serif heading and one short intro line. */
export function Section({ title, intro, children, id }: { title: string; intro?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="grid content-start gap-5">
      <div className="max-w-3xl">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">{title}</h2>
        {intro && <p className="mt-2 text-muted-foreground">{intro}</p>}
      </div>
      {children}
    </section>
  )
}
