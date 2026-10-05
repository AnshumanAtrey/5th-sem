import { PageTitle } from "@/components/page-title"

/** A tab that is planned but not built yet: what it will explain, in order. */
export function PlannedTab({ light, bold, intro, items }: { light: string; bold: string; intro: string; items: string[] }) {
  return (
    <div className="grid gap-10">
      <PageTitle light={light} bold={bold}>{intro}</PageTitle>
      <div className="max-w-3xl rounded-md border border-dashed p-6">
        <p className="mono-label text-orange-deep">Being built next. Here is what this tab will explain</p>
        <ol className="mt-4 grid list-decimal gap-2 pl-5">
          {items.map((i) => <li key={i}>{i}</li>)}
        </ol>
      </div>
    </div>
  )
}
