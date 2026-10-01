import { PageHeader } from "@/components/page-header"
import { api, type JobSummary } from "@/lib/api"
import { UploadForm } from "./upload-form"

export const metadata = { title: "Upload résumé" }

export default async function UploadPage({ searchParams }: PageProps<"/upload">) {
  const sp = await searchParams
  const jobs = await api<JobSummary[]>("/jobs")
  const job = typeof sp.job === "string" && jobs.some((j) => String(j.id) === sp.job) ? sp.job : String(jobs[0]?.id ?? "")
  return (
    <>
      <PageHeader
        title="Upload a résumé"
        description="The PDF is parsed (layout-aware, with a confidence score), screened with the role’s current criteria, logged and ranked immediately. The legacy parser runs alongside in shadow mode for comparison."
      />
      <UploadForm jobs={jobs.map((j) => ({ id: j.id, title: j.title, location: j.location }))} defaultJob={job} />
    </>
  )
}
