/** The walrussecuritas.com headline: a light serif line, then a bold grotesk line. */
export function PageTitle({ light, bold, children }: { light: string; bold: string; children?: React.ReactNode }) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
        <span className="block font-serif font-light">{light}</span>
        <span className="block font-semibold">{bold}</span>
      </h1>
      {children && <p className="mt-4 text-lg text-muted-foreground">{children}</p>}
    </header>
  )
}
