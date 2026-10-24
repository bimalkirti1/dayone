export type DashboardSite = {
  slug: string
  name: string
  url: string
  direction: string
  createdAt: string
  updatedAt: string
}

export async function listMySites(signal?: AbortSignal): Promise<DashboardSite[]> {
  const response = await fetch("/api/dashboard/sites", { signal, credentials: "same-origin" })
  if (!response.ok) {
    throw new Error(response.status === 401
      ? "Your session expired. Please sign in again."
      : "Your websites could not be loaded. Please try again.")
  }
  const data = await response.json() as { sites: DashboardSite[] }
  return data.sites
}
