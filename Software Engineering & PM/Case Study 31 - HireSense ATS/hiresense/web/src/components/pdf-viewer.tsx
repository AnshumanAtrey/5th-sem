"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Skeleton } from "@/components/ui/skeleton"

// Must be set in the module that renders <Document> (see react-pdf README).
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

/** Renders every page with pdf.js at the container's width, independent of the browser's PDF plugin. */
export default function PdfViewer({ url }: { url: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [pages, setPages] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    // Ignore scrollbar-sized changes (< 24px): re-rendering on them makes the scrollbar toggle, which
    // changes the width again — an endless render loop in browsers without scrollbar-gutter support.
    const ro = new ResizeObserver(([e]) => {
      const next = Math.floor(e!.contentRect.width)
      setWidth((w) => (w && Math.abs(w - next) < 24 ? w : next))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="w-full">
      {width > 0 && (
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={<Skeleton className="aspect-[1/1.414] w-full rounded-none" />}
          error={<p className="p-6 text-sm text-destructive">Could not render this PDF.</p>}
        >
          {Array.from({ length: pages }, (_, i) => (
            <Page key={i} pageNumber={i + 1} width={width} renderAnnotationLayer={false} className="border-b last:border-0" />
          ))}
        </Document>
      )}
    </div>
  )
}
